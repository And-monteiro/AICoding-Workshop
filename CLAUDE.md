# CLAUDE.md

## Project overview

Hello-world demo app: a frontend that reads a message from a database via a backend API.

Stack: React + C#/.NET + Postgres, containerized with Docker Compose.

Used as a workshop sample to show how to work with Claude Code in a production-style setup.

## Environment and commands

This project uses Docker Compose profiles instead of separate environments per stack:

- Start dev environment: `docker compose --profile dev --env-file .env.dev up`
- Start test environment: `docker compose --profile test --env-file .env.test up`
- Run backend tests: `docker compose exec backend dotnet test`
- Run frontend tests: `docker compose exec frontend npm test`
- Stop everything: `docker compose down`

Always confirm which profile (`dev` or `test`) is intended before running compose commands — never assume.

## Git / PR workflow

- Repo: [And-monteiro/AICoding-Workshop](https://github.com/And-monteiro/AICoding-Workshop) on GitHub.
- Never commit directly to `main`. Create a feature branch for any change.
- Branch naming: `feature/<short-description>` or `fix/<short-description>`.
- Write commit messages that explain why, not just what changed.
- Do not push code, open a PR, or merge anything without the user first approving the actual
  change (e.g. "that's good", "push this"). That one approval covers the entire rest of the flow:
  push the branch, open the PR, and merge it into `main` — do all of it in one go, without asking
  again at the PR or merge step. Only pause mid-flow if something unexpected comes up (e.g. a
  merge conflict, a failing check) — otherwise don't wait for a second confirmation.
- Still always work on a feature branch and open a PR rather than committing straight to `main` —
  this is about not re-asking for permission already given, not about skipping the PR step.

## Conventions

- Frontend: React with TypeScript, ESLint + Prettier for linting/formatting.
- Backend: C#/.NET, follow standard .NET naming conventions (PascalCase for types/methods, camelCase for locals), `dotnet format` for formatting.
- React components: PascalCase for component names and their files (e.g. `MessageCard.tsx`).
- Keep configuration (ports, DB names, env-specific values) in `.env.dev` / `.env.test`, not hardcoded.

## Guardrails

- Do not modify infrastructure/deploy configuration (GitHub Actions workflows, Azure/Bicep/Terraform files) without calling it out first.
- Do not run deploy commands against the test or production infra without explicit confirmation.
- Treat `.env.*` files as containing non-production, workshop-only values — never put real secrets in them.
