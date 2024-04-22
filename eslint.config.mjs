// @ts-check

import eslint from "@eslint/js"
import tseslint from "typescript-eslint"
import prettierConfig from "eslint-config-prettier"

export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    ...tseslint.configs.strictTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
    prettierConfig,
    {
        languageOptions: {
            parserOptions: {
                project: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
    {
        rules: {
            "@typescript-eslint/restrict-template-expressions": [
                "error",
                {
                    allowNumber: true,
                },
            ],
            "consistent-return": "off",
            "@typescript-eslint/consistent-return": "error",
            "prefer-const": "error",
            "@typescript-eslint/consistent-type-imports": "error",
            "@typescript-eslint/strict-boolean-expressions": ["error", { allowNullableBoolean: true, allowNullableString: true }],
        },
    },
)