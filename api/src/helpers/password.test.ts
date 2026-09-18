import { describe, expect, test, vi, beforeEach } from 'vitest'
import {checkPassword, hashPassword} from "./password";

test("hashes password correctly", async () => {
    const plaintextPass = "P455w0rd?"
    const hashed = await hashPassword(plaintextPass)
    expect(await checkPassword(plaintextPass, hashed)).toBe(true)
})

test("rejects bad password", async () => {
    const plaintextPass1 = "P455w0rd?"
    const plaintextPass2 = "PasStWo?d"
    const hashed = await hashPassword(plaintextPass1)
    expect(await checkPassword(plaintextPass2, hashed)).toBe(false)
})

