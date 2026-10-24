import { z } from 'zod';

export const healthCheckStatusSchema = z.enum(['pass', 'fail']);

export const healthResultSchema = z.object({
  status: z.enum(['healthy', 'unhealthy']),
  version: z.string().min(1),
  checks: z.object({
    runtime: healthCheckStatusSchema,
    config: healthCheckStatusSchema,
    analyzers: healthCheckStatusSchema,
    playwright: healthCheckStatusSchema,
  }),
});

export type HealthResult = z.infer<typeof healthResultSchema>;
