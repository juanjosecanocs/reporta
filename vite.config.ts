import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

// maplibre-gl busca su worker en tiempo de ejecución como
// `./maplibre-gl-worker.mjs` junto al bundle principal (import.meta.url).
// El dev server de Vite lo resuelve al vuelo desde node_modules, pero el
// build de producción no lo copia solo: hay que emitirlo a mano o el mapa
// se queda en blanco (el worker nunca carga y no llegan tiles). El propio
// worker además importa `./maplibre-gl-shared.mjs` como módulo ES, así que
// ese archivo tiene que ir copiado justo al lado o la carga del worker
// falla con un error opaco (sin mensaje útil en consola).
function copiarWorkerMaplibre() {
  return {
    name: 'copiar-worker-maplibre',
    apply: 'build' as const,
    writeBundle(options: { dir?: string }) {
      const destinoDir = join(options.dir ?? 'dist', 'assets')
      mkdirSync(destinoDir, { recursive: true })
      for (const archivo of ['maplibre-gl-worker.mjs', 'maplibre-gl-shared.mjs']) {
        const origen = require.resolve(`maplibre-gl/dist/${archivo}`)
        copyFileSync(origen, join(destinoDir, archivo))
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), copiarWorkerMaplibre()],
  // maplibre-gl carga su worker como módulo ES vía import.meta.url; hay que
  // excluirlo del pre-bundling de Vite o el chunk del worker no se genera.
  worker: {
    format: 'es',
  },
  optimizeDeps: {
    exclude: ['maplibre-gl'],
  },
})
