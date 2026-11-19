import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager'

type SecretsClient = Pick<SecretsManagerClient, 'send'>

let defaultClient: SecretsManagerClient | undefined

function getDefaultClient(): SecretsManagerClient {
    // Short timeouts: Secrets Manager is reached through the NAT, which reboots
    // for patching. Without them a cold start could hang until the Lambda timeout.
    defaultClient ??= new SecretsManagerClient({
        maxAttempts: 2,
        requestHandler: { connectionTimeout: 3_000, requestTimeout: 5_000 },
    })
    return defaultClient
}

/**
 * In AWS the Lambda receives only the secret's ARN (`MAILGUN_SECRET_ARN`), never the
 * key itself. Read it and expose it as `MAILGUN_KEY`, which is what services/mailgun.ts
 * expects (and what local dev sets directly in .env).
 *
 * The secret is stored as a plain string (the API key).
 */
export async function loadMailgunKey(
    env: NodeJS.ProcessEnv = process.env,
    client: SecretsClient = getDefaultClient(),
): Promise<void> {
    const secretArn = env.MAILGUN_SECRET_ARN
    if (!secretArn || env.MAILGUN_KEY) {
        return
    }

    const { SecretString } = await client.send(new GetSecretValueCommand({ SecretId: secretArn }))
    if (!SecretString) {
        throw new Error('Mailgun secret has no value; set it with `aws secretsmanager put-secret-value`')
    }
    env.MAILGUN_KEY = SecretString.trim()
}

/**
 * Cold-start variant: never throws. A failure here (secret not set yet, NAT
 * being patched) must not take the whole API down; sending email retries the
 * load and fails on its own if the key is still unavailable.
 */
export async function tryLoadMailgunKey(env: NodeJS.ProcessEnv = process.env, client?: SecretsClient): Promise<void> {
    try {
        await loadMailgunKey(env, client)
    } catch (err) {
        console.warn(`[secrets] could not load Mailgun key at init: ${(err as Error).message}`)
    }
}
