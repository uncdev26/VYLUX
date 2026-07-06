import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import tailwind from '@astrojs/tailwind';
import node from '@astrojs/node';

export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
  integrations: [
    svelte(),
    tailwind(),
  ],
  vite: {
    ssr: {
      noExternal: ['@lobechat/database'],
    },
  },
});
