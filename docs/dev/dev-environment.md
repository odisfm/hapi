# Setting up a development environment

## Prerequisites

### Install required software

- [Node.js and NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Windows Subsystem for Linux](https://learn.microsoft.com/en-us/windows/wsl/install) (Windows users only; the rest of this guide assumes you are running commands in WSL)

### Clone this repository

The repository is moving from GitHub to AWS CodeCommit (`ap-southeast-2`).
Until the move is finished, GitHub is still the place to work.

**CodeCommit** (once migrated). There are no IAM users, Git passwords or SSH
keys for this; Git authenticates with your AWS CLI profile through
[`git-remote-codecommit`](https://github.com/aws/git-remote-codecommit):

```sh
pip install git-remote-codecommit
aws configure --profile hapi            # credentials provided by the account owner
git clone codecommit::ap-southeast-2://hapi@hapi
```

(The format is `codecommit::<region>://<profile>@<repository>`.) Don't push
directly to `main`; open a pull request in CodeCommit. Every change to
`main` deploys to production; see [CI/CD](../processes/CI-CD.md).

**GitHub** (until the move is finished), via HTTPS:

`git clone https://github.com/odisfm/hapi.git`

or SSH:

`git clone git@github.com:odisfm/hapi.git`

### Install dependencies

From the repo root:

`npm install`

### Create `.env`

In the repo root, locate the file `.env.example`, and create a copy of it called `.env`.

Many variables in `.env.example` have usable defaults.
For those that don't, contact the dev team to get access to them.

## Setting up the local database

Create/start the database:

`npx supabase start`

### Perform a database migration

The first time you create the database, and any time the [database schema](../../shared/prisma/schema.prisma) changes, you will need to update your local DB to match the new schema.

To do so:
```shell
cd shared
npm run db:migrate:deploy
```

If the new schema is incompatible with the current state of the DB, you will need to completely reset it with:

```shell
npm run db:reset
```

You can then [re-seed](#populating-the-database) the DB.

After creating/migrating the database, you will need to [regenerate the Prisma client](https://www.prisma.io/docs/cli/v7/generate):

```shell
cd shared
npx prisma generate
```

### Populating the database

To populate the database with dummy data, from the repo root, run:

`npm run db:populate --workspace shared`

**Note:** this will truncate (delete) all data in the database and replace it with dummy data!

If you have `DEFAULT_ADMIN_EMAIL` and `DEFAULT_ADMIN_PASSWORD` in your `.env`, an admin account will be created with these credentials.

View the script [here](../../shared/src/scripts/populateDb/populateDb.ts).

### Viewing the database in a GUI

You may like to view the database in a friendly UI.
To do so, you can open <http://127.0.0.1:54323> in a web browser after [starting the database](#setting-up-the-local-database).


## Developing

### API

#### Build

To start building the API, from the repo root run:

`npm run api:dev`

Which will start the server at <http://localhost:3000>.
You may wish to use a tool like [Bruno](https://www.usebruno.com/) to manually query the API.

#### Test

In a new terminal, navigate to `/api`.

To run tests once, run:

`npm run test`

Or to run tests continuously as you work (recommended), run:

`npm run test:watch`

### Client

#### Build

To start building the client/frontend, from the repo root (in a new terminal), run:

`npm run client:dev`

You will likely want to develop against the API locally, so follow [the above instructions](#api) to set that up too.

#### Test

In a new terminal, navigate to `/client`.

To run tests once, run:

`npm run test`

Or to run tests continuously as you work (recommended), run:

`npm run test:watch`
