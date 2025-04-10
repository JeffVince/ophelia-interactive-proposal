import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import svgLoader from 'vite-svg-loader'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    svgLoader({
      svgoConfig: {
        multipass: true
      }
    })
  ],
  assetsInclude: ['**/*.SVG'],
  server: {
    host: true,
    cors: true,
    hmr: {
      clientPort: 443,
      host: 'proposal.ophelia.company'
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
