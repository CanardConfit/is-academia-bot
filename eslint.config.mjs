import tseslint from 'typescript-eslint';
import prettier from "eslint-plugin-prettier";
import globals from "globals";
import eslint from '@eslint/js';

export default tseslint.config(
  {
    ignores: ["**/node_modules"],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.stylistic, {
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      prettier,
    },

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },

      parser: tseslint.parser,
      ecmaVersion: "latest",
      sourceType: "module",

      parserOptions: {
        project: "./tsconfig.json",
      },
    },

    rules: {
      "no-multiple-empty-lines": 2,
      "prettier/prettier": ["error"],
    },
  });