const { FlatCompat } = require("@eslint/eslintrc");
const js = require("@eslint/js");
const typescriptParser = require("@typescript-eslint/parser");
const typescriptPlugin = require("@typescript-eslint/eslint-plugin");
const importPlugin = require("eslint-plugin-import");

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

module.exports = [
  // Ignore patterns
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/out/**",
      "**/build/**",
      "**/dist/**",
      "**/.git/**",
      "**/coverage/**",
      "**/*.config.js",
      "**/*.config.mjs",
      "**/*.config.ts",
      "**/*.test.ts",
      "**/*.test.tsx",
      "**/*.spec.ts",
      "**/*.spec.tsx",
      "**/__tests__/**",
      "**/__smoke__/**",
    ],
  },

  // Base configuration
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },

  // Extend Next.js and Prettier configs (fixed deprecated options)
  ...compat.extends("next/core-web-vitals", "prettier").map(config => {
    // Deep clean function to recursively remove deprecated options
    function deepClean(obj) {
      if (!obj || typeof obj !== 'object') return;

      // Remove deprecated options at current level
      delete obj.useEslintrc;
      delete obj.extensions;

      // Recursively clean all nested objects
      Object.keys(obj).forEach(key => {
        if (obj[key] && typeof obj[key] === 'object') {
          deepClean(obj[key]);
        }
      });
    }

    const cleanConfig = JSON.parse(JSON.stringify(config)); // Deep clone
    deepClean(cleanConfig);

    return cleanConfig;
  }),

  // Custom rules to override extends
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
    rules: {
      "react/no-unescaped-entities": "off",
      "react/no-direct-mutation-state": "off",
      "react-hooks/rules-of-hooks": "warn",
      "@next/next/no-assign-module-variable": "warn",
    },
  },

  // TypeScript plugin
  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: {
      "@typescript-eslint": typescriptPlugin,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
    },
  },

  // Named exports enforcement
  {
    files: ["src/**/*.ts", "src/**/*.tsx"],
    plugins: {
      import: importPlugin,
    },
    rules: {
      "import/no-default-export": "error",
    },
    ignores: [
      "src/app/**/*.tsx",
      "src/app/**/*.ts",
      "src/middleware.ts",
      "src/**/middleware.ts",
      "src/components/**/*.tsx",
      "src/components/**/*.ts",
      "src/ai/**/*.ts",
      "src/ai/**/*.tsx",
      "src/lib/**/*.ts",
      "src/lib/**/*.tsx",
      "src/config/**/*.ts",
      "src/config/**/*.tsx",
      "src/global.d.ts",
      "src/workers/**/*.ts",
    ],
  },

  // Allow Next.js app router defaults
  {
    files: ["**/app/**/page.{ts,tsx}", "**/app/**/layout.{ts,tsx}"],
    rules: {
      "import/no-default-export": "off",
    },
  },

  // Complexity guardrails for Directors Studio page
  {
    files: ["src/app/(main)/directors-studio/page.tsx"],
    rules: {
      complexity: ["error", 8],
      "max-lines-per-function": [
        "error",
        { max: 50, skipBlankLines: true, skipComments: true },
      ],
      "max-lines": [
        "error",
        { max: 300, skipBlankLines: true, skipComments: true },
      ],
    },
  },
];
