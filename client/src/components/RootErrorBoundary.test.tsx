import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type {ReactNode} from 'react'
import {createMemoryRouter, data, RouterProvider} from 'react-router'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {RootErrorBoundary} from './RootErrorBoundary.tsx'

vi.mock('../App.tsx', () => ({
    default: ({children}: {children?: ReactNode}) => <div>{children}</div>,
}))

function renderWithError(loader: () => never) {
    const router = createMemoryRouter(
        [
            {path: '/', element: <h1>Home page</h1>},
            {path: '/broken', loader, errorElement: <RootErrorBoundary/>},
        ],
        {initialEntries: ['/broken']},
    )
    return render(<RouterProvider router={router}/>)
}

function throwNotFound(): never {
    throw data('Not found', {status: 404})
}

function throwUnexpected(): never {
    throw new Error('Something broke')
}

describe('RootErrorBoundary', () => {
    beforeEach(() => {
        vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    describe('when the route responds with an error status', () => {
        it('shows the 404 message', async () => {
            renderWithError(throwNotFound)

            expect(await screen.findByRole('heading', {name: 'Error 404'})).toBeInTheDocument()
            expect(screen.getByText(/this page wandered off/i)).toBeInTheDocument()
        })

        it('does not show the generic error message', async () => {
            renderWithError(throwNotFound)

            await screen.findByRole('heading', {name: 'Error 404'})

            expect(screen.queryByRole('heading', {name: 'An error occurred'})).not.toBeInTheDocument()
        })

        it('takes the user home when HOME PAGE is clicked', async () => {
            const user = userEvent.setup()
            renderWithError(throwNotFound)

            await user.click(await screen.findByRole('button', {name: 'HOME PAGE'}))

            expect(await screen.findByRole('heading', {name: 'Home page'})).toBeInTheDocument()
            expect(screen.queryByRole('heading', {name: 'Error 404'})).not.toBeInTheDocument()
        })
    })

    describe('when something unexpected is thrown', () => {
        it('shows the generic error message', async () => {
            renderWithError(throwUnexpected)

            expect(await screen.findByRole('heading', {name: 'An error occurred'})).toBeInTheDocument()
        })

        it('does not show the 404 message', async () => {
            renderWithError(throwUnexpected)

            await screen.findByRole('heading', {name: 'An error occurred'})

            expect(screen.queryByRole('heading', {name: 'Error 404'})).not.toBeInTheDocument()
        })

        it('links back to the home page', async () => {
            const user = userEvent.setup()
            renderWithError(throwUnexpected)

            const link = await screen.findByRole('link', {name: 'HOME PAGE'})
            expect(link).toHaveAttribute('href', '/')

            await user.click(link)

            expect(await screen.findByRole('heading', {name: 'Home page'})).toBeInTheDocument()
        })
    })
})