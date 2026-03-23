import js from '@eslint/js';
import playwright from 'eslint-plugin-playwright';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const playwrightRecommended = playwright.configs['flat/recommended'];
const typedTypeScriptConfigs = tseslint.configs.recommendedTypeChecked.map((config) => ({
  ...config,
  files: ['**/*.ts']
}));

export default tseslint.config(
  {
    ignores: ['node_modules/**', 'playwright-report/**', 'test-results/**', '.artifacts/**']
  },
  js.configs.recommended,
  ...typedTypeScriptConfigs,
  {
    files: ['**/*.ts'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      }
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports', fixStyle: 'inline-type-imports' }]
    }
  },
  {
    ...playwrightRecommended,
    files: ['playwright.config.ts', 'tests/**/*.ts'],
    languageOptions: {
      ...playwrightRecommended.languageOptions,
      globals: {
        ...globals.node,
        ...globals.browser,
        ...playwrightRecommended.languageOptions?.globals
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      }
    }
  }
);
