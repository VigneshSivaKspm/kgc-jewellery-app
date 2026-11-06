import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,   // exposes the dev server on your LAN so you can test on mobile
    port: 5173
  }
});
