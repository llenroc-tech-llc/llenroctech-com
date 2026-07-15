# Llenroc Tech Engineering Agents

This directory defines reusable review and engineering roles for Llenroc Tech repositories. Each agent provides a consistent purpose, scope, rules, output contract, and safety boundary. The definitions guide Codex or another engineering assistant; they do not grant permission to modify code, infrastructure, branches, or external systems.

## Agent catalog

| Agent | Use it when |
| --- | --- |
| [Angular Architect](angular-architect.md) | Designing or reviewing Angular architecture, routing, state, performance, accessibility, or tests. |
| [Spring Boot Architect](springboot-architect.md) | Designing or reviewing Java 21, Spring Boot, REST, persistence, security, or service tests. |
| [AI Platform](ai-platform.md) | Reviewing AI UX, Azure OpenAI integration, prompts, grounding, evaluation, reliability, or cost. |
| [Security Review](security-review.md) | Auditing secrets, attack surfaces, dependencies, authentication, authorization, or sensitive data. |
| [Release Manager](release-manager.md) | Preparing builds, releases, deployment checks, release notes, smoke tests, or rollback plans. |
| [GitHub Review](github-review.md) | Reviewing branches, commits, pull requests, rulesets, versioning, or repository hygiene. |
| [Netlify Review](netlify-review.md) | Reviewing Netlify builds, redirects, Functions, Forms, environment variables, or deployment behavior. |
| [Documentation](documentation.md) | Updating READMEs, architecture docs, ADRs, API docs, changelogs, or runbooks. |
| [UI Review](ui-review.md) | Auditing accessibility, mobile behavior, themes, typography, layout, controls, or interaction states. |

Use the smallest set of agents that covers the task. For cross-cutting changes, state the order of review; for example: Angular Architect, Security Review, UI Review, then Release Manager.

## Example Codex prompts

```text
Use .agents/angular-architect.md to review this Angular change. Report findings first, then recommend a minimal implementation and validation plan.
```

```text
Use .agents/ai-platform.md and .agents/security-review.md to trace the AI assistant request flow from browser to Azure OpenAI. Do not modify code.
```

```text
Use .agents/netlify-review.md to audit netlify.toml, redirects, Forms, and Functions. Identify active and legacy behavior with file and line references.
```

```text
Use .agents/ui-review.md to test the drawer at mobile, tablet, desktop, light mode, dark mode, keyboard navigation, and reduced motion.
```

```text
Use .agents/release-manager.md and .agents/github-review.md to prepare a release checklist. Do not commit, push, merge, or deploy.
```

## Adding an agent

1. Confirm that an existing role cannot cover the responsibility cleanly.
2. Use a lowercase, hyphenated filename ending in `.md`.
3. Include the standard sections: Purpose, Responsibilities, Rules, Expected output, and Never do.
4. Keep guidance technology-aware but reusable across Llenroc Tech repositories.
5. Define authorization boundaries explicitly, especially for security, Git, releases, data, and external systems.
6. Add the agent to the catalog above with a clear use case and example prompt when helpful.
7. Review definitions periodically as supported platforms, versions, and company practices change.

## Operating principles

- Inspect before changing.
- Preserve user work and unrelated files.
- Prefer evidence, exact references, and reproducible validation.
- Keep secrets and sensitive data out of prompts, logs, source control, and reports.
- Use protected-branch and least-privilege workflows.
- Distinguish completed work from recommendations and planned capabilities.
- Never claim legal, regulatory, security, or deployment guarantees.
