import commandLineArgs from 'command-line-args'
import {db} from "../../db.js"
import {categoryData, projectData, showcaseData} from "./populateDbData.js";

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
await db.showcase.createMany({
    data: showcaseData
})
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
for (const project of projectData) {
    try {
        let showcaseId: string
        let categoryId: string
        const showcaseRecord = await db.showcase.findFirst({
            where: {
                name: project.showcase.name,
                year: project.showcase.year,
                semester: project.showcase.semester
            }
        })
        if (!showcaseRecord) {
            throw new Error(`No showcase found with: Name: ${project.showcase.name}, Year: ${project.showcase.year}, Semester: ${project.showcase.semester}`)
        }
        showcaseId = showcaseRecord.id
        const categoryRecord = await db.category.findFirst({
            where: {name: project.categoryName}
        })
        if (!categoryRecord) {
            throw new Error(`No category called "${project.categoryName}"`)
        }
        categoryId = categoryRecord.id

        await db.project.create({
            data: {
                name: project.name,
                subtitle: project.subtitle,
                description: project.description,
                iconUrl: project.iconUrl,
                developers: project.developers,
                approvalStatus: project.approvalStatus,
                rejectionReason: project.rejectionReason,
                links: project.links,
                order: project.order,
                categoryId,
                showcaseId,
            }
        })

    } catch (error) {
        console.error(`Error inserting project: ${project.name}`)
        console.error(error)
        process.exit(1)
    }
}

console.log(`Script finished successfully :)`)
process.exit(0)
