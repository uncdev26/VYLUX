import { vitePreprocess } from '@astrojs/svelte';

export default {
  preprocess: vitePreprocess({
    // Skip preprocessing for files in node_modules (pre-compiled packages)
    ignoreAncestry: true
  })
};
