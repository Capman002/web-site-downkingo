import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: "DownKingo",
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
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
