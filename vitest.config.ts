import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        // The specs were first written for Jasmine and use its global describe/it/expect.
        globals: true,
        include: ['src/**/*.spec.ts', 'scripts/**/*.spec.ts'],
    },
});
