---
description: Build and deploy a specific, already-tested version to the Azure "prod" environment
---

Deploy a specific version to the Azure Container Apps "prod" environment. The argument is the
image tag / git SHA to promote: $ARGUMENTS

This is the only command in this repo that touches real cloud infrastructure. "dev" and "test"
are both local Docker Compose profiles (see /deploy-test) — nothing about them involves Azure.

Steps:
1. Require an explicit version/tag as $ARGUMENTS — never deploy "whatever is currently built" to prod.
   If no argument is given, stop and ask which version to promote.
2. Confirm that version has already been deployed to "test" and ask the user to confirm it was
   verified there before proceeding.
3. Explicitly ask the user to confirm before touching production, even if they invoked this command
   directly — this is a one-way door during a live workshop.
4. Update the "prod" Container Apps (backend and frontend) to that image tag with `az containerapp update`.
5. Report the production URL and the active revision.

<!-- TODO once Azure infra exists (step 6/7): fill in the actual resource group,
     ACR name, and Container App names. -->

Never run this command automatically as a side effect of another task. It must be invoked directly by the user.
