import { defineConfig } from "eslint/config";
import prettier from "eslint-config-prettier/flat";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import importSortPlugin from "eslint-plugin-simple-import-sort";
import tsPlugin from "typescript-eslint";

export default defineConfig([
    {
        files: ["**/*.{js,ts,jsx,tsx}"],
        ignores: ["node_modules"],
        ...prettier,
    },

    {
        files: ["**/*.{js,jsx,ts,tsx}"],
        plugins: {
            react: reactPlugin,
            "@typescript-eslint": tsPlugin.plugin,
            "simple-import-sort": importSortPlugin,
            "react-hooks": reactHooksPlugin,
        },
        rules: {
            "react/react-in-jsx-scope": "off",
            "react/prop-types": "off",
            "react-hooks/rules-of-hooks": "error",
            "react-hooks/exhaustive-deps": "warn",
            //sort imports
            "simple-import-sort/imports": "error",
            "simple-import-sort/exports": "error",
            //general linting rules
            "curly": ["error"],
            "no-duplicate-case": "error",
            "no-unused-vars": "error",
            "require-atomic-updates": "error",
            "arrow-body-style": ["error", "as-needed", { "requireReturnForObjectLiteral": true }],
            "camelcase": ["error", { "ignoreDestructuring": true }],
            "default-case-last": "error",
            "no-implicit-coercion": "error",
            "prefer-spread": "error",
            "@typescript-eslint/explicit-function-return-type": ["warn"],
            "@typescript-eslint/no-explicit-any": ["warn"],
        },
        languageOptions: {
            parser: tsPlugin.parser,
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module",
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
    },

    // Prettier integration
]);
