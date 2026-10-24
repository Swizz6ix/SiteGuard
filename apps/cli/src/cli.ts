#!/usr/bin/env node
import path from 'node:path';
import { Command } from 'commander'; import { runAudit } from '@siteguard/core'; 
import { runHealth } from './commands/health.js';
import {
  KnipAnalyzer,
  TypeScriptUnusedImportAnalyzer,
} from '@siteguard/analyzers';
import { discoverSourceFiles } from './utils/files.js';

const program = new Command(); program.name('siteguard').description(
  'Production-grade codebase and website quality gate'
).version('0.1.0');

program.command('health').description(
  'Run local SiteGuard health checks'
).option('--json').action((options:{json?:boolean})=>{const result=runHealth(); 

console.log(
  options.json?JSON.stringify(result,null,2):[
    `SiteGuard health`,`status: ${result.status}`,
    `version: ${result.version}`,
    ...Object.entries(result.checks).map(([k,v])=>`${k}: ${v}`)
  ].join('\n'));});

program.command('audit').description(
  'Run deterministic source analysis'
).option('--project <path>','Project root',
  process.cwd()).option('--json').action(async (options: { project: string; json?: boolean }) => {
  const project = path.resolve(options.project);
  const files = await discoverSourceFiles(project);

  const result = await runAudit(
    { projectRoot: project, files },
    {
      version: '0.1.0',
      analyzers: [
        new TypeScriptUnusedImportAnalyzer(),
        new KnipAnalyzer(),
      ],
    },
  );

  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`SiteGuard audit: ${result.status.toUpperCase()}`);
    console.log(`score: ${result.score}/100`);
    console.log(`files scanned: ${files.length}`);
    console.log(`findings: ${result.findings.length}`);

    for (const finding of result.findings) {
      const location = finding.file
        ? ` — ${finding.file}${finding.line ? `:${finding.line}` : ''}`
        : '';

      console.log(
        `[${finding.severity}] ${finding.title}${location}`,
      );
    }
  }

  process.exitCode = result.status === 'fail' ? 1 : 0;
});