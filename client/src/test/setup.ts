import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// jsdom doesn't implement matchMedia. Defining it here (rather than only stubbing it per
// test) means it survives `vi.unstubAllGlobals()`, which can run while a component from the
// previous test is still mounted and about to re-render.
if (typeof window.matchMedia !== 'function') {
    Object.defineProperty(window, 'matchMedia', {
        configurable: true,
        writable: true,
        value: (query: string) => ({
            matches: false,
            media: query,
            onchange: null,
            addEventListener: () => {},
            removeEventListener: () => {},
            addListener: () => {},
            removeListener: () => {},
            dispatchEvent: () => false,
        }),
    })
}

afterEach(() => {
    cleanup()
})
