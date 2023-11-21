import { loadEnv } from "vite";
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import node from "@astrojs/node";
import spotlight from "@spotlightjs/astro";

import sentry from "@sentry/astro";

const env = loadEnv(process.env.NODE_ENV, process.cwd(), "");

// https://astro.build/config
export default defineConfig({
  site: "https://nikolovlazar.com",
  experimental: {
    devOverlay: true,
  },
  integrations: [
    tailwind(),
    sitemap({
      filter: (page) => !/https:\/\/nikolovlazar\.com\/blog\/[0-9]+/.test(page),
      customPages: [
        "https://nikolovlazar.com/discord",
        "https://nikolovlazar.com/twitch",
        "https://nikolovlazar.com/twitter",
      ],
      changefreq: "weekly",
      lastmod: new Date(),
      priority: 0.85,
      serialize: (item) => {
        // Remove trailing slashes
        if (item.url.at(-1) === "/") {
          item.url = item.url.slice(0, -1);
        }
        return item;
      },
      i18n: {
        defaultLocale: "en",
        // Just an example, we're not actually implementing i18n
        locales: {
          en: "en-US",
          es: "es-ES",
          fr: "fr-CA",
        },
      },
    }),
    sentry({
      sourceMapsUploadOptions: {
        project: env.SENTRY_PROJECT,
        authToken: env.SENTRY_AUTH_TOKEN,
      },
    }),
    spotlight(),
  ],
  output: "hybrid",
  adapter: node({
    mode: "standalone",
  }),
  vite: {
    optimizeDeps: {
      exclude: ["@resvg/resvg-js"],
    },
  },
});
