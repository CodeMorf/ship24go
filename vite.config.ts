import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      {
        name: 'cf-disable-rocket-loader',
        transformIndexHtml(html) {
          return html.replace(
            /<script(?![^>]*data-cfasync)([^>]* type=["']module["'][^>]*)>/gi,
            (_m, attrs) => `<script data-cfasync="false"${attrs}>`
          );
        },
      },
      react(), 
      tailwindcss()
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    define: {
      'process.env.GOOGLE_MAPS_PLATFORM_KEY': JSON.stringify(process.env.GOOGLE_MAPS_PLATFORM_KEY || '')
    },
    build: {
      target: 'es2020',
      cssCodeSplit: true,
      chunkSizeWarningLimit: 800,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react/') || id.includes('react-dom/') || id.includes('react-router')) {
                return 'vendor-react';
              }
              if (id.includes('lucide-react')) {
                return 'vendor-icons';
              }
              if (id.includes('chart.js') || id.includes('react-chartjs-2')) {
                return 'vendor-charts';
              }
              if (id.includes('@vis.gl') || id.includes('google-maps')) {
                return 'vendor-maps';
              }
              if (id.includes('motion')) {
                return 'vendor-motion';
              }
            }
          }
        }
      }
    },
    server: {
      allowedHosts: ['ship24go.com', 'www.ship24go.com', 'ce2f3596.ship24go.com', 'localhost', '127.0.0.1'],
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
