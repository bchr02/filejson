import js from "@eslint/js";
import globals from "globals";

export default [
  {
    ignores: ["node_modules/", "coverage/", ".nyc_output/", "test/test-files/", "**/*.min.js", "eslint.config.mjs"],
  },
  {
    files: ["**/*.mjs"],
    languageOptions: { sourceType: "module" },
  },
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "script",
      globals: {
        ...globals.node,
        ...globals.mocha,
      },
    },
    rules: {
      indent: ["error", 4, { SwitchCase: 1 }],
      "linebreak-style": "off",
      quotes: ["error", "double", { avoidEscape: true }],
      semi: ["error", "always"],
      "no-console": "off",
      "no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "no-trailing-spaces": "error",
      "eol-last": ["error", "always"],
      "comma-dangle": ["error", "never"],
      "no-multiple-empty-lines": ["error", { max: 2, maxEOF: 1 }],
      "space-before-function-paren": [
        "error",
        {
          anonymous: "never",
          named: "never",
          asyncArrow: "always",
        },
      ],
      "keyword-spacing": ["error", { before: true, after: true }],
      "space-before-blocks": "error",
      "object-curly-spacing": ["error", "always"],
      "array-bracket-spacing": ["error", "never"],
      "no-var": "warn",
      "prefer-const": "warn",
    },
  },
];
