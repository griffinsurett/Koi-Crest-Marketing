// astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import partytown from '@astrojs/partytown';
import sitemap from '@astrojs/sitemap';
import { buildRedirectConfig } from './src/utils/redirects';
import { manualChunks, assetFileNames } from './vite.chunks.js';
import iconGeneratorIntegration from './src/integrations/icons/icon-generator.integration.mjs';
import clientDirectivesIntegration from './src/integrations/client-directives/client-directives.integration.mjs';
import robotsLlmsIntegration from './src/integrations/robots-llms/robots-llms.integration.ts';
import { SITE_URL } from './src/content/siteData.ts';

const redirects = await buildRedirectConfig();
const siteUrl = SITE_URL;

console.log(`Site URL: ${siteUrl}`);

export default defineConfig({
  site: siteUrl,
  trailingSlash: 'never',
  server: { port: 4535 },
  
  vite: {
    plugins: [tailwindcss()],
    build: {
      assetsInlineLimit: 10240, // 10KB - will inline your 7.3KB CSS automatically
      cssCodeSplit: true,
      cssMinify: 'esbuild',
      rollupOptions: {
        output: { assetFileNames, manualChunks },
      },
    },
    css: {
      devSourcemap: false,
    },
    optimizeDeps: {
      include: ['react', 'react-dom'],
      exclude: ['@astrojs/react'],
    },
  },
  
  integrations: [
    clientDirectivesIntegration(),
    iconGeneratorIntegration(),
    mdx(),
    react({
      include: ['**/react/*', '**/components/**/*.jsx', '**/components/**/*.tsx', '**/hooks/**/*.js', '**/hooks/**/*.ts'],
    }),
    partytown({
      config: {
        forward: ['dataLayer.push'],
        debug: process.env.NODE_ENV === 'development',
      },
    }),
    sitemap(),
    robotsLlmsIntegration(),
  ],
  
  build: {
    inlineStylesheets: 'always',
    split: true,
  },
  
  compressHTML: true,
  redirects,
});
