import { defineConfig } from 'vitest/config'
import viteConfig from './vite.config.js'

export default defineConfig({
    ...viteConfig,
    test: {
        name: 'client',
        environment: 'jsdom',
        include: ['src/**/*.test.{ts,tsx}'],
        setupFiles: ['./src/test/setup.ts'],
    },
})