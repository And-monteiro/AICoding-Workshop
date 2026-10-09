---
description: Build and run the app locally using the "test" Docker Compose profile
---

Build and start the local "test" environment (not Azure — this is the second, isolated Docker
Compose profile used to validate a change before it's ever considered for production).

Steps:
1. Confirm the working tree has the intended changes (`git status` / `git diff`).
2. Bring down any running "dev" or "test" containers that might conflict, then build and start
   the "test" profile fresh: `docker compose --profile test --env-file .env.test up --build -d`.
3. Wait for the `db` healthcheck and the backend `/health` endpoint to report healthy.
4. Run the test suites inside the running containers (`docker compose exec backend dotnet test`,
   `docker compose exec frontend npm test`) if applicable to the change.
5. Report the local test URLs (frontend: http://localhost:3001, backend: http://localhost:8081)
   and whether everything came up healthy.

This never touches Azure or any real infrastructure — it's purely local validation before a change
is considered ready to promote with /deploy-prod.
