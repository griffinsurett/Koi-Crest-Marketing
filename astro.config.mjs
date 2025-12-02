// astro.config.mjs
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import partytown from '@astrojs/partytown';
import { buildRedirectConfig } from './src/utils/redirects';
import { manualChunks, assetFileNames } from './vite.chunks.js';
import iconGeneratorIntegration from './src/utils/icons/icon-generator.integration.mjs';

const env = loadEnv(process.env.NODE_ENV || 'development', process.cwd(), '');
const redirects = await buildRedirectConfig();
const siteUrl = `https://${env.PUBLIC_SITE_DOMAIN}`;

console.log(`Site URL: ${siteUrl}`);

export default defineConfig({
  site: siteUrl,
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
  ],
  
  build: {
    inlineStylesheets: 'always',
    split: true,
  },
  
  compressHTML: true,
  redirects,
});
