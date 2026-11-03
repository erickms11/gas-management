import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/gas-management/', // nome do repositório no GitHub Pages
  server: {
    port: 3000,
    host: true
  },
});
