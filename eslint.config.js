import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
    { ignores: ['dist/', 'src/generated/'] },
    js.configs.recommended,
    tseslint.configs.recommended,
    {
        files: ['src/**/*.ts'],
        ignores: ['src/**/*.spec.ts'],
        rules: {
            // The same input has to give the same result on any machine and any day, so the current time is
            // always a parameter.
            'no-restricted-syntax': [
                'error',
                { selector: 'NewExpression[callee.name="Date"][arguments.length=0]', message: 'Take the current time as a parameter.' },
                { selector: 'CallExpression[callee.object.name="Date"][callee.property.name="now"]', message: 'Take the current time as a parameter.' },
            ],
        },
    },
    {
        files: ['scripts/**/*.ts', '*.config.{js,ts}'],
        languageOptions: { globals: globals.node },
    },
);
