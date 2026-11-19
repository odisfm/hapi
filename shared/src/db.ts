import { PrismaClient } from './generated/prisma/client.js'
import { PrismaPg } from '@prisma/adapter-pg'
import { Signer } from '@aws-sdk/rds-signer'
import type { PoolConfig } from 'pg'

/**
 * Two ways to connect:
 *
 * 1. `DATABASE_URL` set: use it as-is (local Supabase, scripts, SSM tunnel).
 * 2. Otherwise, if `DB_HOST` is set: IAM database authentication (AWS Lambdas).
 *    A short-lived token from `@aws-sdk/rds-signer` is used as the password
 *    for every new connection. Signing is local, so it needs no network.
 *
 * In AWS, `DB_POOL_MAX` is 1 per Lambda container; the overall connection
 * budget is documented in infra/app/main.tf.
 */
export function poolConfigFromEnv(env: NodeJS.ProcessEnv = process.env): PoolConfig {
    if (env.DATABASE_URL || !env.DB_HOST) {
        return { connectionString: env.DATABASE_URL }
    }

    const host = env.DB_HOST
    const port = Number(env.DB_PORT ?? 5432)
    const user = required(env, 'DB_USER')

    const signer = new Signer({ hostname: host, port, username: user, region: env.AWS_REGION })

    return {
        host,
        port,
        user,
        database: required(env, 'DB_NAME'),
        // Called by pg whenever it opens a connection; tokens last 15 minutes
        // but are only checked at connect time.
        password: () => signer.getAuthToken(),
        // RDS enforces TLS (rds.force_ssl). The RDS CA comes from
        // NODE_EXTRA_CA_CERTS=/var/runtime/ca-cert.pem in Lambda.
        ssl: { rejectUnauthorized: true },
        max: Number(env.DB_POOL_MAX ?? 10),
        // Below the server's idle_session_timeout (15 min) so the pool closes
        // idle connections before the server does.
        idleTimeoutMillis: 10 * 60 * 1000,
        connectionTimeoutMillis: 10_000,
    }
}

function required(env: NodeJS.ProcessEnv, name: string): string {
    const value = env[name]
    if (!value) {
        throw new Error(`Missing environment variable "${name}" (required for IAM database auth)`)
    }
    return value
}

const adapter = new PrismaPg(poolConfigFromEnv(), {
    // A connection the server closed while the Lambda container was frozen
    // emits 'error' when the container thaws. Log it rather than crash; the
    // pool discards that client and opens a new one on the next query.
    onPoolError: (err) => console.warn(`[db] idle connection error: ${err.message}`),
    onConnectionError: (err) => console.warn(`[db] connection error: ${err.message}`),
})

export const db = new PrismaClient({ adapter })
