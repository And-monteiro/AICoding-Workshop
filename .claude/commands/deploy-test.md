---
description: Run the test gate, then build and run the app locally using the "test" Docker Compose profile
---

Validate the working tree in the local "test" environment (not Azure — this is the second, isolated
Docker Compose profile used to validate a change before it's ever considered for production). It
runs under its own Compose project name (`aiworkshop-test`), so it does not conflict with or tear
down a running "dev" environment — both can be up at the same time.

The **test gate runs first**. If any test fails, the command reports FAILED and aborts: the test
environment is not rebuilt or replaced, and nothing is promoted. A change that has not passed this
gate is not ready for /deploy-prod.

Steps:
1. Confirm the working tree has the intended changes (`git status` / `git diff`) and say which branch
   is being tested.
2. **Test gate.** Run both suites in their throwaway test containers (they need only Docker, nothing
   installed locally, and they don't depend on the running environment). Run both even if the first
   fails, so the report is complete:
   - `docker compose -p aiworkshop-test --profile tests --env-file .env.test run --rm --build backend-tests`
   - `docker compose -p aiworkshop-test --profile tests --env-file .env.test run --rm --build frontend-tests`
3. **If either suite failed: report `TEST GATE FAILED` and stop.** Name the suite and the failing
   tests with the assertion message in one or two lines, and say plainly that nothing was deployed
   and the running test environment was left untouched. Do not continue to step 4, do not offer to
   skip the gate, and do not "fix" a failing test by weakening it unless the user asks.
4. Only when both passed, build and start the "test" profile:
   `docker compose -p aiworkshop-test --profile test --env-file .env.test up --build -d`.
5. Wait for the `db` healthcheck and the backend `/health` endpoint to report healthy.
6. Report `TEST GATE PASSED` with the number of tests per suite, the local test URLs
   (frontend: http://localhost:3001, backend: http://localhost:8081) and whether everything came up
   healthy.

This never touches Azure or any real infrastructure — it's purely local validation before a change
is considered ready to promote with /deploy-prod.
