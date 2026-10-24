# Dead-code policy

## Finding handling

- **Safe candidate:** clearly unused local import or symbol with a complete static reference graph. Still review the diff before removal.
- **Human review:** unused export, source file, package dependency, or configuration whose runtime references cannot be proven absent.
- **Protected:** framework entry points, route handlers, layouts, middleware/proxy files, configuration, migration/schema files, generated files, and externally invoked APIs. Never auto-delete these.

## Knip limitations

Static analysis cannot reliably discover every dynamic import, reflection-based lookup, plugin registration, Sanity document type, environment-driven module, or external URL consumer. A Knip report is evidence for review, not proof that a file is safe to delete.

## Rollout policy

1. Run against fixtures and the target repository.
2. Save the report as a CI artifact.
3. Establish a reviewed baseline for existing findings.
4. Fail CI only on new, policy-defined high-confidence findings.
5. Never make deletion or deployment decisions from an AI-generated explanation alone.
