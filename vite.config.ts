import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  // IMPORTANT:
  // Change "pub-quiz" below if your GitHub repository has a different name.
  base: '/pub-quiz/',

  plugins: [
    react(),
    tailwindcss(),

    VitePWA({
      registerType: 'autoUpdate',

      includeAssets: ['icon.svg'],

      manifest: {
        id: '/pub-quiz/',
        name: 'The Cartoon Pub Quiz',
        short_name: 'PubQuiz',
        description:
          'An installable cartoon-themed pub quiz app with TV display, music rounds, and Quiz Master controls.',

        theme_color: '#F59E0B',
        background_color: '#0F172A',

        display: 'standalone',

        start_url: '/pub-quiz/',
        scope: '/pub-quiz/',

        icons: [
          {
            src: 'icon.svg',
            sizes: '192x192 512x512',
            type: 'image/svg+xml',
            purpose: 'any',
          },
        ],
      },

      devOptions: {
        enabled: true,
        type: 'module',
      },
    }),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },

  server: {
    hmr: process.env.DISABLE_HMR !== 'true',

    watch:
      process.env.DISABLE_HMR === 'true'
        ? null
        : {},
  },
});
