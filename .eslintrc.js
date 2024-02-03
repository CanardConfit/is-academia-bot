// eslint-disable-next-line no-undef
module.exports = {
  root: true,
  env: {
    es2023: true,
  },
  parser: "@typescript-eslint/parser",
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:prettier/recommended",
  ],
  plugins: [
      "@typescript-eslint"
  ],
  parserOptions: {
    project: ["./tsconfig.json"]
  },
  rules: {
    "no-console": "off",
    "no-debugger": "off",
    "prettier/prettier": [
      "error",
      {
        endOfLine: "auto",
      },
    ],
  },
  overrides: []
};
