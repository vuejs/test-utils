import { defineConfig, globalIgnores } from 'eslint/config'
import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import prettierPluginRecommended from 'eslint-plugin-prettier/recommended'

export default defineConfig(
  globalIgnores(['docs/.vitepress', 'coverage', 'dist']),
  {
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      prettierPluginRecommended
    ],
    rules: {
      'prettier/prettier': ['error'],
      'no-restricted-imports': ['error', { patterns: ['src/*'] }],

      '@typescript-eslint/consistent-type-imports': 'error',

      // Currently, disabled to avoid a lot of changes during migration
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/ban-ts-comment': 'off'
    }
  }
)
