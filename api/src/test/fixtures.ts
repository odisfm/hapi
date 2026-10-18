import {randomUUID} from "node:crypto";
import type {
    CategoryModel,
    ProjectCategoryGetPayload,
    ProjectOwnerModel,
    ProjectGetPayload,
    ProjectSlugGetPayload,
    SessionGetPayload,
    ShowcaseModel,
    ShowcaseSlugGetPayload,
    ProjectVersionGetPayload,
    UserModel,
} from "@hapi/shared/prisma/models";

// Factories return complete, fully-joined records. Prisma mocks are typed against scalar-only
// models, so these can be passed to `mockResolvedValue` without casting, while the explicit
// return types here catch typos and schema drift.

export type VersionWithRelations = ProjectVersionGetPayload<{
    include: {
        categories: {include: {category: true}},
        media: {include: {media: true}},
    }
}>

export type ProjectWithRelations = ProjectGetPayload<{
    include: {
        showcase: true,
        slugs: true,
        media: true,
        ownerships: true,
        versions: {
            include: {
                categories: {include: {category: true}},
                media: {include: {media: true}},
            }
        },
    }
}>

export type ProjectCategoryWithCategory = ProjectCategoryGetPayload<{include: {category: true}}>

export type VersionWithProject = VersionWithRelations & {project: ProjectWithRelations}

export type ShowcaseWithProjects = ShowcaseModel & {projects: ProjectWithRelations[]}

export type SessionWithUser = SessionGetPayload<{include: {user: true}}>

export const inPast = (ms = 60_000) => new Date(Date.now() - ms)
export const inFuture = (ms = 60_000) => new Date(Date.now() + ms)

export function makeUser(overrides: Partial<UserModel> = {}): UserModel {
    return {
        id: randomUUID(),
        email: "user@example.com",
        password: "",
        name: "Test User",
        role: "STUDENT",
        needsPasswordReset: false,
        videoTranscodeCredits: 0,
        ...overrides,
    }
}

export function makeSession(overrides: Partial<SessionWithUser> = {}): SessionWithUser {
    const user = overrides.user ?? makeUser()
    return {
        id: randomUUID(),
        userId: user.id,
        expiry: inFuture(),
        user,
        ...overrides,
    }
}

export function makeCategory(overrides: Partial<CategoryModel> = {}): CategoryModel {
    return {
        id: randomUUID(),
        name: "Games",
        ...overrides,
    }
}

export function makeProjectCategory(
    category: CategoryModel = makeCategory(), projectVersionId: string = randomUUID()
): ProjectCategoryWithCategory {
    return {categoryId: category.id, projectVersionId, category}
}

export function makeShowcase(overrides: Partial<ShowcaseWithProjects> = {}): ShowcaseWithProjects {
    return {
        id: randomUUID(),
        name: "Test Showcase",
        year: 2026,
        semester: 1,
        description: null,
        publishedDate: inPast(),
        projects: [],
        ...overrides,
    }
}

export function makeVersion(overrides: Partial<VersionWithRelations> = {}): VersionWithRelations {
    return {
        id: randomUUID(),
        projectId: randomUUID(),
        name: "Test App",
        subtitle: null,
        description: "",
        iconUrl: "",
        developerNames: [],
        submissionStatus: "APPROVED",
        rejectionReason: null,
        reviewerId: null,
        reviewedAt: null,
        links: [],
        heroArtUrl: null,
        createdAt: inPast(),
        submittedAt: null,
        categories: [],
        media: [],
        ...overrides,
    }
}

type ProjectShortcuts = {slug?: string, versionName?: string, categories?: string[]}

/**
 * `slug`, `versionName` and `categories` are shortcuts for the most commonly varied nested fields,
 * and are ignored for any relation that is passed in full. Nested foreign keys follow the project's id.
 */
export function makeProject(
    {slug = "test-app", versionName, categories = [], ...overrides}: Partial<ProjectWithRelations> & ProjectShortcuts = {}
): ProjectWithRelations {
    const id = overrides.id ?? randomUUID()
    const showcase = overrides.showcase ?? makeShowcase()
    const versionId = randomUUID()
    return {
        id,
        canBeHero: false,
        order: null,
        showcaseId: showcase.id,
        published: true,
        featured: false,
        showcase,
        slugs: [{slug, projectId: id, assignedDate: inPast()}],
        versions: [makeVersion({
            id: versionId,
            projectId: id,
            ...(versionName !== undefined && {name: versionName}),
            categories: categories.map(name => makeProjectCategory(makeCategory({name}), versionId)),
        })],
        media: [],
        ownerships: [],
        ...overrides,
    }
}

export function makeOwnership(ownerId: string, projectId: string): ProjectOwnerModel {
    return {ownerId, projectId}
}

/** A version joined to its parent project, whose `versions` contains just this version. */
export function makeVersionWithProject(
    {project, ...overrides}: Partial<VersionWithRelations> & {project?: ProjectWithRelations} = {}
): VersionWithProject {
    const version = makeVersion(overrides)
    const parent = project ?? makeProject({id: version.projectId, versions: [version]})
    return {...version, projectId: parent.id, project: parent}
}

export function makeProjectSlug(
    overrides: Partial<ProjectSlugGetPayload<{include: {project: true}}>> & {project?: ProjectWithRelations} = {}
): ProjectSlugGetPayload<{include: {project: true}}> & {project: ProjectWithRelations} {
    const project = overrides.project ?? makeProject()
    return {
        slug: project.slugs[0]?.slug ?? "test-app",
        projectId: project.id,
        assignedDate: inPast(),
        project,
        ...overrides,
    }
}

export function makeShowcaseSlug(
    overrides: Partial<ShowcaseSlugGetPayload<{include: {showcase: true}}>> & {showcase?: ShowcaseWithProjects} = {}
): ShowcaseSlugGetPayload<{include: {showcase: true}}> & {showcase: ShowcaseWithProjects} {
    const showcase = overrides.showcase ?? makeShowcase()
    return {
        slug: "test-showcase",
        showcaseId: showcase.id,
        assignedDate: inPast(),
        showcase,
        ...overrides,
    }
}
