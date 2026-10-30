import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// The site is served from the domain root (adilitix.com). share_app.sh builds with
// `--base=/adilitix/` for the LAN server, which mounts the site under /adilitix.
// A relative base ('./') breaks every nested route such as /projects/folder/id.
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          motion: ['framer-motion'],
        },
      },
    },
  },
})
