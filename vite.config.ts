import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // maplibre-gl carga su worker como módulo ES vía import.meta.url; hay que
  // excluirlo del pre-bundling de Vite o el chunk del worker no se genera.
  worker: {
    format: 'es',
  },
  optimizeDeps: {
    exclude: ['maplibre-gl'],
  },
})
