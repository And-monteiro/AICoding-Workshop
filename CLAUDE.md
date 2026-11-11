# CLAUDE.md

## Project overview

Hello-world demo app: a frontend that reads a message from a database via a backend API.

Stack: React + C#/.NET + Postgres, containerized with Docker Compose.

Used as a workshop sample to show how to work with Claude Code in a production-style setup.

## Environment and commands

This project uses Docker Compose profiles instead of separate environments per stack. Dev and test
must each use their own Compose **project name** (`-p`) - without it, both profiles' containers
share the same default names and starting one silently tears down and replaces the other instead
of running alongside it:

- Start dev environment: `docker compose -p aiworkshop-dev --profile dev --env-file .env.dev up`
- Start test environment: `docker compose -p aiworkshop-test --profile test --env-file .env.test up`
- Run backend tests: `docker compose -p aiworkshop-test --profile tests --env-file .env.test run --rm --build backend-tests`
- Run frontend tests: `docker compose -p aiworkshop-test --profile tests --env-file .env.test run --rm --build frontend-tests`
  (the tests run in throwaway containers built from the `test` stage of each Dockerfile; the runtime
  images have no SDK/Node, so `exec` into the running containers does not work for tests)
- `/deploy-test` and `/deploy-prod` both run these two suites first and abort if either fails.
- Stop dev: `docker compose -p aiworkshop-dev down`
- Stop test: `docker compose -p aiworkshop-test down`

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

## Azure infrastructure (current state, as of 2026-10-13)

Manually provisioned via the Azure Portal (personal Azure account, not the OutSystems corporate
one — local `az` CLI is blocked by endpoint policy on this machine, so all infra work so far has
been done by hand in the Portal, with image builds/pushes handled by GitHub Actions instead).

- Resource group: `ai-workshop-baseline`, region **West Europe**.
- `acraiworkshop` — Azure Container Registry, Basic tier. Holds `backend` and `frontend` images,
  built and pushed automatically by `.github/workflows/build-and-push.yml` on every push to `main`
  that touches `frontend/**` or `backend/**` (or via manual `workflow_dispatch`). This is the one
  resource with a real fixed cost (~$0.17/day) that keeps accruing until deleted.
- `env-ai-workshop` — the shared Container Apps Environment all three apps below live in.
- `aiworkshop-backend` — Container App, image `acraiworkshop.azurecr.io/backend:latest`, ingress
  external/HTTP, **target port 8080** (must match the Dockerfile's `ASPNETCORE_URLS`), health
  probes (startup/liveness/readiness) pointed at **`/health`**, not the default `/` (the backend
  has no `/` route, so the platform default probe path fails and crash-loops the container).
- `aiworkshop-frontend` — Container App, image `acraiworkshop.azurecr.io/frontend:latest`, ingress
  external/HTTP, target port 80 (nginx default).
- `aiworkshop-db` — Container App running the public `postgres:16-alpine` image directly (not
  pushed to ACR). Ingress is **internal-only, TCP, target port 5432**. Env vars `POSTGRES_DB=app_prod`,
  `POSTGRES_USER=workshop`, `POSTGRES_PASSWORD` set directly as a plain env var (not a proper
  Container Apps secret - acceptable for this throwaway demo, not a pattern to carry into anything
  real). Deliberately left at **min replicas 0** (scales to zero when idle) to avoid an always-on
  cost, in favor of managed Postgres which would have cost far more on its default tier.
- **Important gotcha**: for TCP ingress specifically, other apps in the same environment must
  reach this app by its **short name** (`aiworkshop-db`), not the longer
  `*.internal.<env-id>.<region>.azurecontainerapps.io` hostname that HTTP-ingress apps get shown
  on their Overview page. Using the long hostname for a TCP-ingress app silently fails to connect.
- The backend's `ConnectionStrings__Default` env var is therefore:
  `Host=aiworkshop-db;Port=5432;Database=app_prod;Username=workshop;Password=<see Portal>`.
- The backend self-seeds its schema on startup (see `backend/Program.cs`,
  `EnsureDatabaseSeededAsync`) as a **background task with retry/backoff**, not a blocking call -
  this is required because `aiworkshop-db` can be cold (scaled to zero) when the backend starts,
  and a blocking/unretried connection attempt crashed the whole app on an unhandled exception.
- End-to-end verified working at `https://aiworkshop-frontend.whitesand-f146b069.westeurope.azurecontainerapps.io`.

### Deploying to prod (set up 2026-10-13)

Local `az` CLI works now (an admin reinstall via `winget` fixed the earlier "Access is denied"
local-execution block), but calling Azure's management API from this machine/network still fails
with a connection reset (`az login` gets past device-code auth, then the connection drops while
fetching tenants/subscriptions) — looked like a corporate network/proxy interference, not fixed
yet. So actual deployment still doesn't run `az` locally; it goes through GitHub Actions instead:

- An Azure AD App Registration (`github-actions-ai-workshop`, client ID
  `44b06166-9b36-4e37-aba7-c8ef5b058a90`, tenant ID `b4f264f1-3585-4a18-a942-9e61b63e8b09`) has a
  federated OIDC credential scoped to this repo's `main` branch, and Contributor role on the
  `ai-workshop-baseline` resource group. No client secret is stored anywhere — auth is via GitHub's
  OIDC token exchange (`azure/login` action).
- Those three values (client ID, tenant ID, subscription ID) are GitHub repo secrets
  (`AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`), alongside the existing
  `ACR_USERNAME`/`ACR_PASSWORD` (which are unrelated - those only grant Docker push/pull to ACR,
  not any Azure Resource Manager access; they could never have been reused for deployment).
- `.github/workflows/deploy.yml` — `workflow_dispatch` with a `tag` input, logs into Azure via
  OIDC, runs `az containerapp update` for both `aiworkshop-backend` and `aiworkshop-frontend`.
  This `az` call runs on GitHub's runners, not this machine, so the local network issue doesn't
  affect it.
- `build-and-push.yml` now also tags images with a short 7-character SHA (in addition to `latest`
  and the full SHA), purely so tags are human-scannable in the registry and easy to pass around.
- `/deploy-prod` is filled in with the real resource names. It never requires typing a commit SHA
  by hand: with no argument, it finds the latest **successful** build on `main` via `gh run list`,
  confirms the commit with the user in plain language, then runs
  `gh workflow run deploy.yml -f tag=<short-sha>` to actually deploy.
- Verified end to end: several `Deploy to Azure (prod)` runs have succeeded via `/deploy-prod`.

### What's left to do

- Export/write a **Bicep template** for the resource group so it's reproducible as code instead of
  manual Portal clicks (the "before and after" of ClickOps vs IaC is a good workshop artifact in
  itself) - apply it the same way as deploys, via a GitHub Actions workflow using the OIDC
  credential above, for a second/throwaway resource group to prove it actually works before the
  "set up a fresh copy of this infra" part of the workshop depends on it.
- Try fixing the local `az` network issue (optional/lower priority, since GitHub Actions already
  covers real deployment needs) - worth checking whether it's the corporate VPN/proxy specifically
  by testing from a different network.
- The workshop demo: the image-zoom feature (magnifier button opens a popup) is on `main` with tests;
  a separate, deliberately bugged branch (zoom click does nothing) is used to show the test gate
  failing in `/deploy-test`, followed by a clean change passing both `/deploy-*` commands. The tests
  are intentionally minimal (zoom component, message list, backend `/health`).
