# Contributing to Llenroc Tech

## Purpose

This repository follows enterprise software engineering practices to maintain quality, consistency, security, and long-term maintainability. These standards apply to human contributors and AI coding assistants working on source code, infrastructure, documentation, or release activities.

## Development Workflow

1. Create a focused feature or fix branch from the current `develop` branch.
2. Implement the smallest complete change that satisfies the requirement.
3. Run the appropriate reviews defined in the [`.agents`](.agents/README.md) framework.
4. Build, test, lint, and validate the affected application locally.
5. Open a pull request into `develop` and complete the required review and testing.
6. Promote validated changes through a `release/vX.Y.Z` branch created for the intended release.
7. Merge the approved release branch into `main` without rewriting protected-branch history.
8. Tag the production release using [Semantic Versioning](https://semver.org/).

Keep branches focused and synchronize them with their intended base before requesting review. Do not bypass required reviews, checks, or protected-branch rules.

## AI Agent Workflow

Before making a significant change, consult the agent definitions relevant to the work. Cross-cutting changes may require several agents; use the smallest set that provides adequate architectural, security, user-experience, and release coverage.

| Task | Recommended agent |
| --- | --- |
| Angular Development | [`angular-architect`](.agents/angular-architect.md) |
| Spring Boot Development | [`springboot-architect`](.agents/springboot-architect.md) |
| AI Features | [`ai-platform`](.agents/ai-platform.md) |
| Security Review | [`security-review`](.agents/security-review.md) |
| UI Improvements | [`ui-review`](.agents/ui-review.md) |
| Netlify Deployment | [`netlify-review`](.agents/netlify-review.md) |
| Documentation | [`documentation`](.agents/documentation.md) |
| Pull Request Review | [`github-review`](.agents/github-review.md) |
| Production Release | [`release-manager`](.agents/release-manager.md) |

Agent definitions provide review guidance and safety boundaries. They do not grant permission to commit, push, merge, deploy, change external systems, or broaden the requested scope.

## Code Standards

Contributions should:

- Apply Clean Architecture and SOLID principles where they improve separation of concerns, testability, and maintainability.
- Follow the Angular Style Guide and the repository's established Angular architecture.
- Follow Spring Boot and Java best practices for API design, validation, security, transactions, logging, and testing.
- Preserve existing design patterns unless an intentional architectural change is documented and approved.
- Use small, focused commits with meaningful, imperative commit messages.
- Never commit secrets, credentials, private keys, sensitive customer data, or local environment files.
- Add or update documentation when behavior, configuration, architecture, or operating procedures change.
- Maintain keyboard access, semantic structure, readable contrast, and other accessibility requirements.
- Maintain responsive behavior across supported mobile, tablet, and desktop layouts.
- Avoid unnecessary dependencies, duplication, premature abstraction, and unrelated refactoring.
- Add tests or validation appropriate to the risk and scope of the change.

## Pull Requests

Every pull request should be reviewable, focused, and linked to its underlying requirement or issue when one exists. Include:

- **Purpose:** the problem or business need addressed.
- **Summary:** the principal implementation and documentation changes.
- **Testing:** commands run and relevant manual validation results.
- **Screenshots:** before-and-after evidence for visible UI changes, when applicable.
- **Risks:** security, compatibility, migration, performance, accessibility, or operational concerns.
- **Rollback considerations:** how the change can be safely reverted or disabled if necessary.

Call out unresolved questions, known limitations, configuration changes, and follow-up work. Do not claim that validation was completed unless it was actually performed.

## Production Releases

Use the following promotion path:

```text
develop
  |
  v
release/vX.Y.Z
  |
  v
main
  |
  v
Git tag
  |
  v
Production deployment
```

Production releases must be validated before merging into `main`. At minimum, confirm the production build, automated tests, deployment configuration, environment-variable requirements, routing, security-sensitive behavior, rollback readiness, and release notes. Apply the `release-manager`, `security-review`, and platform-specific agent guidance as appropriate.

Version tags must follow Semantic Versioning:

- `MAJOR` for incompatible changes.
- `MINOR` for backward-compatible functionality.
- `PATCH` for backward-compatible fixes.

Do not force-push protected branches or deploy unreviewed work to production.

## AI Assistant Guidance

AI coding assistants, including Codex, ChatGPT, GitHub Copilot, and Claude, should:

- Read repository documentation and inspect the existing implementation before proposing changes.
- Use the appropriate `.agents` definition before making significant changes.
- Preserve established architecture, conventions, public contracts, and visual identity.
- Avoid introducing dependencies unless they are necessary, maintained, secure, and justified.
- Never expose, print, move, or commit secrets or sensitive information.
- Never modify unrelated files or discard contributor work.
- Explain significant architectural decisions, assumptions, tradeoffs, and migration effects.
- Prefer clear, maintainable implementations over clever or unnecessarily complex solutions.
- Validate changes in proportion to risk and report commands and results accurately.
- Ask for authorization before performing destructive actions or changing external systems.

AI-generated changes remain subject to the same human review, testing, security, and release requirements as any other contribution.

## Repository Philosophy

Llenroc Tech values:

- Enterprise quality
- Simplicity
- Maintainability
- Security
- Performance
- Accessibility
- Scalability
- Professional documentation

Every contribution should leave the repository easier to understand, safer to operate, and more dependable for the people who maintain and use it.
