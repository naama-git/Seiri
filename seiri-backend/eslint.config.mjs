// @ts-check
// eslint.config.mjs
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default tseslint.config(
 
  [
    {
      ignores: ['eslint.config.mjs'],
    },
    eslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    eslintPluginPrettierRecommended,
    {
      languageOptions: {
        globals: {
          ...globals.node,
          ...globals.jest,
        },
        parserOptions: {
          projectService: true,
          // tsconfigRootDir: import.meta.dirname,
        },
      },
    },
    {
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-floating-promises': 'warn',
        '@typescript-eslint/no-unsafe-argument': 'warn',
        'prettier/prettier': ['error', { endOfLine: 'auto' }],
        'quotes': ['error', 'single'],


        '@typescript-eslint/naming-convention': [
        'error',
          {
            selector: 'default',
            format: ['camelCase'],
            leadingUnderscore: 'allow', 
          },
          // Interfaces, Classes,Enums...
          {
            selector: 'typeLike, decorator',
            format: ['PascalCase'],
          },
         
          {
            selector: ['variable'],
            modifiers: ['const'],
            format: ['camelCase', 'UPPER_CASE'],
          },
          {
           selector: 'property',
           format: ['camelCase', 'snake_case'],
          },
        ],
      },
    },
  ] 
);