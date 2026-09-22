const testflightLink = "https://testflight.apple.com/join/xxxxxx"
const appStoreLink = "https://apps.apple.com/au/app/rmit-app/id1584926663"
const githubLink = "https://github.com/odisfm/hapi"
const externalLink = "https://example.com/"

const links = []

if (Math.random() > 0.5) links.push(testflightLink)
if (Math.random() > 0.5) links.push(appStoreLink)
if (Math.random() > 0.5) links.push(githubLink)
if (Math.random() > 0.5) links.push(externalLink)

const shuffledLinks = []

while (links.length > 0) {
    const idx = Math.floor(Math.random() * links.length)
    const link = links.splice(idx, 1)
    shuffledLinks.push(link[0])
}

console.log(`links: ${JSON.stringify(shuffledLinks, null, 2)},`)

