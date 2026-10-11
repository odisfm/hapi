import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
      react(),
      tailwindcss(),
      VitePWA({
          registerType: 'autoUpdate',
          devOptions: {
              enabled: true
          },
          includeAssets: ['favicon.ico', 'apple-touch-icon-180x180.png'],
          manifest: {
              name: 'HAPI Showcase',
              short_name: 'HAPI',
              description: "Showcasing projects from RMIT's Hub for Apple Platform Innovation",
              theme_color: '#000054',
              background_color: '#ffffff',
              icons: [
                  { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
                  { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
                  { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
              ]
          }
      })
  ],
})
