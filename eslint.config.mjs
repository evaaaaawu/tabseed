import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  ...compat.config({
    plugins: ["tailwindcss"],
    extends: ["plugin:tailwindcss/recommended"],
    settings: {
      tailwindcss: {
        callees: ["cn"],
        config: "./tailwind.config.js",
      },
    },
    rules: {
      "tailwindcss/no-custom-classname": "off",
    },
  }),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "**/*.css",
    ],
  },
];

export default eslintConfig;
