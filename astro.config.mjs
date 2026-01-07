import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import tailwindcss from "@tailwindcss/vite";
import icon from "astro-icon";

import sitemap from "@astrojs/sitemap";

import partytown from "@astrojs/partytown";

import robotsTxt from "astro-robots-txt";
import compress from "@playform/compress";

// https://astro.build/config
export default defineConfig({
  site: "https://downkingo.com",
  prefetch: true,
  i18n: {
    defaultLocale: "en",
    locales: ["en", "pt"],
    routing: {
      prefixDefaultLocale: false,
      redirectToDefaultLocale: true,
    },
  },
  integrations: [
    icon(),
    starlight({
      title: "DownKingo Docs",
      favicon: "/icon.ico",
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/down-kingo/downkingo",
        },
      ],
      customCss: ["./src/styles/global.css"],
      sidebar: [
        {
          label: "Getting Started",
          items: [
            { label: "Introduction", slug: "intro" },
            { label: "Installation", slug: "installation" },
            { label: "Features", slug: "features" },
          ],
        },
        {
          label: "Development",
          items: [{ label: "Dev Setup", slug: "development" }],
        },
        {
          label: "Project",
          items: [{ label: "Roadmap", slug: "roadmap" }],
        },
      ],
    }),
    sitemap({
      i18n: {
        defaultLocale: "en",
        locales: {
          en: "en",
          pt: "pt-BR",
        },
      },
    }),
    partytown({
      config: {
        forward: ["plausible"],
      },
    }),
    robotsTxt(),
    compress(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
