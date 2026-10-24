import { describe, expect, it } from 'vitest';
import { runHealth } from '../src/commands/health.js';

describe('runHealth', () => {
  it('returns a healthy baseline', () => {
    const result = runHealth();

    expect(result.status).toBe('healthy');
    expect(result.checks.runtime).toBe('pass');
    expect(result.checks.config).toBe('pass');
    expect(result.checks.analyzers).toBe('pass');
    expect(result.checks.playwright).toBe('pass');
  });
});
