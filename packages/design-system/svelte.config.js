export default {
  compilerOptions: {
    css: 'injected'
  },
  package: {
    emitTypes: true,
    exports: (filepath) => !filepath.endsWith('.svelte')
  }
};
