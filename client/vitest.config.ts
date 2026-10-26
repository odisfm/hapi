import { defineConfig } from 'vitest/config'
import viteConfig from './vite.config.js'

export default defineConfig({
    ...viteConfig,
    test: {
        name: 'client',
        environment: 'jsdom',
        include: ['src/**/*.test.{ts,tsx}'],
        setupFiles: ['./src/test/setup.ts'],
        coverage: {
            provider: 'v8',
            include: ['src/**/*.{ts,tsx}'],
            exclude: [
                'src/**/*.test.{ts,tsx}',
                'src/**/*.spec.{ts,tsx}',
                'src/**/*.d.ts',
                'src/**/index.ts',
            ],
            reporter: ['text', 'html', 'lcov'],
        },
    },
})