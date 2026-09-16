import { createHono } from "../helpers/createHono";
import {needsAuth} from "../middleware/needsAuth";
import {PutObjectCommand, type PutObjectCommandInput} from "@aws-sdk/client-s3";
import {s3} from "../services/s3";
import {v4 as createUuid} from "uuid"
import sharp from 'sharp'
import {db} from "@hapi/shared";
import {CreateProjectMediaRequestSchema} from "@hapi/shared/types/apiRequests";
import type {CreateProjectMediaResponse} from "@hapi/shared/types/apiResponses";

const ICON_LONG_EDGE = 400 // px
const SCREENSHOT_LONG_EDGE = 1920 // px

export const mediaRouter = createHono()

mediaRouter.post("/icon", needsAuth, async (c) => {
    const formData = await c.req.formData()
    const file = formData.get("file")
    if (!(file instanceof File)) {
        return c.json({ error: "Missing 'file' field" }, 400)
    }

    const arrayBuffer = await file.arrayBuffer()
    const uploadBuffer = new Uint8Array(arrayBuffer);
    const image = sharp(uploadBuffer)
    const metadata = await image.metadata()
    if (!metadata.width || !metadata.height) {
        return c.json({ error: "Could not read image dimensions" }, 400)
    }
    let webpBuffer: Buffer
    try {
        webpBuffer = await image.toFormat("webp").resize({
            width: ICON_LONG_EDGE, height: ICON_LONG_EDGE
        }).toBuffer()
    } catch (e) {
        console.error(e)
        return c.json({error: "Internal server error"}, 500)
    }

    const uuid = createUuid()

    const commandInput: PutObjectCommandInput = {
        Bucket: process.env.BUCKET_ICONS,
        Key: `${uuid}.webp`,
        Body: webpBuffer,
        ContentType: "image/webp",
    }

    try {
        await s3.send(
            new PutObjectCommand(commandInput),
        )

        return c.json({uri: uuid}, 201)

    } catch (e) {
        console.error(e)
        return c.json({error: "Internal server error"}, 500)
    }
})

mediaRouter.post("/screenshot", needsAuth, async (c) => {
    const formData = await c.req.formData()
    const file = formData.get("file")
    let data
    if (!(file instanceof File)) {
        return c.json({ error: "Missing 'file' field" }, 400)
    }
    try {
        const rawData = formData.get("data")
        if (typeof rawData !== "string") {
            return c.json({ error: "Missing 'data' field" }, 400)
        }
        data = CreateProjectMediaRequestSchema.parse(JSON.parse(rawData))
    } catch (e) {
        return c.json({error: "Malformed 'data' field"})
    }

    const arrayBuffer = await file.arrayBuffer()
    const uploadBuffer = new Uint8Array(arrayBuffer);
    const image = sharp(uploadBuffer)
    const metadata = await image.metadata()
    if (!metadata.width || !metadata.height) {
        return c.json({ error: "Could not read image dimensions" }, 400)
    }
    const isWide = metadata.width >= metadata.height
    let webpBuffer: Buffer
    try {
        webpBuffer = await image.toFormat("webp").resize({
            ...(isWide && {width: SCREENSHOT_LONG_EDGE}),
            ...(!isWide && {height: SCREENSHOT_LONG_EDGE})
        }).toBuffer()
    } catch (e) {
        console.error(e)
        return c.json({error: "Internal server error"}, 500)
    }

    const uri = createUuid()
    const commandInput: PutObjectCommandInput = {
        Bucket: process.env.BUCKET_SCREENSHOTS,
        Key: `${uri}.webp`,
        Body: webpBuffer,
        ContentType: "image/webp",
    }

    try {
        await s3.send(new PutObjectCommand(commandInput))
        const record = await db.projectMedia.create({
            data: {
                mediaUrl: uri,
                mediaType: "SCREENSHOT",
                projectId: data.projectId,
                deviceType: data.deviceType,
                order: ""
            }
        })

        return c.json({projectMedia: record} satisfies CreateProjectMediaResponse, 201)

    } catch (e) {
        console.error(e)
        return c.json({error: "Internal server error"}, 500)
    }
})

mediaRouter.delete("/screenshot/:mediaId", needsAuth, async (c) => {
    const mediaId = c.req.param("mediaId")
    try {
        await db.projectMedia.delete({where: {id: mediaId}})
        return c.json({}, 200)
    } catch (e) {
        console.error(e)
        return c.json({error: "Internal server error"}, 500)
    }
})
