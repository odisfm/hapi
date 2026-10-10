import {createHono} from "../../helpers/createHono";
import { needsAuth } from "../../middleware/needsAuth";
import {db} from "@hapi/shared";
import {filterProject} from "../../utils/filters/filterProject";
import {
    type ProjectAdminType,
    type ProjectStudentType,
    type ProjectVersionFeedbackItemType,
    type ProjectVersionSummaryType
} from "@hapi/shared/types/project";
import type {
    CreateProjectResponse,
    ProjectDetailsAdminResponse,
    ProjectDetailsStudentResponse,
    ProjectVersionsSearchResponse
} from "@hapi/shared/types/apiResponses";
import {UpdateProjectVersionStatusRequestSchema} from "@hapi/shared/types/apiRequests";
import {isOwner} from "../../utils/isOwner";

export const projectVersionRouter = createHono()

projectVersionRouter.get("/id/:versionId", needsAuth, async (c) => {
    const user = c.get("user")!
    const versionId = c.req.param("versionId")
    try {
        const record = await db.projectVersion.findUnique({
            where: {id: versionId},
            include: {
                project: {
                    include: {
                        ownerships: true,
                        versions: {
                            where: {
                                id: versionId,
                            },
                            include: {
                                categories: {include: {category: true}},
                                media: {include: {media: true}},
                            }
                        },
                        slugs: true,
                        showcase: true
                    }
                }
            }
        })
        if (!record) {
            return c.json({error: "Project not found"}, 404)
        }

        if (user.role !== "ADMIN") {
            let owned = false
            for (const o of record.project.ownerships) {
                if (o.ownerId === user.id) {
                    owned = true
                    break
                }
            }
            if (!owned) {
                return c.json({error: "Unauthorised"}, 403)
            }
        }

        if (user.role === "ADMIN") {
            const project = filterProject(record.project, user.role) as ProjectAdminType
            return c.json({project: project} satisfies ProjectDetailsAdminResponse, 200)
        } else if (user.role === "STUDENT") {
            const project = filterProject(record.project, user.role) as ProjectStudentType
            return c.json({project: project} satisfies ProjectDetailsStudentResponse, 200)
        }

    } catch (e) {
        console.error(e)
        return c.json({error: "Internal server error"}, 500)
    }
})

projectVersionRouter.delete("/version/:versionId", needsAuth, async (c) => {
    const user = c.get("user")!
    const versionId = c.req.param("versionId")
    const record = await db.projectVersion.findUnique({
        where: {
            id: versionId,
        },
        include: {
            project: {
                include: {
                    ownerships: true,
                    versions: true
                }
            }
        }
    })

    if (!record) {
        return c.json({error: "Not found"}, 404)
    }
    if (user.role !== "ADMIN" && !isOwner(user.id, record.project.ownerships)) {
        return c.json({error: "Unauthorised"}, 403)
    }

    if (record.project.versions.length <= 1) {
        return c.json({error: "Can't delete only version of project"}, 400)
    }

    await db.projectVersion.delete({
        where: {id: versionId}
    })

    return c.json({}, 200)
})

projectVersionRouter.patch("/version/:versionId/status", needsAuth, async (c) => {
    const user = c.get("user")!
    const versionId = c.req.param("versionId")
    let body
    try {
        body = UpdateProjectVersionStatusRequestSchema.parse(await c.req.json())
    } catch (e) {
        return c.json({error: "Malformed request"}, 400)
    }

    if (user.role !== "ADMIN") {
        if (body.rejectionReason) {
            return c.json({error: "Unauthorised"}, 403)
        }
        if (["APPROVED", "REJECTED", "SUPERSEDED"].includes(body.status)) {
            return c.json({error: "Unauthorised"}, 403)
        }
    }

    const record = await db.projectVersion.findUnique({
        where: {id: versionId},
        include: {
            project: {
                include: {
                    ownerships: true,
                    versions: true
                }
            }
        }
    })

    if (!record) {
        return c.json({error: "Not found"}, 404)
    }

    if (user.role !== "ADMIN") {
        if (!isOwner(user.id, record.project.ownerships)) {
            return c.json({error: "Unauthorised"}, 403)
        }
    }

    if (body.status === "APPROVED") {
        await db.projectVersion.updateMany({
            where: {
                projectId: record.projectId,
                submissionStatus: "APPROVED"
            },
            data: {
                submissionStatus: "SUPERSEDED"
            }
        })
    }

    await db.projectVersion.update({
        where: {
            id: versionId
        },
        data: {
            submissionStatus: body.status,
            ...(user.role === "ADMIN" && {reviewerId: user.id, reviewedAt: new Date()}),
            ...(body.rejectionReason && {rejectionReason: body.rejectionReason})
        }
    })

    return c.json({}, 200)
})

