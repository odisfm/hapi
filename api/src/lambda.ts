import { handle } from 'hono/aws-lambda'
// import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager'
// const environment = process.env.ENVIRONMENT!

// const client = new SecretsManagerClient({})
// const { SecretString } = await client.send(
//     new GetSecretValueCommand({ SecretId: `lambda-secrets-${environment}` })
// )
// const secrets = JSON.parse(SecretString!)
//
// process.env.ALLOWED_CORS = secrets.ALLOWED_CORS

const { app } = await import('./index.js')

export const handler = handle(app)
