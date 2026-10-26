import {render, screen, waitFor, within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {MemoryRouter, Route, Routes} from 'react-router'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {deviceEnumFriendly} from '../../../consts.ts'
import ProjectPage from './ProjectPage.tsx'

vi.mock('./MediaCarousel.tsx', () => ({
    MediaCarousel: ({media, videoUrl}: {media: {uri: string}[]; videoUrl: string | null}) => (
        <div>
            <ul aria-label="Screenshots">
                {media.map((m) => (
                    <li key={m.uri}>{m.uri}</li>
                ))}
            </ul>
            {videoUrl && <p>Video: {videoUrl}</p>}
        </div>
    ),
}))

type Media = {
    id: string
    uri: string
    mediaType: 'SCREENSHOT' | 'VIDEO'
    deviceType: 'PHONE' | 'TABLET' | 'DESKTOP' | 'AR' | 'WATCH' | 'TV'
    order: string
    status: 'AVAILABLE' | 'PENDING' | 'FAILED'
}

function makeMedia(
    uri: string,
    deviceType: Media['deviceType'] = 'DESKTOP',
    overrides: Partial<Media> = {},
): Media {
    return {id: uri, uri, mediaType: 'SCREENSHOT', deviceType, order: '1', status: 'AVAILABLE', ...overrides}
}

function makeProject(overrides: Record<string, unknown> = {}) {
    return {
        id: 'project-1',
        name: 'Example project',
        subtitle: 'A project subtitle',
        iconUrl: 'example-icon',
        slug: 'example-project',
        developers: ['Alice'],
        categories: ['Games'],
        links: [] as string[],
        description: 'A description of the project.',
        media: [] as Media[],
        showcase: {
            id: 'showcase-1',
            name: 'Spring Showcase',
            slug: 'spring-showcase',
        },
        ...overrides,
    }
}

function projectResponse(project: ReturnType<typeof makeProject>) {
    return {ok: true, status: 200, json: async () => ({project})}
}

function setTouchScreen(isTouch: boolean) {
    vi.stubGlobal('matchMedia', vi.fn(() => ({matches: isTouch})))
}

function setScreenSize(width: number, height: number) {
    Object.defineProperty(window.screen, 'width', {value: width, configurable: true})
    Object.defineProperty(window.screen, 'height', {value: height, configurable: true})
}

function renderPage(slug = 'example-project') {
    return render(
        <MemoryRouter initialEntries={[`/project/${slug}`]}>
            <Routes>
                <Route path="/project/:projectSlug" element={<ProjectPage/>}/>
            </Routes>
        </MemoryRouter>,
    )
}

const fetchMock = vi.fn()
const scrollIntoView = vi.fn()

async function renderLoaded(overrides: Record<string, unknown> = {}) {
    fetchMock.mockResolvedValue(projectResponse(makeProject(overrides)))
    renderPage()
    await screen.findByRole('heading', {name: 'Example project'})
}

async function waitForShowing(label: string) {
    await waitFor(() =>
        expect(screen.getByRole('button', {name: /showing/i})).toHaveTextContent(`Showing ${label}`),
    )
}

describe('ProjectPage', () => {
    beforeEach(() => {
        fetchMock.mockReset()
        scrollIntoView.mockClear()
        vi.stubGlobal('fetch', fetchMock)
        setTouchScreen(false)
        window.HTMLElement.prototype.scrollIntoView = scrollIntoView
        vi.spyOn(window, 'open').mockImplementation(() => null)
    })

    afterEach(() => {
        vi.unstubAllGlobals()
        vi.restoreAllMocks()
    })

    describe('loading', () => {
        it('requests the project for the slug in the URL', async () => {
            await renderLoaded()

            expect(fetchMock).toHaveBeenCalledTimes(1)
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/project/example-project'),
                expect.anything(),
            )
        })

        it('shows neither the project nor an error while loading', () => {
            fetchMock.mockReturnValue(new Promise(() => {}))
            renderPage()

            expect(screen.queryByRole('heading', {name: 'Example project'})).not.toBeInTheDocument()
            expect(screen.queryByRole('alert')).not.toBeInTheDocument()
        })

        it('cancels the request when the page is left', () => {
            fetchMock.mockReturnValue(new Promise(() => {}))
            const {unmount} = renderPage()
            const signal = fetchMock.mock.calls[0][1].signal as AbortSignal

            expect(signal.aborted).toBe(false)

            unmount()

            expect(signal.aborted).toBe(true)
        })
    })

    describe('when loading fails', () => {
        it('says the project was not found for a 404', async () => {
            fetchMock.mockResolvedValue({ok: false, status: 404, json: async () => ({})})
            renderPage()

            expect(await screen.findByRole('alert')).toHaveTextContent('Project not found.')
        })

        it('says it could not load the project for other server errors', async () => {
            fetchMock.mockResolvedValue({ok: false, status: 500, json: async () => ({})})
            renderPage()

            expect(await screen.findByRole('alert')).toHaveTextContent('Unable to load this project.')
        })

        it('says it could not load the project when the request fails', async () => {
            fetchMock.mockRejectedValue(new TypeError('Network down'))
            renderPage()

            expect(await screen.findByRole('alert')).toHaveTextContent('Unable to load this project.')
        })
    })

    describe('project details', () => {
        it('shows the name, subtitle and icon', async () => {
            await renderLoaded()

            expect(screen.getByText('A project subtitle')).toBeInTheDocument()
            expect(screen.getByRole('img', {name: 'App icon'})).toBeInTheDocument()
        })

        it('links the showcase name to its page', async () => {
            await renderLoaded()

            expect(screen.getByRole('link', {name: 'Spring Showcase'}))
                .toHaveAttribute('href', '/showcase/spring-showcase')
        })

        it('hides the showcase section when there is no showcase', async () => {
            await renderLoaded({showcase: undefined})

            expect(screen.queryByText('Showcase')).not.toBeInTheDocument()
        })

        it('labels a single developer as "Developer"', async () => {
            await renderLoaded({developers: ['Alice']})

            expect(screen.getByText('Developer')).toBeInTheDocument()
            expect(screen.getByText('Alice')).toBeInTheDocument()
        })

        it('labels several developers as "Developers" and lists them', async () => {
            await renderLoaded({developers: ['Alice', 'Bob']})

            expect(screen.getByText('Developers')).toBeInTheDocument()
            expect(screen.getByText('Alice, Bob')).toBeInTheDocument()
        })

        it('labels a single category as "Category"', async () => {
            await renderLoaded({categories: ['Games']})

            expect(screen.getByText('Category')).toBeInTheDocument()
            expect(screen.getByText('Games')).toBeInTheDocument()
        })

        it('shows up to three categories, then how many more there are', async () => {
            await renderLoaded({categories: ['Health', 'Education', 'Games', 'Workplace', 'Travel']})

            expect(screen.getByText('Categories')).toBeInTheDocument()
            expect(screen.getByText('Health, Education, Games +2')).toBeInTheDocument()
        })

        it('hides the category section when there are no categories', async () => {
            await renderLoaded({categories: []})

            expect(screen.queryByText('Category')).not.toBeInTheDocument()
            expect(screen.queryByText('Categories')).not.toBeInTheDocument()
        })

        it('renders the description as formatted markdown', async () => {
            await renderLoaded({description: '## Features\n\nWorks offline.'})

            expect(screen.getByRole('heading', {name: 'Features'})).toBeInTheDocument()
            expect(screen.getByText('Works offline.')).toBeInTheDocument()
        })

        it('expands and collapses the description', async () => {
            const user = userEvent.setup()
            await renderLoaded()

            await user.click(screen.getByRole('button', {name: 'View More ↓'}))

            expect(screen.getByRole('button', {name: 'View Less ↑'})).toBeInTheDocument()
            expect(screen.queryByRole('button', {name: 'View More ↓'})).not.toBeInTheDocument()

            await user.click(screen.getByRole('button', {name: 'View Less ↑'}))

            expect(screen.getByRole('button', {name: 'View More ↓'})).toBeInTheDocument()
        })
    })

    describe('getting the project', () => {
        it('offers a contact button, and no install section, when there are no links', async () => {
            const user = userEvent.setup()
            await renderLoaded({links: []})

            expect(screen.queryByRole('button', {name: 'GET'})).not.toBeInTheDocument()
            expect(screen.queryByRole('heading', {name: 'Get Example project'})).not.toBeInTheDocument()

            await user.click(screen.getByRole('button', {name: 'CONTACT US'}))

            expect(window.open).toHaveBeenCalledWith('mailto:hapi@rmit.edu.au')
        })

        it('offers a GET button that scrolls to the install section when there are links', async () => {
            const user = userEvent.setup()
            await renderLoaded({links: ['https://example.com']})

            expect(screen.getByRole('heading', {name: 'Get Example project'})).toBeInTheDocument()

            await user.click(screen.getByRole('button', {name: 'GET'}))

            expect(scrollIntoView).toHaveBeenCalledWith({behavior: 'smooth'})
        })

        it('names each link by where it goes, best first', async () => {
            await renderLoaded({
                links: [
                    'https://example.com',
                    'https://github.com/example/app',
                    'https://testflight.apple.com/join/abc',
                    'https://apps.apple.com/app/id123',
                ],
            })

            const linkButtons = screen
                .getAllByRole('button')
                .map((button) => button.textContent)
                .filter((label) => ['App Store', 'TestFlight', 'GitHub', 'Website'].includes(label ?? ''))

            expect(linkButtons).toEqual(['App Store', 'TestFlight', 'GitHub', 'Website'])
        })

        it('opens a link in a new tab when its button is clicked', async () => {
            const user = userEvent.setup()
            await renderLoaded({links: ['https://github.com/example/app']})

            await user.click(screen.getByRole('button', {name: 'GitHub'}))

            expect(window.open).toHaveBeenCalledWith('https://github.com/example/app', '_blank')
        })

        it('always offers a contact button in the install section', async () => {
            const user = userEvent.setup()
            await renderLoaded({links: ['https://example.com']})

            await user.click(screen.getByRole('button', {name: 'CONTACT US'}))

            expect(window.open).toHaveBeenCalledWith('mailto:hapi@rmit.edu.au', '_blank')
        })
    })

    describe('media', () => {
        it('passes available screenshots and the available video to the carousel', async () => {
            await renderLoaded({
                media: [
                    makeMedia('shot-1'),
                    makeMedia('shot-pending', 'DESKTOP', {status: 'PENDING'}),
                    makeMedia('the-video', 'DESKTOP', {mediaType: 'VIDEO'}),
                ],
            })

            const screenshots = within(screen.getByRole('list', {name: 'Screenshots'}))
            expect(screenshots.getByText('shot-1')).toBeInTheDocument()
            expect(screenshots.queryByText('shot-pending')).not.toBeInTheDocument()
            expect(screenshots.queryByText('the-video')).not.toBeInTheDocument()
            expect(screen.getByText('Video: the-video')).toBeInTheDocument()
        })

        it('shows no video when there is none', async () => {
            await renderLoaded({media: [makeMedia('shot-1')]})

            expect(screen.queryByText(/^Video:/)).not.toBeInTheDocument()
        })

        it('starts on the desktop screenshots on a non-touch device', async () => {
            await renderLoaded({media: [makeMedia('phone-shot', 'PHONE'), makeMedia('desktop-shot', 'DESKTOP')]})

            await waitForShowing(deviceEnumFriendly.DESKTOP)

            const screenshots = within(screen.getByRole('list', {name: 'Screenshots'}))
            expect(screenshots.getByText('desktop-shot')).toBeInTheDocument()
            expect(screenshots.queryByText('phone-shot')).not.toBeInTheDocument()
        })

        it('starts on the phone screenshots on a small touch device', async () => {
            setTouchScreen(true)
            setScreenSize(390, 844)
            await renderLoaded({media: [makeMedia('phone-shot', 'PHONE'), makeMedia('desktop-shot', 'DESKTOP')]})

            await waitForShowing(deviceEnumFriendly.PHONE)

            const screenshots = within(screen.getByRole('list', {name: 'Screenshots'}))
            expect(screenshots.getByText('phone-shot')).toBeInTheDocument()
            expect(screenshots.queryByText('desktop-shot')).not.toBeInTheDocument()
        })

        it('falls back to the phone screenshots when none match the device', async () => {
            await renderLoaded({media: [makeMedia('tv-shot', 'TV'), makeMedia('phone-shot', 'PHONE')]})

            await waitForShowing(deviceEnumFriendly.PHONE)

            const screenshots = within(screen.getByRole('list', {name: 'Screenshots'}))
            expect(screenshots.getByText('phone-shot')).toBeInTheDocument()
            expect(screenshots.queryByText('tv-shot')).not.toBeInTheDocument()
        })
    })

    describe('device filter', () => {
        const twoDevices = () => [makeMedia('phone-shot', 'PHONE'), makeMedia('desktop-shot', 'DESKTOP')]

        it('is hidden when the project has only one kind of device', async () => {
            await renderLoaded({media: [makeMedia('desktop-shot', 'DESKTOP')]})

            await waitFor(() =>
                expect(within(screen.getByRole('list', {name: 'Screenshots'})).getByText('desktop-shot'))
                    .toBeInTheDocument(),
            )

            expect(screen.queryByRole('button', {name: /showing/i})).not.toBeInTheDocument()
        })

        it('says which device is being shown', async () => {
            await renderLoaded({media: twoDevices()})

            await waitForShowing(deviceEnumFriendly.DESKTOP)
        })

        it('opens a menu of devices and closes it again when Escape is pressed', async () => {
            const user = userEvent.setup()
            await renderLoaded({media: twoDevices()})

            expect(screen.queryByRole('menu')).not.toBeInTheDocument()

            await user.click(screen.getByRole('button', {name: /showing/i}))
            expect(screen.getByRole('menu')).toBeInTheDocument()

            await user.keyboard('{Escape}')
            expect(screen.queryByRole('menu')).not.toBeInTheDocument()
        })

        it('closes the menu when the user clicks elsewhere', async () => {
            const user = userEvent.setup()
            await renderLoaded({media: twoDevices()})
            await user.click(screen.getByRole('button', {name: /showing/i}))

            await user.click(screen.getByRole('heading', {name: 'Example project'}))

            expect(screen.queryByRole('menu')).not.toBeInTheDocument()
        })

        it('switches the screenshots to the chosen device', async () => {
            const user = userEvent.setup()
            await renderLoaded({media: twoDevices()})
            await waitForShowing(deviceEnumFriendly.DESKTOP)

            await user.click(screen.getByRole('button', {name: /showing/i}))
            await user.click(screen.getByRole('menuitem', {name: new RegExp(`View ${deviceEnumFriendly.PHONE}$`)}))

            const screenshots = within(screen.getByRole('list', {name: 'Screenshots'}))
            expect(screenshots.getByText('phone-shot')).toBeInTheDocument()
            expect(screenshots.queryByText('desktop-shot')).not.toBeInTheDocument()
        })

        it('shows every device again when "View all devices" is chosen', async () => {
            const user = userEvent.setup()
            await renderLoaded({media: twoDevices()})
            await waitForShowing(deviceEnumFriendly.DESKTOP)

            await user.click(screen.getByRole('button', {name: /showing/i}))
            await user.click(screen.getByRole('menuitem', {name: 'View all devices'}))

            const screenshots = within(screen.getByRole('list', {name: 'Screenshots'}))
            expect(screenshots.getByText('phone-shot')).toBeInTheDocument()
            expect(screenshots.getByText('desktop-shot')).toBeInTheDocument()
            expect(screen.getByRole('button', {name: /showing/i})).toHaveTextContent('Showing all devices')
        })
    })
})