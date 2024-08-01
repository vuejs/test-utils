import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import prettierPluginRecommended from 'eslint-plugin-prettier/recommended'

export default [
  {
    ignores: ['docs/.vitepress', 'coverage', 'dist']
  },
  ...tseslint.config({
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      prettierPluginRecommended
    ],
    rules: {
      'prettier/prettier': ['error'],
      'no-restricted-imports': [
        'error',
        {
          patterns: ['src/*']
        }
      ],

      // Currently, disabled to avoid a lot of changes during migration
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/ban-ts-comment': 'off'
    }
  })
]
