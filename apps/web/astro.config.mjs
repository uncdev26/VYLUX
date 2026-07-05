import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [
    svelte({
      preprocess: []
    }),
    tailwind()
  ],
  output: 'static',
  vite: {
    optimizeDeps: {
      include: ['@newlight/design-system']
    }
  }
});
