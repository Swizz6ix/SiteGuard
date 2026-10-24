import { readdir } from 'node:fs/promises';
import path from 'node:path';

const IGNORED_DIRECTORIES = new Set([
  '.git',
  '.next',
  '.turbo',
  'coverage',
  'dist',
  'node_modules',
  'out',
]);

const SOURCE_FILE = /\.(?:ts|tsx|js|jsx|mjs|cjs)$/;

export async function discoverSourceFiles(
  projectRoot: string,
): Promise<string[]> {
  const root = path.resolve(projectRoot);
  const files: string[] = [];

  async function visit(directory: string): Promise<void> {
    const entries = await readdir(directory, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.name.startsWith('.') && entry.name !== '.storybook') {
        continue;
      }

      const absolutePath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        if (!IGNORED_DIRECTORIES.has(entry.name)) {
          await visit(absolutePath);
        }
        continue;
      }

      if (entry.isFile() && SOURCE_FILE.test(entry.name)) {
        files.push(path.relative(root, absolutePath).replaceAll('\\', '/'));
      }
    }
  }

  await visit(root);
  return files.sort();
}
