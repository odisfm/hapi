import { describe, expect, test, vi } from 'vitest'
import { GetSecretValueCommand } from '@aws-sdk/client-secrets-manager'
import { loadMailgunKey, tryLoadMailgunKey } from './lambdaSecrets.js'

const ARN = 'arn:aws:secretsmanager:ap-southeast-2:123456789012:secret:hapi/prod/mailgun-key-AbCdEf'

function fakeClient(secretString: string | undefined) {
    return { send: vi.fn(async (_cmd: unknown) => ({ SecretString: secretString })) }
}

describe('loadMailgunKey', () => {
    test('reads the secret by ARN and sets MAILGUN_KEY', async () => {
        const env: NodeJS.ProcessEnv = { MAILGUN_SECRET_ARN: ARN }
        const client = fakeClient('key-123\n')

        await loadMailgunKey(env, client as never)

        expect(env.MAILGUN_KEY).toBe('key-123')
        expect(client.send).toHaveBeenCalledTimes(1)
        const command = client.send.mock.calls[0][0] as GetSecretValueCommand
        expect(command).toBeInstanceOf(GetSecretValueCommand)
        expect(command.input).toEqual({ SecretId: ARN })
    })

    test('does nothing without MAILGUN_SECRET_ARN (local dev)', async () => {
        const env: NodeJS.ProcessEnv = {}
        const client = fakeClient('unused')

        await loadMailgunKey(env, client as never)

        expect(env.MAILGUN_KEY).toBeUndefined()
        expect(client.send).not.toHaveBeenCalled()
    })

    test('keeps an explicitly set MAILGUN_KEY', async () => {
        const env: NodeJS.ProcessEnv = { MAILGUN_SECRET_ARN: ARN, MAILGUN_KEY: 'from-env' }
        const client = fakeClient('from-secret')

        await loadMailgunKey(env, client as never)

        expect(env.MAILGUN_KEY).toBe('from-env')
        expect(client.send).not.toHaveBeenCalled()
    })

    test('fails loudly when the secret has no value yet', async () => {
        const env: NodeJS.ProcessEnv = { MAILGUN_SECRET_ARN: ARN }

        await expect(loadMailgunKey(env, fakeClient(undefined) as never)).rejects.toThrow('put-secret-value')
    })
})

describe('tryLoadMailgunKey', () => {
    test('never throws at cold start', async () => {
        const env: NodeJS.ProcessEnv = { MAILGUN_SECRET_ARN: ARN }
        const client = { send: vi.fn(async () => { throw new Error('connect ETIMEDOUT') }) }
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

        await expect(tryLoadMailgunKey(env, client as never)).resolves.toBeUndefined()

        expect(env.MAILGUN_KEY).toBeUndefined()
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('ETIMEDOUT'))
        warn.mockRestore()
    })
})
