# Environments

## Production (`prod`)

The only live environment. It runs the latest code on `main`:
[every merge is checked and deployed automatically](../processes/CI-CD.md).

It lives in AWS `ap-southeast-2` (Sydney) with its own VPC, database, buckets
and CloudFront distribution. Every per-environment resource name includes
the environment name (`hapi-prod-*`, roles `rmit-hapi-prod-*`), and each root
keeps its state under `prod/` in the state bucket.

## Local development

Developers run everything locally against
[Supabase Local](https://supabase.com/docs/guides/local-development)
(Postgres 17). See the [dev environment guide](../dev/dev-environment.md).

## Adding environments

The infrastructure is built so that another environment (e.g. `staging`)
needs no structural changes: a CIDR, a `platform` apply with
`environment = "staging"`, and the branch that deploys it. See the
[runbook](runbooks.md#adding-another-environment).

The previous `staging` and `production` environments (Supabase databases,
`ap-southeast-4`) were retired in the move to the current setup.
