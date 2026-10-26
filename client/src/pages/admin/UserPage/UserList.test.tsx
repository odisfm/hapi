import {render, screen, within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {describe, expect, it, vi} from 'vitest'
import type {UserDetails} from '@hapi/shared/types/apiResponses'
import {AuthContext} from '../../../contexts/auth/AuthContext.tsx'
import {UserList} from './UserList.tsx'

function makeUser(name: string, email: string): UserDetails {
    return {name, email, needsPasswordReset: false, role: 'ADMIN'}
}

const me = makeUser('Me Myself', 'me@example.com')
const other = makeUser('Someone Else', 'other@example.com')

function renderList(users: UserDetails[], loggedIn: UserDetails | null = me) {
    const deleteUser = vi.fn()
    render(
        <AuthContext.Provider value={{
            user: loggedIn,
            setUserDetails: () => {},
            logOut: () => {},
            authPending: false,
        }}>
            <UserList users={users} heading={'Admins'} deleteUser={deleteUser}/>
        </AuthContext.Provider>,
    )
    return {deleteUser, user: userEvent.setup()}
}

function userItem(name: string) {
    return screen.getByText(name).closest('li')!
}

describe('UserList', () => {
    it('shows the heading and each user\'s name and email', () => {
        renderList([me, other])

        expect(screen.getByRole('heading', {name: 'Admins'})).toBeInTheDocument()
        expect(screen.getAllByRole('listitem')).toHaveLength(2)
        expect(within(userItem('Someone Else')).getByText('other@example.com')).toBeInTheDocument()
    })

    it('shows an empty list when there are no users', () => {
        renderList([])

        expect(screen.getByRole('heading', {name: 'Admins'})).toBeInTheDocument()
        expect(screen.queryByRole('listitem')).not.toBeInTheDocument()
    })

    it('deletes another user by email', async () => {
        const {deleteUser, user} = renderList([me, other])

        await user.click(within(userItem('Someone Else')).getByRole('button'))

        expect(deleteUser).toHaveBeenCalledWith('other@example.com')
    })

    it('does not let the logged in user delete themselves', async () => {
        const {deleteUser, user} = renderList([me, other])
        const button = within(userItem('Me Myself')).getByRole('button')

        await user.click(button)

        expect(button).toBeDisabled()
        expect(deleteUser).not.toHaveBeenCalled()
    })

    it('allows deleting everyone when nobody is logged in', () => {
        renderList([me, other], null)

        for (const button of screen.getAllByRole('button')) {
            expect(button).toBeEnabled()
        }
    })
})
