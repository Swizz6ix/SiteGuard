
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';

import type { Analyzer, AnalyzerContext } from '@siteguard/core';
import type { Finding } from '@siteguard/schemas';

const execFileAsync = promisify(execFile);

interface KnipOutput {
  files: unknown[];
  issues: unknown[];
}

const ISSUE_SEVERITY: Record<string, Finding['severity']> = {
  files: 'medium',
  dependencies: 'medium',
  unlisted: 'high',
  unresolved: 'high',
  exports: 'low',
  nsExports: 'low',
  classMembers: 'low',
  types: 'low',
  nsTypes: 'low',
  enumMembers: 'low',
  duplicates: 'low',
  catalog: 'medium',
};

function parseOutput(output: string): KnipOutput {
  let value: unknown;

  try {
    value = JSON.parse(output);
  } catch {
    throw new Error('Knip returned invalid JSON.');
  }

  if (
    typeof value !== 'object' ||
    value === null ||
    !('files' in value) ||
    !Array.isArray(value.files) ||
    !('issues' in value) ||
    !Array.isArray(value.issues)
  ) {
    throw new Error('Knip returned an unexpected JSON structure.');
  }

  return value as KnipOutput;
}

function makeFinding(
  category: string,
  file: string,
  detail: string,
): Finding {
  const normalizedFile = file.replaceAll('\\', '/');
  const severity = ISSUE_SEVERITY[category] ?? 'medium';

  return {
    id: `knip:${category}:${normalizedFile}:${detail}`,
    source: 'knip',
    category: `unused-${category}`,
    severity,
    confidence: 'high',
    disposition: 'review',
    title: `Knip: ${category} issue`,
    description: detail,
    file: normalizedFile,
    recommendation:
      'Review the finding and confirm it is safe to remove or correct.',
    automatedFixAvailable: false,
    evidence: { category, file: normalizedFile, detail },
  };
}

function findingsFromIssues(issues: unknown[]): Finding[] {
  const findings: Finding[] = [];

  for (const issue of issues) {
    if (typeof issue !== 'object' || issue === null) {
      throw new Error('Knip returned an invalid issue entry.');
    }

    const record = issue as Record<string, unknown>;
    const file =
      typeof record.file === 'string' ? record.file : '(workspace)';

    for (const [category, values] of Object.entries(record)) {
      if (category === 'file' || category === 'workspace') continue;

      if (!Array.isArray(values)) {
        if (values !== undefined && values !== null) {
          throw new Error(
            `Knip returned an unexpected "${category}" issue value.`,
          );
        }
        continue;
      }

      for (const value of values) {
        const detail =
          typeof value === 'string'
            ? value
            : JSON.stringify(value);

        findings.push(makeFinding(category, file, detail));
      }
    }
  }

  return findings;
}

export class KnipAnalyzer implements Analyzer {
  readonly id = 'knip';
  readonly name = 'Knip dead-code analysis';
  readonly description =
    'Detects unused files, exports, dependencies, and related issues using Knip.';

  async analyze(context: AnalyzerContext): Promise<readonly Finding[]> {
    const projectRoot = path.resolve(context.projectRoot);

    if (context.signal?.aborted) {
      throw new Error('Knip analysis aborted.');
    }

    let stdout: string;

    try {
      const command =
        process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';

      const result = await execFileAsync(
        command,
        ['exec', 'knip', '--reporter', 'json', '--no-progress'],
        {
          cwd: projectRoot,
          encoding: 'utf8',
          maxBuffer: 10 * 1024 * 1024,
          windowsHide: true,
          signal: context.signal,
        },
      );

      stdout = result.stdout;
    } catch (error) {
      // Knip can exit non-zero when it finds issues. Its JSON may be
      // available on stdout even when execFile rejects.
      const result = error as {
        stdout?: string;
        stderr?: string;
        code?: number | string;
        message?: string;
      };

      if (typeof result.stdout !== 'string' || !result.stdout.trim()) {
        throw new Error(
          `Knip execution failed: ${result.message ?? 'unknown error'}`,
        );
      }

      stdout = result.stdout;
    }

    const output = parseOutput(stdout);
    const findings: Finding[] = [];

    for (const file of output.files) {
      if (typeof file !== 'string' || !file.trim()) {
        throw new Error('Knip returned an invalid unused-file entry.');
      }

      findings.push(
        makeFinding(
          'files',
          file,
          `Knip identified "${file}" as an unused file.`,
        ),
      );
    }

    findings.push(...findingsFromIssues(output.issues));

    return findings;
  }
}
