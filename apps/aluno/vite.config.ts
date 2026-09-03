import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// App do aluno — PWA instalável (base do Capacitor para iOS/Android).
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'G3 — Área do Aluno',
        short_name: 'G3',
        description: 'Seus cursos de educação na área da saúde.',
        theme_color: '#1C3466',
        background_color: '#F6F5F1',
        display: 'standalone',
        start_url: '/',
        icons: [],
      },
    }),
  ],
});
