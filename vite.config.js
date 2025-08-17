import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2022'
    }
  },
  build: {
    target: 'es2022'
  },
  server: {
    port: 3001
  },
  optimizeDeps: {
    esbuildOptions: {
      supported: {
        'import-with': false // 🛠 Prevent esbuild crash on `with { type: 'json' }`
      }
    },
    exclude: ['@base-org/account'] // 🛑 Skip pre-bundling this lib
  },
  ssr: {
    noExternal: ['@base-org/account'] // ✅ Avoid parsing this lib in SSR
  }
});
