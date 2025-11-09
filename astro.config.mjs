import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import tailwind from '@astrojs/tailwind';
import svelte from '@astrojs/svelte';
import expressiveCode from 'astro-expressive-code';

// https://astro.build/config
export default defineConfig({
  output: 'server', // Server-side rendering (hybrid removed in Astro 5)
  adapter: node({
    mode: 'standalone'
  }),
  integrations: [
    expressiveCode({
      themes: ['dracula', 'github-light'],
      styleOverrides: {
        borderRadius: '0.5rem',
        codeFontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
      },
    }),
    tailwind({
      applyBaseStyles: false,
    }),
    svelte(),
  ],
  vite: {
    optimizeDeps: {
      exclude: ['oslo']
    }
  },
  site: 'https://pythoughts.com',
  markdown: {
    shikiConfig: {
      theme: 'dracula',
      wrap: true
    }
  }
});
