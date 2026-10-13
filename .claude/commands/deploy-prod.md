---
description: Deploy a specific, already-tested version to the real Azure "prod" environment
---

Deploy a specific version to the Azure Container Apps "prod" environment. If the user gave an
argument, treat it as the version to deploy (a commit SHA, short or full, or a loose description
like "the one before the login fix" — search recent commit/PR history on `main` to resolve it).
Optional argument: $ARGUMENTS

This is the only command in this repo that touches real cloud infrastructure. "dev" and "test"
are both local Docker Compose profiles (see /deploy-test) — nothing about them involves Azure.
Deploying never runs `az` locally — it always goes through the `deploy.yml` GitHub Actions
workflow, since local `az` may not reliably reach Azure's management API on this machine/network.

Steps:
1. If no argument was given, find the most recent **successful** run of the
   "Build and push images to ACR" workflow on `main` (`gh run list`), not just the latest commit —
   it must be a commit that actually got built and pushed, not one that failed CI. Get its commit
   SHA, message, author, and when it merged.
2. Show the user that commit in plain language (short SHA, message, how long ago) and ask them to
   confirm this is what they want to deploy — never deploy without this confirmation, even if the
   command was invoked directly.
3. Trigger the deploy: `gh workflow run deploy.yml -f tag=<short-sha>` (the short, 7-character SHA
   - both `build-and-push.yml` and `deploy.yml` work with it).
4. Watch the run (`gh run watch`) and report success/failure plainly.
5. Report the production URLs once done:
   - Frontend: https://aiworkshop-frontend.whitesand-f146b069.westeurope.azurecontainerapps.io
   - Backend: https://aiworkshop-backend.whitesand-f146b069.westeurope.azurecontainerapps.io

Resource names, for reference (also in the "Azure infrastructure" section of this file):
resource group `ai-workshop-baseline`, registry `acraiworkshop.azurecr.io`, container apps
`aiworkshop-backend` / `aiworkshop-frontend`.

Never run this command automatically as a side effect of another task. It must be invoked directly
by the user.
