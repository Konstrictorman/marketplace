import { defineConfig, globalIgnores } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import tseslint from "typescript-eslint";

const webFiles = ["apps/web/**/*.{js,jsx,mjs,ts,tsx,mts,cts}"];

/** Restrict Next + React rules to the web app only. */
function scopeNextConfigs(configs, files) {
  return configs.map((entry) => {
    if (!entry || typeof entry !== "object") return entry;
    if ("ignores" in entry && !("files" in entry)) return entry;
    return { ...entry, files };
  });
}

export default defineConfig([
  globalIgnores([
    "**/node_modules/**",
    "**/dist/**",
    "apps/web/.next/**",
    "apps/web/out/**",
    "apps/web/build/**",
    "apps/web/next-env.d.ts",
  ]),
  ...scopeNextConfigs([...nextVitals, ...nextTs], webFiles),
  {
    files: webFiles,
    settings: {
      next: {
        rootDir: "apps/web",
      },
    },
  },
  ...tseslint.config(
    { files: ["apps/api/**/*.ts", "packages/**/*.ts"] },
    tseslint.configs.recommended,
  ),
  eslintConfigPrettier,
]);
