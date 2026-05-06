import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Jaai',
        short_name: 'Jaai',
        description: 'Premium hand-poured candles and home products',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#FBF6F3',
        theme_color: '#E9868B',
        icons: [
          {
            src: '/favicon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        // SW bundle only: skips workbox-build's terser step (avoids flaky parallel Rollup hooks with Vite).
        mode: 'development',
        globPatterns: ['**/*.{js,css,html,ico,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/[^/]+\.supabase\.co\/.*\/storage\//i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'supabase-media',
              expiration: {
                maxEntries: 250,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/(images|plus)\.unsplash\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'unsplash-images',
              expiration: {
                maxEntries: 150,
                maxAgeSeconds: 60 * 60 * 24 * 7,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