projectVersionRouter.post("/version/:versionId/new", needsAuth, async (c) => {
    const user = c.get("user")!
    const versionId = c.req.param("versionId")
    const record = await db.projectVersion.findUnique({
        where: {
            id: versionId
        },
        include: {
            project: {
                include: {
                    ownerships: true,
                },
            },
            categories: true,
            media: true
        }
    })

    if (!record) {
        return c.json({error: "Not found"}, 404)
    }

    if (user.role !== "ADMIN") {
        if (!isOwner(user.id, record.project.ownerships)) {
            return c.json({error: "Unauthorised"}, 403)
        }
    }
    const {id, project, categories, media, ...prevRecord} = record
    const transaction = await db.$transaction(async () => {
        const newRecord = await db.projectVersion.create({
            data: {
                ...prevRecord,
                createdAt: new Date(),
                submissionStatus: "NOT_SUBMITTED"
            }
        })

        const newMediaRecords = await db.projectVersionMedia.createManyAndReturn({
            data: media.map((m) => {
                return {
                    ...m,
                    projectVersionId: newRecord.id
                }
            })
        })

        const newCategoryRecords = await db.projectCategory.createManyAndReturn({
            data: categories.map((c) => {
                return {
                    ...c,
                    projectVersionId: newRecord.id
                }
            })
        })

        return {
            versionId: newRecord.id
        }
    })

    return c.json({
        projectId: record.project.id,
        versionId: transaction.versionId
    } satisfies CreateProjectResponse, 200)

})

projectVersionRouter.get("/versions", needsAuth, async (c) => {
    const user = c.get("user")!
    const records = await db.projectOwner.findMany({
        where: {
            ...(user.role === "STUDENT" && { ownerId: user.id })
        },
        include: {
            project: {
                include: {
                    versions: {
                        where: {
                            ...(user.role === "ADMIN" && {submissionStatus: "PENDING"})
                        },
                        orderBy: {
                            reviewedAt: "desc"
                        },
                        include: {
                            reviewer: true
                        }
                    },
                    slugs: {
                        orderBy: {assignedDate: "desc"}
                    },
                    showcase: true,
                    ownerships: {
                        include: {owner: true}
                    }
                }
            },
        }
    })

    let consolidatedRecords: ProjectVersionSummaryType[] = records.map((record) => {
        let live = false
        if (record.project.published) {
            if (record.project.showcase.publishedDate && record.project.showcase.publishedDate < new Date()) {
                live = true
            }
        }

        const summary: Partial<ProjectVersionSummaryType> = {}
        const approved =
            record.project.versions.find((p) => p.submissionStatus === "APPROVED")
        if (approved) {
            summary.approvedVersion = {
                id: approved.id,
                reviewedAt: approved.reviewedAt ? approved.reviewedAt : undefined,
                live
            }
        }
        const rest = record.project.versions
            .filter((v) => {
                return v.submissionStatus !== "APPROVED"
            })
            .sort((a, b) => {
                if (a.createdAt > b.createdAt) return -1
                if (a.createdAt < b.createdAt) return 1
                return -1 // shouldn't happen
            })

        if (rest.length) {
            const alternate = rest[0]
            summary.alternateVersion = {
                id: alternate.id,
                reviewedAt: alternate.reviewedAt ? alternate.reviewedAt : undefined,
                rejectionReason: alternate.rejectionReason ? alternate.rejectionReason : undefined,
                status: alternate.submissionStatus
            }
        }

        summary.users = record.project.ownerships.map((o) => {
            return {id: o.owner.id, name: o.owner.name}
        })

        if (approved) {
            summary.name = approved.name
        } else if (rest.length) {
           summary.name = rest[0].name
        } else { // should never happen
            summary.name = "untitled project"
        }

        summary.projectId = record.project.id
        summary.projectSlug = record.project.slugs[0]!.slug

        let feedback: ProjectVersionFeedbackItemType[] = record.project.versions.filter((v) => {
            return v.submissionStatus === "REJECTED"
        }).sort((a, b) => {
            if (a.reviewedAt! < b.reviewedAt!) {
                return 1
            } else if (a.reviewedAt! > b.reviewedAt!) {
                return -1
            } else { // shouldn't happen
                return 0
            }
        }).map((v) => {
            return {
                reviewedAt: v.reviewedAt!,
                reviewer: v.reviewer!.name,
                feedback: v.rejectionReason || ""
            }
        })

        summary.feedbackHistory = feedback

        return summary as ProjectVersionSummaryType
    })

    if (user.role === "ADMIN") {
        consolidatedRecords = consolidatedRecords.filter((r) =>  r.alternateVersion)
    }

    return c.json({versions: consolidatedRecords} satisfies ProjectVersionsSearchResponse, 200)

})
