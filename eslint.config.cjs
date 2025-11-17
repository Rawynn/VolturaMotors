const js = require("@eslint/js");
const globals = require("globals");

/**
 * Konfiguracja ESLint 9 (flat config)
 */
module.exports = [
  // 1. Ignorowane pliki / katalogi
  {
    ignores: ["node_modules/**", "dist/**"],
  },

  // 2. Główna konfiguracja dla naszego kodu
  {
    files: ["src/js/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser, // <-- tu wchodzą fetch, FormData, localStorage itd.
        bootstrap: "readonly",
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      "no-unused-vars": ["warn", { args: "none", ignoreRestSiblings: true }],
      "no-console": "off",
      eqeqeq: ["error", "always"],
      curly: ["error", "multi-line"],
      "no-var": "error",
      "prefer-const": "error",
    },
  },
];
