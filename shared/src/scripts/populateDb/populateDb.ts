import commandLineArgs from 'command-line-args'
import {db} from "../../db.js"
import {categoryData, projectData, projectMediaData, showcaseData} from "./populateDbData.js";
import {hashPassword} from "@hapi/api/src/helpers/password";
import {LexoRank} from "@dalet-oss/lexorank";
import {Prisma} from "../../generated/prisma/client";

const cliArgDefinitions = [
    { name: "use-external-db", type: Boolean }
]
const cliArgs = commandLineArgs(cliArgDefinitions)

if (!process.env.DATABASE_URL) {
    console.error("Missing environment variable `DATABASE_URL`, check .env")
    process.exit(1)
}

const LOCAL_DB_INDICATORS = ["localhost", "127.0.0.1"]

if (cliArgs["use-external-db"] !== true) {
    let localIndicator = false
    for (const indicator of LOCAL_DB_INDICATORS) {
        if (process.env.DATABASE_URL.includes(indicator)) {
            localIndicator = true
            break
        }
    }
    if (!localIndicator) {
        console.error(`
        Environment variable DATABASE_URL seems to point to non-local database. 
        If intentional, re-run this command with option --use-external-db
        `)
        process.exit(1)
    }
}

console.log(`Truncating table ProjectMedia`)
await db.projectMedia.deleteMany()
console.log(`Done`)

console.log(`Truncating table Project`)
await db.project.deleteMany()
console.log(`Done`)

console.log(`Truncating table Category`)
await db.category.deleteMany()
console.log(`Done`)

console.log(`Truncating table Showcase`)
await db.showcase.deleteMany()
console.log(`Done`)

console.log(`Truncating table User`)
await db.user.deleteMany()
console.log(`Done`)

console.log(`Populating table Showcase`)
for (const showcase of showcaseData) {
    const record = await db.showcase.create({
        data: {
            name: showcase.name,
            year: showcase.year,
            semester: showcase.semester,
            description: showcase.description,
            publishedDate: showcase.publishedDate
        },
    })
    await db.showcaseSlug.create({
        data: {
            slug: showcase.slug,
            assignedDate: new Date(),
            showcaseId: record.id
        }
    })
}
console.log(`Done`)

console.log(`Populating table Category`)
for (const category of categoryData) {
    try {
        await db.category.create({data: {...category}})
    } catch (error) {
        console.error(`Error inserting category: ${category.name}`)
        console.error(error)
        process.exit(1)
    }
}
console.log(`Done`)

console.log(`Populating table Project`)
let lastLexoRank = LexoRank.middle()
for (const projectD of projectData) {
    try {
        let showcaseId: string
        const showcaseRecord = await db.showcase.findFirst({
            where: {
                name: projectD.showcase.name,
                year: projectD.showcase.year,
                semester: projectD.showcase.semester
            }
        })
        if (!showcaseRecord) {
            throw new Error(`No showcase found with: Name: ${projectD.showcase.name}, Year: ${projectD.showcase.year}, Semester: ${projectD.showcase.semester}`)
        }
        showcaseId = showcaseRecord.id
        const categoryRecords = await db.category.findMany({
            where: {name: {in: projectD.categoryNames}}
        })
        const categoryIds = categoryRecords.map(cr => cr.id)

        const projectRecord = await db.project.create({
            data: {
                id: projectD.id,
                order: (() => {
                    if (!projectD.featured) return ""
                    lastLexoRank = lastLexoRank.genNext()
                    return lastLexoRank["value"]
                })(),
                showcaseId,
                published: projectD.published,
                featured: projectD.featured === true,
                canBeHero: true,
            }
        })

        await db.projectSlug.create({
            data: {
                projectId: projectD.id,
                slug: projectD.slug,
                assignedDate: new Date()
            }
        })

        const thisProjectMediaData = projectMediaData.filter((m) => {
            return m.projectId === projectRecord.id
        })

        const projectMediaRecords = await db.projectMedia.createManyAndReturn({
            data: thisProjectMediaData.map(({ deviceType, ...m }) => ({
                ...m,
                status: "AVAILABLE",
            })),
        })

        const projectVersionRecord = await db.projectVersion.create({
            data: {
                projectId: projectRecord.id,
                name: projectD.name,
                subtitle: projectD.subtitle,
                description: projectD.description,
                iconUrl: projectD.iconUrl,
                createdAt: new Date(),
                submissionStatus: "APPROVED",
                developerNames: projectD.developerNames,
                heroArtUrl: projectD.heroArtUrl,
                links: projectD.links
            }
        })

        await db.projectVersionMedia.createMany({
            data: projectMediaRecords.map((r) => {
                return {
                    order: "",
                    mediaId: r.id,
                    projectVersionId: projectVersionRecord.id,
                    deviceType: projectMediaData.find((m) => m.mediaUrl === r.mediaUrl)!.deviceType
                }
            })
        })

        for (const categoryId of categoryIds) {
            await db.projectCategory.create({
                data: {categoryId, projectVersionId: projectVersionRecord.id}
            })
        }

    } catch (error) {
        console.error(`Error inserting project: ${projectD.name}`)
        console.error(error)
        process.exit(1)
    }
}
console.log(`Done`)

if (!process.env.DEFAULT_ADMIN_EMAIL || !process.env.DEFAULT_ADMIN_PASSWORD) {
    console.warn(`Missing "DEFAULT_ADMIN_EMAIL" or "DEFAULT_ADMIN_PASSWORD" in .env, not creating default admin account`)
} else {
    console.log("Creating default admin account")
    try {
        await db.user.create({
            data: {
                name: "Dev Team",
                email: process.env.DEFAULT_ADMIN_EMAIL!.toLowerCase(),
                password: await hashPassword(process.env.DEFAULT_ADMIN_PASSWORD!),
                role: "ADMIN"
            }
        })
        console.log(`Done`)
    } catch (e) {
        console.error(`Error creating default admin account`)
        console.error(e)
        process.exit(1)
    }
}

if (process.env.DEFAULT_STUDENT_EMAILS) {
    console.log("Creating default student account(s)")
    if (!process.env.DEFAULT_STUDENT_PASSWORDS) {
        console.error(`Missing "DEFAULT_STUDENT_PASSWORDS" in .env`)
        process.exit(1)
    }
    if (!process.env.DEFAULT_STUDENT_NAMES) {
        console.error(`Missing "DEFAULT_STUDENT_NAMES" in .env`)
        process.exit(1)
    }
    const studentEmails = process.env.DEFAULT_STUDENT_EMAILS.split(",")
    const studentPasswords = process.env.DEFAULT_STUDENT_PASSWORDS.split(",")
    const studentNames = process.env.DEFAULT_STUDENT_NAMES.split(",")
    if (studentEmails.length !== studentPasswords.length || studentEmails.length !== studentNames.length) {
        console.error(`Mismatched length between "DEFAULT_STUDENT_EMAILS", "DEFAULT_STUDENT_PASSWORDS", "DEFAULT_STUDENT_NAMES"`)
        process.exit(1)
    }
    const studentData: Prisma.UserCreateManyInput[] = []
    for (let i = 0; i < studentEmails.length; i++) {
        studentData.push({
            email: studentEmails[i].toLowerCase(),
            password: await hashPassword(studentPasswords[i]),
            name: studentNames[i],
            role: "STUDENT"
        })
    }
    await db.user.createMany({
        data: studentData
    })

} else {
    console.warn(`Missing "DEFAULT_STUDENT_EMAILS" in .env, not creating default student accounts`)
}

console.log(`Script finished successfully :)`)
process.exit(0)
