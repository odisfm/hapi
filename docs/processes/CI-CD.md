# CI/CD

## On Pull Requests

When you submit a PR, [a GitHub Actions workflow](../../.github/workflows/ci.yml) runs, and:

- [Lints](https://www.jetbrains.com/pages/static-code-analysis-guide/linters/) code in the repo
- [Runs tests](https://vitest.dev/) on:
  - Frontend code
  - Backend code
  - Shared code
- Audits dependencies for vulnerabilities

If any of these checks fail, you should rectify them before seeking approval for your PR.

## On merge to `main`

When your PR is merged back to the `main` branch, [another workflow](../../.github/workflows/staging.yml) is triggered, automatically deploying the new code to the [staging environment](../infrastructure/environments.md).

At a later time, the team may manually trigger [this workflow](../../.github/workflows/prod.yml) to deploy to the [production environment](../infrastructure/environments.md).

The actual deployment code is in [yet another workflow](../../.github/workflows/deploy.yml).
