import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {afterEach, describe, expect, it, vi} from 'vitest'
import {TextItemEditor} from './TextItemEditor.tsx'

const setItems = vi.fn()
const isUrl = (value: string) => value.startsWith('https://')

function renderEditor(items: string[] = []) {
    return render(
        <>
            <TextItemEditor items={items} setItems={setItems} validator={isUrl} placeholder="https://example.com"/>
            <button type="button">Elsewhere</button>
        </>,
    )
}

function input() {
    return screen.getByRole('textbox', {name: 'New link input'})
}

describe('TextItemEditor', () => {
    afterEach(() => {
        vi.clearAllMocks()
    })

    it('lists the current items', () => {
        renderEditor(['https://a.com', 'https://b.com'])

        expect(screen.getAllByRole('listitem').map((li) => li.textContent)).toEqual(['https://a.com', 'https://b.com'])
        expect(input()).toHaveAttribute('placeholder', 'https://example.com')
    })

    describe('removing', () => {
        it('removes only the clicked item', async () => {
            const user = userEvent.setup()
            renderEditor(['https://a.com', 'https://b.com', 'https://c.com'])

            await user.click(screen.getByRole('button', {name: 'Remove https://b.com'}))

            expect(setItems).toHaveBeenCalledWith(['https://a.com', 'https://c.com'])
        })
    })

    describe('adding', () => {
        it('appends a valid item and clears the input when Add is clicked', async () => {
            const user = userEvent.setup()
            renderEditor(['https://a.com'])

            await user.type(input(), 'https://new.com')
            await user.click(screen.getByRole('button', {name: 'Add item'}))

            expect(setItems).toHaveBeenCalledWith(['https://a.com', 'https://new.com'])
            expect(input()).toHaveValue('')
        })

        it('appends the item when Enter is pressed in the input', async () => {
            const user = userEvent.setup()
            renderEditor()

            await user.type(input(), 'https://new.com{Enter}')

            expect(setItems).toHaveBeenCalledWith(['https://new.com'])
        })

        it('ignores Enter when the input is not focused', async () => {
            const user = userEvent.setup()
            renderEditor()
            await user.type(input(), 'https://new.com')

            await user.click(screen.getByRole('button', {name: 'Elsewhere'}))
            await user.keyboard('{Enter}')

            expect(setItems).not.toHaveBeenCalled()
        })

        it('does nothing when the input is empty', async () => {
            const user = userEvent.setup()
            renderEditor()

            await user.click(screen.getByRole('button', {name: 'Add item'}))

            expect(setItems).not.toHaveBeenCalled()
        })

        it('refuses an item the validator rejects and keeps it in the input', async () => {
            const user = userEvent.setup()
            renderEditor()

            await user.type(input(), 'not a link')
            await user.click(screen.getByRole('button', {name: 'Add item'}))

            expect(setItems).not.toHaveBeenCalled()
            expect(input()).toHaveValue('not a link')
            // Invalid state is only conveyed by a red border
            expect(input()).toHaveClass('border-red-700')
        })

        it('accepts the item once it has been corrected', async () => {
            const user = userEvent.setup()
            renderEditor()

            await user.type(input(), 'oops')
            await user.clear(input())
            expect(input()).not.toHaveClass('border-red-700')
            await user.type(input(), 'https://fixed.com')
            await user.click(screen.getByRole('button', {name: 'Add item'}))

            expect(setItems).toHaveBeenCalledWith(['https://fixed.com'])
        })
    })
})
