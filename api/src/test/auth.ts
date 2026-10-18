import {vi} from "vitest";
import {db} from "@hapi/shared";
import type {UserModel} from "@hapi/shared/prisma/models";
import type {UserRole} from "@hapi/shared/prisma/enums";
import {makeSession, makeUser} from "./fixtures";

/**
 * Returns request headers that authenticate as a user with `role`, via the real session middleware.
 * Pass `null` for an anonymous request. Requires `@hapi/shared` to be mocked with `./mockDb`.
 */
export function loginAs(role: UserRole | null, overrides: Partial<UserModel> = {}): Record<string, string> {
    if (role === null) {
        return {}
    }
    const session = makeSession({user: makeUser({role, ...overrides})})
    vi.mocked(db.session.findUnique).mockResolvedValue(session)
    return {Cookie: `sessionId=${session.id}`}
}
