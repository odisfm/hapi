import {render, screen} from '@testing-library/react'
import {describe, expect, it} from 'vitest'
import {AppIcon} from './AppIcon.tsx'

describe('AppIcon', () => {
    describe('with an icon', () => {
        it('shows the icon image with an accessible name', () => {
            render(<AppIcon uri="example-icon" width={100}/>)

            expect(screen.getByRole('img', {name: 'App icon'}))
                .toHaveAttribute('src', expect.stringContaining('example-icon.webp'))
        })

        it('sizes the icon to the requested width', () => {
            render(<AppIcon uri="example-icon" width={64}/>)

            expect(screen.getByRole('img', {name: 'App icon'}))
                .toHaveStyle({width: '64px', height: '64px'})
        })
    })

    describe('without an icon', () => {
        it('does not show an icon image', () => {
            render(<AppIcon uri="" width={100}/>)

            expect(screen.queryByRole('img', {name: 'App icon'})).not.toBeInTheDocument()
        })
    })
})