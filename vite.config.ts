
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import process from 'node:process';

// Fix: Import process explicitly from node:process to ensure .cwd() is recognized by TypeScript in the config environment.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    base: './', 
    define: {
      'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY || env.API_KEY || ''),
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      minify: 'terser',
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'framer-motion'],
            'ai-core': ['@google/genai']
          }
        }
      }
    },
    server: {
      port: 5173,
      host: true
    }
  };
});
