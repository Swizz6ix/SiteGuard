import { z } from 'zod';

export const findingSourceSchema = z.enum([
  'typescript',
  'eslint',
  'knip',
  'dependency',
  'accessibility',
  'performance',
  'security',
  'content',
  'ai',
  'browser',
]);

export type FindingSource = z.infer<typeof findingSourceSchema>;

export const findingSeveritySchema = z.enum([
  'info',
  'low',
  'medium',
  'high',
  'critical',
]);

export type FindingSeverity = z.infer<typeof findingSeveritySchema>;

export const findingConfidenceSchema = z.enum([
  'certain',
  'high',
  'medium',
  'low',
]);

export type FindingConfidence = z.infer<typeof findingConfidenceSchema>;

export const findingDispositionSchema = z.enum([
  'safe',
  'review',
  'block',
]);

export type FindingDisposition = z.infer<typeof findingDispositionSchema>;

export const findingSchema = z.object({
  id: z.string().min(1),
  source: findingSourceSchema,
  category: z.string().min(1),
  severity: findingSeveritySchema,
  confidence: findingConfidenceSchema,
  disposition: findingDispositionSchema,
  title: z.string().min(1),
  description: z.string().min(1),
  file: z.string().min(1).optional(),
  line: z.number().int().positive().optional(),
  column: z.number().int().positive().optional(),
  evidence: z.unknown().optional(),
  recommendation: z.string().min(1).optional(),
  automatedFixAvailable: z.boolean().optional(),
  aiReviewed: z.boolean().optional(),
});

export type Finding = z.infer<typeof findingSchema>;
