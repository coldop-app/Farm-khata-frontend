#!/usr/bin/env node

/**
 * This script generates the route tree by running a minimal Vite build
 * that triggers the TanStack Router plugin to generate routeTree.gen.ts
 */

import { build } from 'vite';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

// Create a minimal Vite config that generates routes
const config = defineConfig({
  root,
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(root, './src'),
    },
  },
  build: {
    // Build to a temp directory to trigger route generation
    outDir: path.resolve(root, '.temp-routes'),
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(root, 'src/main.tsx'),
      output: {
        // Minimal output just to trigger the plugin
        format: 'es',
      },
    },
  },
});

try {
  console.log('Generating route tree...');
  await build(config);
  console.log('✓ Route tree generated successfully');
} catch (error) {
  console.error('✗ Error generating route tree:', error);
  process.exit(1);
}
