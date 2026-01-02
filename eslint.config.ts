import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig(
  // Loads the recommended JS rules
  js.configs.recommended,

  // Loads the recommended TypeScript rules
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    plugins: { js },
    languageOptions: { globals: globals.node },
    rules: {
      // "filenames/match-regex": ["error", "^[a-z][a-zA-Z0-9]*$", true], // ONLY enable if you installed eslint-plugin-filenames
      semi: ["error", "always"],
      quotes: ["error", "double", { allowTemplateLiterals: true }],
      indent: ["error", 2],
      "no-trailing-spaces": "error",
      "eol-last": ["error", "always"],
      "no-var": "error",
      "prefer-const": "error",
      eqeqeq: "error", // CHANGED: Always use ===
      "no-console": "off", // CHANGED: Allow console statements
    },
  }
);
