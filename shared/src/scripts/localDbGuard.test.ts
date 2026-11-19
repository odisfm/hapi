import { describe, expect, test, vi } from 'vitest'
import { localDbProblem, type RoleQuery } from './localDbGuard.js'

function fakeDb(isRds: boolean) {
    return { $queryRaw: vi.fn(async () => [{ isRds }]) } as unknown as RoleQuery & { $queryRaw: ReturnType<typeof vi.fn> }
}

const LOCAL_URL = 'postgresql://postgres:postgres@127.0.0.1:54322/postgres'
const TUNNEL_URL = 'postgresql://hapi_owner:token@localhost:15432/hapi?sslmode=no-verify'

describe('localDbProblem', () => {
    test.each([
        LOCAL_URL,
        'postgresql://postgres:postgres@localhost:5432/postgres',
        'postgresql://postgres:postgres@[::1]:5432/postgres',
    ])('allows a local, non-RDS database (%s)', async (url) => {
        expect(await localDbProblem(fakeDb(false), url)).toBeNull()
    })

    test('refuses production through the tunnel, even though the host is localhost', async () => {
        expect(await localDbProblem(fakeDb(true), TUNNEL_URL)).toMatch(/Amazon RDS/)
    })

    test('refuses an RDS database even with --use-external-db', async () => {
        const url = 'postgresql://hapi_owner:token@hapi-prod.abc.ap-southeast-2.rds.amazonaws.com:5432/hapi'
        expect(await localDbProblem(fakeDb(true), url, { allowRemoteHost: true })).toMatch(/Amazon RDS/)
    })

    test('refuses a remote host without --use-external-db, before connecting', async () => {
        const db = fakeDb(false)
        expect(await localDbProblem(db, 'postgresql://u:p@db.example.com:5432/x')).toMatch(/--use-external-db/)
        expect(db.$queryRaw).not.toHaveBeenCalled()
    })

    test('allows a remote, non-RDS host with --use-external-db', async () => {
        expect(await localDbProblem(fakeDb(false), 'postgresql://u:p@db.example.com:5432/x', { allowRemoteHost: true })).toBeNull()
    })

    test("isn't fooled by localhost elsewhere in the URL", async () => {
        const db = fakeDb(false)
        expect(await localDbProblem(db, 'postgresql://localhost:p@db.example.com:5432/localhost')).toMatch(/db\.example\.com/)
        expect(db.$queryRaw).not.toHaveBeenCalled()
    })

    test('refuses a missing DATABASE_URL', async () => {
        expect(await localDbProblem(fakeDb(false), undefined)).toMatch(/not set/)
    })
})
