import { defineConfig } from 'vite'
import path from 'path'
import fs from 'fs'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
    // Yalnız `npm run dev`: anasayfa verisi build'de üretilir (dist/home-data.json). Bir kez `npm run build`
    // yapıldıysa geliştirme sunucusu onu sunar → yerelde de anasayfa (omurga haritası, en çok okunanlar) dolu görünür.
    {
      name: 'dev-home-data',
      apply: 'serve',
      configureServer(server) {
        server.middlewares.use('/home-data.json', (_req, res, next) => {
          const f = path.resolve(__dirname, 'dist/home-data.json')
          if (!fs.existsSync(f)) return next()
          res.setHeader('Content-Type', 'application/json')
          res.end(fs.readFileSync(f))
        })
      },
    },
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
