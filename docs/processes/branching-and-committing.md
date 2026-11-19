# Branching and committing

`main` is production: **every change merged into `main` is deployed
automatically** (see [CI/CD](CI-CD.md)). So all work happens on branches
and reaches `main` through a pull request in CodeCommit.

## The workflow

1. Start from an up-to-date `main` and create a branch:

   ```sh
   git switch main
   git pull
   git switch -c fix-login-redirect
   ```

2. Commit your work to the branch (see [commit messages](#commit-messages)).
3. Run the checks locally. **Nothing runs them on pull requests.** The
   pipeline only runs them after a merge, and a failure there blocks the
   deploy.

   ```sh
   npm run lint --workspace client --workspace api --workspace shared
   npm run typecheck --workspaces --if-present
   npm run test --workspaces --if-present
   ```

4. Push the branch:

   ```sh
   git push -u origin fix-login-redirect
   ```

5. Open a pull request into `main`: in the AWS console (CodeCommit →
   Repositories → `hapi` → Pull requests → Create pull request), or with
   the CLI:

   ```sh
   aws codecommit create-pull-request \
     --title "Fix login redirect" \
     --targets repositoryName=hapi,sourceReference=fix-login-redirect,destinationReference=main
   ```

6. Have a teammate review it. Where possible, they should also try the
   change locally.
7. Merge it in the console. Merging deploys it: watch the build in
   CodeBuild (`hapi-prod-deploy`) and check the site afterwards.
8. Delete the branch. The console offers this when merging.

This is based on
[GitHub Flow](https://docs.github.com/en/get-started/using-github/github-flow).

## Approvals

The repository may require an approval before a pull request can be merged.
That was decided when the account was set up (`pr_approvals_required` in
[step 6 of the deploy guide](../infrastructure/deploy-to-race.md#6-bootstrap-the-account)).

CodeCommit doesn't let the author of a pull request approve it. If the
whole team signs in as one shared IAM user, the approval rule can never be
met, so it's turned off. In that case reviews are a team habit, not
something CodeCommit enforces.

## Commit messages

Start each commit message with its type, then a short summary in the
imperative:

```
fix: show the login page after a password reset
feat: add sorting by most viewed
docs: explain the database tunnel
```

Common types are `feat`, `fix`, `docs`, `test`, `refactor` and `ci`. Leave
out scopes (`fix:`, not `fix(api):`).

## Changes that need extra care

- **Database schema changes** deploy their migration before the new code.
  The old code briefly runs against the new schema, so avoid migrations
  that break the running version, like renaming or dropping a column it
  still uses. Do those in two steps.
- **`infra/platform/` changes** don't deploy through the pipeline. An admin
  must apply them by hand. See [CI/CD](CI-CD.md#changing-the-pipeline-itself).
- **`buildspec.yml` and `ci/` changes** change the pipeline itself and take
  effect on the next build. If one breaks the pipeline, the fix has to be
  merged and built by the broken pipeline too, so test carefully.
