import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: 'src', // 👈 Set root if your app is in the /src directory
  plugins: [react()],
  server: {
    port: 3001,
  },
  optimizeDeps: {
    exclude: ['@base-org/account'], // 🛑 Don't pre-bundle this
    esbuildOptions: {
      supported: {
        'import-with': false, // 🩹 Prevent crash on `with { type: 'json' }`
      },
    },
  },
  ssr: {
    noExternal: ['@base-org/account'], // ⚙️ Skip for SSR processing too
  },
});
