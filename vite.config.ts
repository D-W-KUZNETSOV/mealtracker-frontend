import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'Баланс',
        short_name: 'Баланс',
        description: 'Твой дневник питания и планов',
        theme_color: '#2e7d32',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/mealtrackerapi-d-w-kuznetsov\.msk1\.amvera\.tech\/api\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 200, // зачем: кэшируем больше запросов
                maxAgeSeconds: 7 * 24 * 60 * 60, // зачем: храним 7 дней
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      }, // зачем: закрываем VitePWA
    }),
  ], // зачем: закрываем plugins
}); // зачем: закрываем defineConfig