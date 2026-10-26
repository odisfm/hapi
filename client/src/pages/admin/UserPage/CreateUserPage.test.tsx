import {render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {CreateUserPage} from './CreateUserPage.tsx'

const {navigate, dispatchModal, modalContext} = vi.hoisted(() => {
    const dispatchModal = vi.fn()
    return {navigate: vi.fn(), dispatchModal, modalContext: {dispatchModal}}
})

vi.mock('react-router', async (importOriginal) => ({
    ...(await importOriginal<typeof import('react-router')>()),
    useNavigate: () => navigate,
}))

vi.mock('../../../contexts/modal/useModal.ts', () => ({
    useModal: () => modalContext,
}))

const fetchMock = vi.fn()

function csvFile(contents: string) {
    return new File([contents], 'users.csv', {type: 'text/csv'})
}

function fileInput() {
    // the file input's label isn't associated with it
    return document.querySelector<HTMLInputElement>('input[type="file"]')!
}

function sentBody() {
    return JSON.parse(fetchMock.mock.calls[0][1].body)
}

describe('CreateUserPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        fetchMock.mockReset()
        vi.stubGlobal('fetch', fetchMock)
        vi.spyOn(console, 'error').mockImplementation(() => {})
        dispatchModal.mockResolvedValue('ok')
    })

    afterEach(() => {
        vi.unstubAllGlobals()
        vi.restoreAllMocks()
    })

    it('starts in single user mode with the student role', () => {
        render(<CreateUserPage/>)

        expect(screen.getByRole('heading', {name: 'Create user'})).toBeInTheDocument()
        expect(screen.getByRole('combobox')).toHaveValue('STUDENT')
        // the email and name labels aren't associated with their inputs
        expect(screen.getAllByRole('textbox')).toHaveLength(2)
        expect(screen.getByPlaceholderText('John Smith')).toBeInTheDocument()
        expect(screen.getByRole('button', {name: 'Create user'})).toBeInTheDocument()
    })

    describe('single user', () => {
        async function fillIn(email: string, name: string) {
            const user = userEvent.setup()
            await user.type(screen.getAllByRole('textbox')[0], email)
            await user.type(screen.getByPlaceholderText('John Smith'), name)
            return user
        }

        it('creates the user and returns to the user list', async () => {
            fetchMock.mockResolvedValue({ok: true})
            render(<CreateUserPage/>)
            const user = await fillIn('jane@example.com', 'Jane Doe')

            await user.click(screen.getByRole('button', {name: 'Create user'}))

            await waitFor(() => expect(navigate).toHaveBeenCalledWith('/dashboard/users'))
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/auth/create'),
                expect.objectContaining({method: 'POST', credentials: 'include'}),
            )
            expect(sentBody()).toEqual({name: 'Jane Doe', email: 'jane@example.com', role: 'STUDENT'})
        })

        it('sends the chosen role', async () => {
            fetchMock.mockResolvedValue({ok: true})
            render(<CreateUserPage/>)
            const user = await fillIn('jane@example.com', 'Jane Doe')

            await user.selectOptions(screen.getByRole('combobox'), 'ADMIN')
            await user.click(screen.getByRole('button', {name: 'Create user'}))

            await waitFor(() => expect(fetchMock).toHaveBeenCalled())
            expect(sentBody().role).toBe('ADMIN')
        })

        it('shows an error and stays put when the request is rejected', async () => {
            fetchMock.mockResolvedValue({ok: false, statusText: 'Conflict'})
            render(<CreateUserPage/>)
            const user = await fillIn('jane@example.com', 'Jane Doe')

            await user.click(screen.getByRole('button', {name: 'Create user'}))

            await waitFor(() => expect(dispatchModal).toHaveBeenCalledWith({headline: 'Error', body: 'Error: Conflict'}))
            expect(navigate).not.toHaveBeenCalled()
        })
    })

    describe('batch create', () => {
        async function switchToBatch() {
            const user = userEvent.setup()
            await user.click(screen.getByRole('button', {name: 'Batch create'}))
            return user
        }

        it('shows the CSV upload and hides the single user fields', async () => {
            render(<CreateUserPage/>)
            await switchToBatch()

            expect(fileInput()).toHaveAttribute('accept', '.csv')
            expect(screen.queryByPlaceholderText('John Smith')).not.toBeInTheDocument()
            expect(screen.getByRole('button', {name: 'Create 0 user'})).toBeDisabled()
        })

        it('can switch back to single user mode', async () => {
            render(<CreateUserPage/>)
            const user = await switchToBatch()

            await user.click(screen.getByRole('button', {name: 'Single user'}))

            expect(screen.getByPlaceholderText('John Smith')).toBeInTheDocument()
        })

        it('lists the users from an uploaded CSV', async () => {
            render(<CreateUserPage/>)
            const user = await switchToBatch()

            await user.upload(fileInput(), csvFile('Jane Doe,jane@example.com\r\nJohn Smith,john@example.com\n'))

            expect(await screen.findByRole('button', {name: 'Create 2 users'})).toBeEnabled()
            const rows = screen.getAllByRole('row').slice(1).map((row) => row.textContent)
            expect(rows).toEqual(['1Jane Doejane@example.com', '2John Smithjohn@example.com'])
        })

        it('uses the singular for a single user', async () => {
            render(<CreateUserPage/>)
            const user = await switchToBatch()

            await user.upload(fileInput(), csvFile('Jane Doe,jane@example.com'))

            expect(await screen.findByRole('button', {name: 'Create 1 user'})).toBeEnabled()
        })

        it('rejects a CSV with an invalid email and reports the line', async () => {
            render(<CreateUserPage/>)
            const user = await switchToBatch()

            await user.upload(fileInput(), csvFile('Jane Doe,jane@example.com\nJohn Smith,not-an-email'))

            await waitFor(() => expect(dispatchModal).toHaveBeenCalledWith({
                headline: 'Error',
                body: 'Invalid email address on line 2:\nnot-an-email',
            }))
            expect(screen.queryByRole('table')).not.toBeInTheDocument()
            expect(screen.getByRole('button', {name: 'Create 0 user'})).toBeDisabled()
        })

        it('clears a previous upload when a new one is invalid', async () => {
            render(<CreateUserPage/>)
            const user = await switchToBatch()
            await user.upload(fileInput(), csvFile('Jane Doe,jane@example.com'))
            await screen.findByRole('table')

            await user.upload(fileInput(), csvFile('John Smith,nope'))

            await waitFor(() => expect(screen.queryByRole('table')).not.toBeInTheDocument())
        })

        it('creates every user with the chosen role and returns to the user list', async () => {
            fetchMock.mockResolvedValue({ok: true})
            render(<CreateUserPage/>)
            const user = await switchToBatch()
            await user.selectOptions(screen.getByRole('combobox'), 'ADMIN')
            await user.upload(fileInput(), csvFile('Jane Doe,jane@example.com\nJohn Smith,john@example.com'))

            await user.click(await screen.findByRole('button', {name: 'Create 2 users'}))

            await waitFor(() => expect(navigate).toHaveBeenCalledWith('/dashboard/users'))
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('/auth/create/batch'),
                expect.objectContaining({method: 'POST', credentials: 'include'}),
            )
            expect(sentBody()).toEqual({
                users: [
                    {name: 'Jane Doe', email: 'jane@example.com', role: 'ADMIN'},
                    {name: 'John Smith', email: 'john@example.com', role: 'ADMIN'},
                ],
            })
        })

        it('shows an error and stays put when the request fails', async () => {
            fetchMock.mockRejectedValue(new TypeError('Network down'))
            render(<CreateUserPage/>)
            const user = await switchToBatch()
            await user.upload(fileInput(), csvFile('Jane Doe,jane@example.com'))

            await user.click(await screen.findByRole('button', {name: 'Create 1 user'}))

            await waitFor(() => expect(dispatchModal).toHaveBeenCalledWith({
                headline: 'Error',
                body: 'TypeError: Network down',
            }))
            expect(navigate).not.toHaveBeenCalled()
        })

        it('shows an error when the server rejects the batch', async () => {
            fetchMock.mockResolvedValue({ok: false, statusText: 'Bad Request'})
            render(<CreateUserPage/>)
            const user = await switchToBatch()
            await user.upload(fileInput(), csvFile('Jane Doe,jane@example.com'))

            await user.click(await screen.findByRole('button', {name: 'Create 1 user'}))

            await waitFor(() => expect(dispatchModal).toHaveBeenCalledWith({headline: 'Error', body: 'Error: Bad Request'}))
        })
    })
})
