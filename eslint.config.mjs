import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import tailwind from "eslint-plugin-tailwindcss";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  tailwind.configs.recommended,
  {
    settings: {
      tailwindcss: {
        config: "src/app/globals.css"
      }
    }
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "JSXAttribute[name.name='className'] Literal[value=/(^|\\s)(text-(xs|sm|base|lg|[2-9]?xl|\\[[^\\]]+\\])|font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black|sans|serif|mono|\\[[^\\]]+\\])|leading-(none|tight|snug|normal|relaxed|loose|\\[[^\\]]+\\]|[0-9]+))(\\s|$)/]",
          message: "Do not use font-size, font-weight, or line-height utility classes directly. Use components from @/components/ui/typography instead."
        },
        {
          selector: "JSXAttribute[name.name='className'] TemplateElement[value.raw=/(^|\\s)(text-(xs|sm|base|lg|[2-9]?xl|\\[[^\\]]+\\])|font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black|sans|serif|mono|\\[[^\\]]+\\])|leading-(none|tight|snug|normal|relaxed|loose|\\[[^\\]]+\\]|[0-9]+))(\\s|$)/]",
          message: "Do not use font-size, font-weight, or line-height utility classes directly. Use components from @/components/ui/typography instead."
        }
      ]
    }
  },
  {
    files: ["src/components/ui/typography.tsx"],
    rules: {
      "no-restricted-syntax": "off",
      "tailwindcss/no-custom-classname": "off",
      "tailwindcss/no-arbitrary-value": "off"
    }
  }
]);

export default eslintConfig;
