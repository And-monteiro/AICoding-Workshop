# AI Workshop demo

A small hello-world app used to show how to work with Claude Code in a production-style setup.
A React frontend reads messages from a Postgres database through a C#/.NET API, and everything
runs in Docker Compose locally and on Azure Container Apps in production.

The page also has an image card with a magnifier button that opens a zoom popup. It is the feature
the workshop uses to demonstrate the test gate.

**Live (prod):** https://aiworkshop-frontend.whitesand-f146b069.westeurope.azurecontainerapps.io

## Stack

| Part | Tech | Folder |
|---|---|---|
| Frontend | React + TypeScript, Vite, served by nginx | `frontend/` |
| Backend | C# / .NET 9 minimal API, Npgsql | `backend/` |
| Database | Postgres 16 | image `postgres:16-alpine` |
| Local environments | Docker Compose profiles | `docker-compose.yml` |
| CI/CD | GitHub Actions to Azure Container Registry and Azure Container Apps | `.github/workflows/` |

## Prerequisites

- Docker Desktop. Everything else (Node, .NET) runs inside containers.
- Git and the GitHub CLI (`gh`) if you want to use the deploy commands.

## Run it locally

There are two local environments, `dev` and `test`. Each has its own Compose project name so both can
run side by side.

| | Frontend | Backend | Database |
|---|---|---|---|
| dev | http://localhost:3000 | http://localhost:8080 | localhost:5432 |
| test | http://localhost:3001 | http://localhost:8081 | localhost:5433 |

First, create `.env.dev` and `.env.test` in the repo root. They are git-ignored and only hold local,
non-secret values. Use these variables (example for dev; for test use `APP_ENV=test`, ports
`3001` / `8081` / `5433` and a different database name):

```
APP_ENV=dev
FRONTEND_PORT=3000
BACKEND_PORT=8080
VITE_API_URL=http://localhost:8080
POSTGRES_DB=app_dev
POSTGRES_USER=workshop
POSTGRES_PASSWORD=<pick a local-only password>
DB_PORT=5432
```

Then start an environment:

```bash
docker compose -p aiworkshop-dev --profile dev --env-file .env.dev up --build
```

```bash
docker compose -p aiworkshop-test --profile test --env-file .env.test up --build
```

Stop them with `docker compose -p aiworkshop-dev down` and `docker compose -p aiworkshop-test down`.

## Run the tests

Tests run in throwaway containers, so nothing needs to be installed locally.

```bash
docker compose -p aiworkshop-test --profile tests --env-file .env.test run --rm --build backend-tests
```

```bash
docker compose -p aiworkshop-test --profile tests --env-file .env.test run --rm --build frontend-tests
```

## Deploy commands (Claude Code)

The project defines two slash commands in `.claude/commands/`. Both run the tests first and stop if
any test fails.

- `/deploy-test` runs the test gate, then builds and starts the local `test` environment.
- `/deploy-prod` runs the test gate, then branches, commits, opens a PR, merges it, waits for the
  image build and deploys that commit to Azure through GitHub Actions.

## Project layout

```
backend/            .NET API (Program.cs) and Backend.Tests/ (xUnit)
frontend/           React app, with Vitest tests next to the components
docker-compose.yml  dev, test and tests profiles
.github/workflows/  build-and-push.yml (images to ACR) and deploy.yml (deploy to Azure)
.claude/commands/   /deploy-test and /deploy-prod
CLAUDE.md           project rules and Azure setup notes for Claude Code
```

## Contributing

- Never commit to `main`. Work on `feature/<name>` or `fix/<name>` and open a pull request.
- Pushes to `main` that touch `frontend/` or `backend/` build and push new images to the registry.
- See `CLAUDE.md` for the full conventions, guardrails and Azure infrastructure notes.
