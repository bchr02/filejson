module.exports = {
    env: {
        es6: true,
        node: true,
        mocha: true
    },
    extends: "eslint:recommended",
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: "script"
    },
    rules: {
        indent: ["error", 4, { SwitchCase: 1 }],
        "linebreak-style": "off", // Allow both Unix and Windows line endings
        quotes: ["error", "double", { avoidEscape: true }],
        semi: ["error", "always"],
        "no-console": "off",
        "no-unused-vars": [
            "error",
            {
                argsIgnorePattern: "^_",
                varsIgnorePattern: "^_"
            }
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
                asyncArrow: "always"
            }
        ],
        "keyword-spacing": ["error", { before: true, after: true }],
        "space-before-blocks": "error",
        "object-curly-spacing": ["error", "always"],
        "array-bracket-spacing": ["error", "never"],
        "no-var": "warn",
        "prefer-const": "warn"
    }
};
