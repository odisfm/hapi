import * as z from "zod"
import {type ApprovalStatus, UserRole} from "../generated/prisma/enums.js";
import {PasswordSchema} from "./password";

export type ProjectSearchQuery = {
    searchTerm?: string,
    /** how many results to return **/
    limit?: number,
    /** when paginating, the UUID of the last project returned **/
    cursor?: string,
    /** UUID of category **/
    category?: string,
    /** UUID of capstone **/
    showcase?: string,
    /** admin only **/
    approvalStatus?: ApprovalStatus
}

export const LoginRequestSchema = z.object({
    email: z.email(),
    password: z.string(),
})

export const PasswordChangeRequestSchema = z.object({
    password: z.string(),
})

export const CreateUserRequestSchema = z.object({
    email: z.email(),
    name: z.string(),
    password: PasswordSchema,
    role: z.enum(UserRole)
})
