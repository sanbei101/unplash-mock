import tailwindcss from "@tailwindcss/vite";
import process from "node:process";
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  runtimeConfig: {
    unsplashAccessKey: process.env.NUXT_UNSPLASH_ACCESS_KEY,
    ossAccessKeyId: process.env.NUXT_OSS_ACCESS_KEY_ID || "",
    ossAccessKeySecret: process.env.NUXT_OSS_ACCESS_KEY_SECRET || "",
    ossBucket: process.env.NUXT_OSS_BUCKET || "",
    ossRegion: process.env.NUXT_OSS_REGION || "oss-cn-beijing",
    ossCdnBaseUrl: process.env.NUXT_OSS_CDN_BASE_URL || "",
  },

  css: ["~/assets/css/tailwind.css"],

  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: [
        "oss-lite",
        "class-variance-authority",
        "@vueuse/core",
        "reka-ui",
        "lucide-vue-next",
        "clsx",
        "tailwind-merge",
      ],
    },
  },
  modules: ["shadcn-nuxt"],
  shadcn: {
    /**
     * Prefix for all the imported component.
     * @default "Ui"
     */
    prefix: "",
    /**
     * Directory that the component lives in.
     * Will respect the Nuxt aliases.
     * @link https://nuxt.com/docs/api/nuxt-config#alias
     * @default "@/components/ui"
     */
    componentDir: "@/components/ui",
  },
});
