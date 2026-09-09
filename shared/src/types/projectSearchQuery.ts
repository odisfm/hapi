import type {ApprovalStatus} from "../generated/prisma/enums.js";

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
