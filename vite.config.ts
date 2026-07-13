import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'apple-touch-icon.png'],
      devOptions: { enabled: true },
      manifest: {
        name: 'Sora',
        short_name: 'Sora',
        description: 'Live weather, global place search, and forecasts for locations worldwide.',
        theme_color: '#0b1530',
        background_color: '#0b1530',
        display: 'standalone',
        orientation: 'any',
        start_url: '/',
        scope: '/',
        categories: ['weather', 'utilities'],
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        navigateFallback: '/index.html',
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/(api|geocoding-api)\.open-meteo\.com\/v1\/(forecast|search)/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'sora-weather-api',
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 140,
                maxAgeSeconds: 21600
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ]
})
