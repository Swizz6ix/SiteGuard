import { z } from 'zod';
import { findingSchema } from './finding.js';

export const auditStatusSchema = z.enum(['pass', 'warning', 'fail']);

export type AuditStatus = z.infer<typeof auditStatusSchema>;

export const auditResultSchema = z.object({
  version: z.string().min(1),
  status: auditStatusSchema,
  score: z.number().min(0).max(100),
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime(),
  findings: z.array(findingSchema),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export type AuditResult = z.infer<typeof auditResultSchema>;
