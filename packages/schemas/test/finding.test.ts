import { describe, expect, it } from 'vitest';
import { findingSchema } from '../src/finding.js';

describe('findingSchema', () => {
  it('accepts a valid finding', () => {
    const result = findingSchema.safeParse({
      id: 'unused-import:src/index.ts:1',
      source: 'typescript',
      category: 'unused-import',
      severity: 'low',
      confidence: 'certain',
      disposition: 'safe',
      title: 'Unused import',
      description: 'The imported symbol is never used.',
      file: 'src/index.ts',
      line: 1,
      recommendation: 'Remove the unused import.',
      automatedFixAvailable: true,
    });

    expect(result.success).toBe(true);
  });

  it('rejects an invalid severity', () => {
    const result = findingSchema.safeParse({
      id: 'bad',
      source: 'typescript',
      category: 'test',
      severity: 'urgent',
      confidence: 'certain',
      disposition: 'safe',
      title: 'Bad finding',
      description: 'Invalid severity.',
    });

    expect(result.success).toBe(false);
  });
});
