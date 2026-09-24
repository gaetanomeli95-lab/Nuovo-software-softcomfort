/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

/**
 * Il backend legacy espone le API alla radice (senza prefisso /api).
 * In dev proxiamo solo i path noti verso il server legacy, così il
 * frontend usa sempre URL relativi (stessa origine in produzione).
 */
const LEGACY_TARGET = process.env.VITE_LEGACY_BACKEND ?? 'http://localhost:8080';

const LEGACY_API_PATHS = [
  '/login',
  '/item',
  '/sellingBill',
  '/buyingBill',
  '/checks',
  '/provisions',
  '/deposits',
  '/pending',
];

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          charts: ['recharts'],
          query: ['@tanstack/react-query'],
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: Object.fromEntries(
      LEGACY_API_PATHS.map((p) => [
        p,
        { target: LEGACY_TARGET, changeOrigin: true },
      ]),
    ),
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    globals: true,
    css: false,
    exclude: ['e2e/**', 'node_modules/**'],
  },
});
