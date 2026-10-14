export const API_URL = import.meta.env.VITE_API_URL

export const deviceEnumFriendly = {
    "PHONE": "iPhone",
    "DESKTOP": "MacOS",
    "TABLET": "iPad",
    "WATCH": "Apple Watch",
    "AR": "Apple Vision Pro",
    "TV": "Apple TV"
}

export const headerLinks = [
    { label: "Applications", path: "/search" },
    { label: "Categories", path: "/categories" },
    { label: "Showcases", path: "/showcase" },
] as const

export type HeaderLinkType = (typeof headerLinks)[number]

