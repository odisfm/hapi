import puppeteer from "puppeteer-core";
import commandLineArgs from "command-line-args";
import {projectData, type NewProjectType} from "./populateDbData";
import {v4 as createUuid} from "uuid";
import { createWriteStream } from "node:fs"
import { mkdir } from "node:fs/promises"
import path from "node:path"
import { Readable } from "node:stream"
import { pipeline } from "node:stream/promises"
import type { ReadableStream as WebReadableStream } from "node:stream/web"

const cliArgDefinitions = [
    { name: "path-to-chrome", alias: "c", type: String, required: false },
    { name: "app-uuid", alias: "u", type: String, required: false },
    { name: "output-dir", alias: "o", type: String },
]

const deviceFriendlyToEnum = {
    "iPhone": "PHONE",
    "iPad": "TABLET",
    "Mac": "DESKTOP",
    "Apple Watch": "WATCH",
    "Apple Vision": "AR",
    "Apple TV": "TV"
}

function toPlatformEnum(label: string): string | undefined {
    const normalized = label.replace(/\s+/g, " ").trim();
    return deviceFriendlyToEnum[normalized as never];
}

const cliArgs = commandLineArgs(cliArgDefinitions)

const outputDir = cliArgs["output-dir"]
    ? path.resolve(cliArgs["output-dir"])
    : path.join(process.cwd(), "scraper-output")

await mkdir(outputDir, { recursive: true })

const browser = await puppeteer.launch({
    headless: true,
    ...(!cliArgs["path-to-chrome"] ? {channel: 'chrome'} : {executablePath: cliArgs["path-to-chrome"]})
});
const page = await browser.newPage();


async function getMedia(project: NewProjectType) {
    await page.goto(`https://apps.apple.com/au/iphone/search?term=${encodeURIComponent(project.name)}`)

// console.log("waiting for page load...")
    await page.waitForSelector('div.app-icon-container');
// console.log("clicking app...")
    await page.locator('div.link-container a').click();
    try {
        await page.locator("button.expanded-media-header").click();
    } catch (e) {
    }
// console.log("waiting for platform labels...")
    await page.waitForSelector('div.platform-label');
// console.log("collecting platforms...")

    const platforms: string[] = await page.$$eval("div.platform-label", (platformLabels) => {
        return platformLabels.map((pl) => {
            return pl.innerText
        })
    })

// console.log(platforms)

    await page.$$eval("ul.shelf-grid__list > li", async (items) => {
        for (const item of items) {
            item.scrollIntoView({block: "center", inline: "center"})
            await new Promise((r) => setTimeout(r, 100))
        }
    })

    const urls: string[][] = await page.$$eval("ul.shelf-grid__list", (shelfGrids) => {
        const outerList: string[][] = []

        for (const shelfGrid of shelfGrids) {
            const list: string[] = []

            if (!shelfGrid.className.includes("screenshot") && !shelfGrid.className.includes("Screenshot")) {
                continue
            }

            for (const picture of shelfGrid.querySelectorAll("picture")) {
                const img = picture.querySelector("img")
                let bestUrl = ""
                let bestWidth = -1

                const srcsets = [
                    ...[...picture.querySelectorAll("source")].flatMap((s) => [
                        s.getAttribute("srcset"),
                        s.getAttribute("data-srcset"),
                    ]),
                    img?.getAttribute("srcset"),
                    img?.getAttribute("data-srcset"),
                ]

                for (const srcset of srcsets) {
                    for (const candidate of (srcset ?? "").split(",")) {
                        const [url, descriptor = "0w"] = candidate.trim().split(/\s+/)
                        if (!url || url.startsWith("data:")) continue
                        const width = parseFloat(descriptor) || 0 // "296w" -> 296, "2x" -> 2
                        if (width > bestWidth) {
                            bestWidth = width
                            bestUrl = url
                        }
                    }
                }

                if (!bestUrl && img) {
                    const src = img.currentSrc || img.src
                    if (src && !src.startsWith("data:")) bestUrl = src
                }

                if (bestUrl) list.push(bestUrl)
            }

            if (list.length) outerList.push(list)
        }

        return outerList
    })

    let output: string = `// ${project.name} | media`

    for (let i = 0; i < platforms.length; i += 1) {
        const platformLabel = platforms[i]
        // console.log(`downloading ${platformLabel}`)
        const platformLabelEnum = toPlatformEnum(platformLabel)
        for (const url of urls[i]) {
            const uuid = createUuid()
            const ext = path.extname(new URL(url).pathname)
            const filePath = path.join(outputDir, `${uuid}${ext}`)

            const res = await fetch(url)
            if (!res.ok || !res.body) {
                console.error(`failed to download ${url}: ${res.status} ${res.statusText}`)
                continue
            }

            await pipeline(
                Readable.fromWeb(res.body as WebReadableStream),
                createWriteStream(filePath),
            )

            output += `
            {
                projectId: "${project.id}",
                mediaUrl: "${uuid}",
                deviceType: "${platformLabelEnum}",
                mediaType: "SCREENSHOT",
            },`
        }
    }
    console.log(output)
}

if (cliArgs["app-uuid"]) {
    const project = projectData.find((p) => p.id === cliArgs["app-uuid"])
    if (!project) {
        console.error(`No project in populateDbData.ts with id: ${cliArgs["app-uuid"]}`)
        process.exit(1)
    }
} else {
    console.log(`Arg "--app-uuid" not passed, getting media for every project`)
    console.log(`${projectData.length} projects, this will take a while...\n(no console output while script runs)\n`)
    for (const project of projectData) {
        await getMedia(project)
    }
}

console.log("Done!\n\n\n")
process.exit(0)

