# SiteGuard

SiteGuard is a production-grade codebase and website quality gate.

## Engineering principle

**Deterministic analysis → runtime evidence → AI reasoning → policy engine → human approval**

AI is not the source of truth for static facts or deployment decisions.

## v0.1 foundation

This repository currently contains:

- pnpm + Turborepo monorepo
- Node.js 22 baseline
- TypeScript strict configuration
- Zod-based universal finding schemas
- Audit and health result schemas
- `siteguard health`
- Unit tests with Vitest
- Baseline GitHub Actions CI
- Dependabot configuration

## Development

```bash
pnpm install
pnpm build
pnpm test
pnpm type-check
pnpm health
```

CLI:

```bash
pnpm siteguard --help
pnpm siteguard health
pnpm siteguard health --json
```

## Planned v1 packages

- `core`
- `analyzers`
- `browser`
- `content`
- `accessibility`
- `performance`
- `security`
- `ai`
- `agent`
- `policy`
- `reporters`

The implementation will be added incrementally so every stage remains testable and usable.

## Deterministic engine

The first engine layer is now present:

- `@siteguard/core` defines the analyzer contract and audit engine.
- `@siteguard/analyzers` contains the first deterministic TypeScript unused-import analyzer.
- Findings use the shared `@siteguard/schemas` model.
- `siteguard audit` runs without AI.

Example:

```bash
pnpm siteguard audit --project ../my-project
pnpm siteguard audit --project ../my-project --json
```

The unused-import analyzer is intentionally conservative. It is not yet a whole-program dead-code detector; deeper graph analysis will use the TypeScript compiler and dedicated dependency analysis.


## Dead-code and dependency analysis (Knip)

Knip uses project entry points and the TypeScript-aware dependency graph to report likely unused files, exports, and dependencies. It is an audit tool: SiteGuard does not automatically delete anything based on its output.

```bash
pnpm dead-code
pnpm dependency-audit
```

Review the configured entry points before trusting unused-file findings. Framework conventions, dynamic imports, Sanity schemas, Next.js route handlers, and externally invoked endpoints can be invisible to static graph analysis. Keep framework entry points and runtime-discovered files explicitly configured or ignored, then require human approval before removal.
