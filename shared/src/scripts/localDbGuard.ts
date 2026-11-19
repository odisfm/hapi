import { pathToFileURL } from 'node:url'

/**
 * Guard for scripts that wipe the database (`db:populate`, `db:reset`).
 *
 * Checking that DATABASE_URL says `localhost` isn't enough: through the SSM
 * tunnel, production is on localhost too. And `dotenv` doesn't override a
 * DATABASE_URL already exported in the shell, which is what the tunnel
 * runbook tells you to do. So this also asks the database itself: every
 * Amazon RDS instance has the `rds_superuser` and `rds_iam` roles, and a
 * local Postgres has neither.
 *
 * Run directly (`tsx src/scripts/localDbGuard.ts`) it exits 1 if the
 * database isn't local, so it can sit in front of a shell command.
 */

const LOCAL_HOSTS = ['localhost', '127.0.0.1', '[::1]']

export type RoleQuery = {
    $queryRaw<T>(query: TemplateStringsArray, ...values: unknown[]): Promise<T>
}

/** Returns why the database must not be wiped, or null if it's safe. */
export async function localDbProblem(
    db: RoleQuery,
    url: string | undefined,
    { allowRemoteHost = false } = {},
): Promise<string | null> {
    if (!url) {
        return 'DATABASE_URL is not set. Check .env.'
    }

    if (!allowRemoteHost) {
        let host: string
        try {
            host = new URL(url).hostname
        } catch {
            return 'DATABASE_URL is not a valid URL.'
        }
        if (!LOCAL_HOSTS.includes(host)) {
            return `DATABASE_URL points at "${host}", not this computer. If that's intended, re-run with --use-external-db.`
        }
    }

    const [{ isRds }] = await db.$queryRaw<{ isRds: boolean }[]>`
        SELECT EXISTS (
            SELECT 1 FROM pg_roles WHERE rolname IN ('rds_superuser', 'rds_iam')
        ) AS "isRds"`
    if (isRds) {
        return 'DATABASE_URL points at an Amazon RDS database (probably production, through the SSM tunnel). Refusing to wipe it. Close the tunnel and `unset DATABASE_URL`, then try again.'
    }

    return null
}

async function main() {
    const { db } = await import('../db.js')
    try {
        const problem = await localDbProblem(db, process.env.DATABASE_URL)
        if (problem) {
            console.error(problem)
            process.exitCode = 1
        }
    } catch (err) {
        console.error(`Couldn't check the database: ${(err as Error).message}`)
        process.exitCode = 1
    } finally {
        await db.$disconnect()
    }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    await main()
}
