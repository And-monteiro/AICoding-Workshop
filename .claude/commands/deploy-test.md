---
description: Build and run the app locally using the "test" Docker Compose profile
---

Build and start the local "test" environment (not Azure — this is the second, isolated Docker
Compose profile used to validate a change before it's ever considered for production). It runs
under its own Compose project name (`aiworkshop-test`), so it does not conflict with or tear down
a running "dev" environment — both can be up at the same time.

Same flow as the dev environment, with the test profile and env file:

Steps:
1. Confirm the working tree has the intended changes (`git status` / `git diff`).
2. Build and start the "test" profile: `docker compose -p aiworkshop-test --profile test --env-file .env.test up --build -d`.
3. Wait for the `db` healthcheck and the backend `/health` endpoint to report healthy.
4. Run the test suites inside the running containers (`docker compose -p aiworkshop-test exec backend dotnet test`,
   `docker compose -p aiworkshop-test exec frontend npm test`) if applicable to the change. The repo currently
   has no test projects, so report "no tests" rather than a pass.
5. Report the local test URLs (frontend: http://localhost:3001, backend: http://localhost:8081)
   and whether everything came up healthy.

This never touches Azure or any real infrastructure — it's purely local validation before a change
is considered ready to promote with /deploy-prod.
