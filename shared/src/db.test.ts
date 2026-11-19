import { beforeEach, describe, expect, test, vi } from "vitest"

const getAuthToken = vi.fn(async () => "signed-token")
const signerArgs: unknown[] = []

vi.mock("@aws-sdk/rds-signer", () => ({
    Signer: class {
        constructor(args: unknown) {
            signerArgs.push(args)
        }
        getAuthToken = getAuthToken
    },
}))

const { poolConfigFromEnv } = await import("./db.js")

const iamEnv = {
    DB_HOST: "hapi-prod.abc.ap-southeast-2.rds.amazonaws.com",
    DB_PORT: "5432",
    DB_NAME: "hapi",
    DB_USER: "hapi_app",
    DB_POOL_MAX: "1",
    AWS_REGION: "ap-southeast-2",
}

describe("poolConfigFromEnv", () => {
    beforeEach(() => {
        signerArgs.length = 0
        getAuthToken.mockClear()
    })

    test("uses DATABASE_URL when set (local dev, scripts, tunnel)", () => {
        const config = poolConfigFromEnv({ DATABASE_URL: "postgresql://u:p@localhost:5432/db" })
        expect(config).toEqual({ connectionString: "postgresql://u:p@localhost:5432/db" })
        expect(signerArgs).toHaveLength(0)
    })

    test("DATABASE_URL wins over IAM settings", () => {
        const config = poolConfigFromEnv({ ...iamEnv, DATABASE_URL: "postgresql://x" })
        expect(config).toEqual({ connectionString: "postgresql://x" })
    })

    test("falls back to an empty connection string when nothing is configured", () => {
        expect(poolConfigFromEnv({})).toEqual({ connectionString: undefined })
    })

    test("uses IAM auth when DB_HOST is set", async () => {
        const config = poolConfigFromEnv(iamEnv)

        expect(config).toMatchObject({
            host: iamEnv.DB_HOST,
            port: 5432,
            user: "hapi_app",
            database: "hapi",
            ssl: { rejectUnauthorized: true },
            max: 1,
            idleTimeoutMillis: 600_000,
        })
        expect(signerArgs).toEqual([{
            hostname: iamEnv.DB_HOST,
            port: 5432,
            username: "hapi_app",
            region: "ap-southeast-2",
        }])

        // pg calls the password function for each new connection.
        expect(typeof config.password).toBe("function")
        const password = config.password as () => Promise<string>
        await expect(password()).resolves.toBe("signed-token")
        await expect(password()).resolves.toBe("signed-token")
        expect(getAuthToken).toHaveBeenCalledTimes(2)
    })

    test("defaults port and pool size", () => {
        const { DB_PORT: _port, DB_POOL_MAX: _max, ...env } = iamEnv
        const config = poolConfigFromEnv(env)
        expect(config.port).toBe(5432)
        expect(config.max).toBe(10)
    })

    test.each(["DB_USER", "DB_NAME"])("throws when %s is missing in IAM mode", (name) => {
        const env: Record<string, string> = { ...iamEnv }
        delete env[name]
        expect(() => poolConfigFromEnv(env)).toThrow(name)
    })
})
