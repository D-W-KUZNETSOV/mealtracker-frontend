import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // зачем: при обновлении приложение само обновится
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'Баланс',
        short_name: 'Баланс',
        description: 'Твой дневник питания и планов',
        theme_color: '#2e7d32', // твой зелёный
        background_color: '#ffffff',
        display: 'standalone',
                icons: [
                  {
                    src: 'icon-192.png', // зачем: используем твои существующие иконки, ничего не переименовываем
                    sizes: '192x192',
                    type: 'image/png',
                    purpose: 'any',
                  },
                  {
                    src: 'icon-192.png', // для maskable используем ту же (для MVP ок)
                    sizes: '192x192',
                    type: 'image/png',
                    purpose: 'maskable',
                  },
                  {
                    src: 'icon-512.png',
                    sizes: '512x512',
                    type: 'image/png',
                    purpose: 'any',
                  },
                  {
                    src: 'icon-512.png',
                    sizes: '512x512',
                    type: 'image/png',
                    purpose: 'maskable',
                  },
                ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'], // зачем: кэшируем оболочку
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/mealtrackerapi-d-w-kuznetsov\.msk1\.amvera\.tech\/api\/.*/i,
            handler: 'NetworkFirst', // зачем: сначала пробуем сеть, если не вышло — отдаём кэш (Вариант 2)
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 24 * 60 * 60, // 1 день
              },
            },
          },
        ],
      },
    }),
  ],
});