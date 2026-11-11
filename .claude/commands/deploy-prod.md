---
description: Ship local changes to GitHub (branch, PR, merge) and deploy that commit to the real Azure "prod" environment
---

Deploy a version to the Azure Container Apps "prod" environment. This is a workshop demo, so the
whole flow runs on one approval given when the command is invoked. Don't stop to ask again between
steps unless something fails.

If the user gave an argument, treat it as the version to deploy (a commit SHA, short or full, or a
loose description like "the one before the login fix" — search recent commit/PR history on `main`
to resolve it). Optional argument: $ARGUMENTS

This is the only command in this repo that touches real cloud infrastructure. "dev" and "test"
are both local Docker Compose profiles (see /deploy-test) — nothing about them involves Azure.
Deploying never runs `az` locally — it always goes through the `deploy.yml` GitHub Actions
workflow, since local `az` may not reliably reach Azure's management API on this machine/network.

Steps:
1. **Local changes (default when there is no argument).** If `git status` shows uncommitted changes
   to the app code, ship them:
   - **Test gate first, before any branch, commit or push.** Run both suites against the working tree
     (same commands as /deploy-test step 2):
     `docker compose -p aiworkshop-test --profile tests --env-file .env.test run --rm --build backend-tests`
     and `... run --rm --build frontend-tests`. Run both even if the first fails. If either fails,
     report `TEST GATE FAILED` with the suite and failing tests, state that nothing was branched,
     committed, pushed or deployed, and **stop**. Never skip, weaken or work around the gate. On success,
     report `TEST GATE PASSED` (tests per suite) in one line and continue.
   - Create a branch `fix/<short-description>` (or `feature/...`) from the current state. Never commit
     directly to `main` (CLAUDE.md).
   - Commit the changes with a message that explains why. End it with the Co-Authored-By line from the
     session attribution. Don't include unrelated files such as local command-file edits unless the user
     asked for them.
   - Push with `git push -u origin <branch>`, open a PR with `gh pr create --base main`, and merge it with
     `gh pr merge <n> --merge --delete-branch`.
   - Then `git checkout main && git pull --ff-only origin main`.
   - Wait for the "Build and push images to ACR" run on the merge commit (`gh run list` / `gh run watch`).
     If it fails, stop and report. Don't deploy a failed build.
   The target is then the merge commit's short SHA.

   **Changes that don't affect the running app** (command files, docs, CLAUDE.md, README, `.github/` or
   other tooling that isn't part of the built images): do the normal branch → PR → merge, then **stop
   without deploying**. Ask the user before pushing or merging these, and report that no Azure deploy is
   needed. The app paths that trigger a build are `frontend/**` and `backend/**`; anything outside them
   doesn't change the images.

   If the local changes are already committed on a feature branch (nothing uncommitted), the gate still
   runs on that branch's code before it is pushed or merged.

2. **No local changes and no argument.** (The commit already passed the gate when it was shipped, so the
   gate is not re-run here.) Find the most recent **successful** run of the
   "Build and push images to ACR" workflow on `main` (`gh run list`), not just the latest commit — it
   must be a commit that actually got built and pushed. Use its commit SHA.

3. Tell the user, in one line, which commit is being deployed (short SHA, message) so it's visible in
   the transcript. Don't wait for a reply.

4. Trigger the deploy: `gh workflow run deploy.yml -f tag=<short-sha>` (the short, 7-character SHA — both
   `build-and-push.yml` and `deploy.yml` work with it).

5. Watch the run (`gh run watch --exit-status`) and report success/failure plainly.

6. Check the production URLs and report them:
   - Frontend: https://aiworkshop-frontend.whitesand-f146b069.westeurope.azurecontainerapps.io
   - Backend: https://aiworkshop-backend.whitesand-f146b069.westeurope.azurecontainerapps.io/health

Resource names, for reference (also in the "Azure infrastructure" section of CLAUDE.md):
resource group `ai-workshop-baseline`, registry `acraiworkshop.azurecr.io`, container apps
`aiworkshop-backend` / `aiworkshop-frontend`.

Never run this command automatically as a side effect of another task. It must be invoked directly
by the user. Never enable auto-merge, and never deploy a commit whose build did not succeed.
