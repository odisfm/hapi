import { describe, expect, test, vi } from 'vitest'
import { checkPassword } from '@hapi/api/src/helpers/password'
import { createAdmin, type UserStore } from './createAdmin.js'

type CreateArgs = Parameters<UserStore['user']['create']>[0]

function fakeStore(existing: { id: string; role: string } | null = null) {
    return {
        user: {
            findUnique: vi.fn(async (_args: { where: { email: string } }) => existing),
            create: vi.fn(async (_args: CreateArgs) => ({ id: 'new-id' })),
        },
    }
}

describe('createAdmin', () => {
    test('creates an admin that must reset their password', async () => {
        const store = fakeStore()

        const result = await createAdmin(store, { email: ' Admin@Example.com ', password: 'initial-pass', name: 'Ops' })

        expect(result).toEqual({ status: 'created', id: 'new-id' })
        expect(store.user.findUnique).toHaveBeenCalledWith({ where: { email: 'admin@example.com' } })
        const { data } = store.user.create.mock.calls[0]![0]
        expect(data).toMatchObject({
            email: 'admin@example.com',
            name: 'Ops',
            role: 'ADMIN',
            needsPasswordReset: true,
        })
        expect(data.password).not.toBe('initial-pass')
        await expect(checkPassword('initial-pass', data.password)).resolves.toBe(true)
    })

    test('is a no-op when the user already exists', async () => {
        const store = fakeStore({ id: 'existing-id', role: 'STUDENT' })

        const result = await createAdmin(store, { email: 'admin@example.com', password: 'x' })

        expect(result).toEqual({ status: 'exists', id: 'existing-id', role: 'STUDENT' })
        expect(store.user.create).not.toHaveBeenCalled()
    })

    test('defaults the display name', async () => {
        const store = fakeStore()
        await createAdmin(store, { email: 'a@b.co', password: 'pw' })
        expect(store.user.create.mock.calls[0]![0].data.name).toBe('Administrator')
    })

    test.each([
        [{ password: 'pw' }],
        [{ email: 'a@b.co' }],
        [{ email: '', password: '' }],
    ])('refuses to run without both email and password: %o', async (input) => {
        const store = fakeStore()
        await expect(createAdmin(store, input)).rejects.toThrow('ADMIN_EMAIL and ADMIN_PASSWORD')
        expect(store.user.findUnique).not.toHaveBeenCalled()
    })

    test('rejects a malformed email', async () => {
        await expect(createAdmin(fakeStore(), { email: 'not-an-email', password: 'pw' })).rejects.toThrow('not a valid email')
    })
})
