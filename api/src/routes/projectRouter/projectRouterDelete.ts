import {createHono} from "../../helpers/createHono";
import {needsAuth} from "../../middleware/needsAuth";
import {db} from "@hapi/shared";
import {AlterProjectSlugRequestSchema} from "@hapi/shared/types/apiRequests";

export const projectRouterDelete = createHono()

projectRouterDelete.delete("/:projectId", needsAuth, async (c) => {
    const user = c.get("user")!
    if (user.role !== "ADMIN") {
        return c.json({error: "Unauthorised"}, 403)
    }
    const projectId = c.req.param("projectId")

    try {
        await db.project.delete({where: {id: projectId}})
        return c.json({}, 200)
    } catch (e) {
        console.error(e)
        return c.json({error: "Internal server error"}, 500)
    }
})

projectRouterDelete.delete("/id/:projectId/slug", needsAuth, async (c) => {
    const projectId = c.req.param("projectId")
    let body
    try {
        body = AlterProjectSlugRequestSchema.parse(await c.req.json())
    } catch {
        return c.json({error: "Malformed data"}, 400)
    }
    try {
        await db.projectSlug.delete({
            where: {slug: body.slug.toLowerCase(), projectId: projectId}
        })
        return c.json({}, 200)
    } catch (e) {
        return c.json({error: "Internal server error"}, 500)
    }
})
