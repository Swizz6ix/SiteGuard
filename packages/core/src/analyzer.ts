import type { Finding } from '@siteguard/schemas';
export interface AnalyzerContext { projectRoot: string; files: readonly string[]; signal?: AbortSignal; }
export interface Analyzer { readonly id: string; readonly name: string; readonly description: string; analyze(context: AnalyzerContext): Promise<readonly Finding[]>; }
