/**
 * Create the first admin user for a new environment. Idempotent: if a user with
 * the email already exists, nothing is changed. Never deletes or truncates.
 *
 * Usage (see docs/infrastructure/runbooks.md, "Create the first admin"):
 *
 *   ADMIN_EMAIL=... ADMIN_PASSWORD=... DATABASE_URL=... \
 *     npm run db:create-admin --workspace shared
 *
 * The admin must change the password on first login (needsPasswordReset).
 * Deliberately does not load ../.env, so it can never silently target the
 * local database when DATABASE_URL was forgotten.
 */
import { pathToFileURL } from 'node:url'
import { hashPassword } from '@hapi/api/src/helpers/password'

export type UserStore = {
    user: {
        findUnique(args: { where: { email: string } }): Promise<{ id: string; role: string } | null>
        create(args: {
            data: {
                email: string
                name: string
                password: string
                role: 'ADMIN'
                needsPasswordReset: boolean
            }
        }): Promise<{ id: string }>
    }
}

export type CreateAdminInput = { email?: string; password?: string; name?: string }
export type CreateAdminResult =
    | { status: 'created'; id: string }
    | { status: 'exists'; id: string; role: string }

export async function createAdmin(store: UserStore, input: CreateAdminInput): Promise<CreateAdminResult> {
    const email = input.email?.trim().toLowerCase()
    const password = input.password

    if (!email || !password) {
        throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must both be set')
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error(`ADMIN_EMAIL "${email}" is not a valid email address`)
    }

    const existing = await store.user.findUnique({ where: { email } })
    if (existing) {
        return { status: 'exists', id: existing.id, role: existing.role }
    }

    const created = await store.user.create({
        data: {
            email,
            name: input.name?.trim() || 'Administrator',
            password: await hashPassword(password),
            role: 'ADMIN',
            // Forces a password change on first login. Admins have unlimited
            // transcode credits (videoTranscodeCredits = null, the default).
            needsPasswordReset: true,
        },
    })
    return { status: 'created', id: created.id }
}

async function main() {
    if (!process.env.DATABASE_URL && !process.env.DB_HOST) {
        console.error('Set DATABASE_URL (or DB_HOST/DB_NAME/DB_USER for IAM auth) to the target database')
        process.exit(1)
    }

    const { db } = await import('../db.js')
    try {
        const result = await createAdmin(db, {
            email: process.env.ADMIN_EMAIL,
            password: process.env.ADMIN_PASSWORD,
            name: process.env.ADMIN_NAME,
        })
        if (result.status === 'created') {
            console.log(`Created admin ${process.env.ADMIN_EMAIL?.trim().toLowerCase()} (${result.id}); password reset required on first login`)
        } else {
            console.log(`User already exists (${result.id}, role ${result.role}); nothing changed`)
        }
    } catch (err) {
        console.error((err as Error).message)
        process.exitCode = 1
    } finally {
        await db.$disconnect()
    }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    await main()
}
