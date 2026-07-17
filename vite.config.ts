import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  base: "/agentrabbit/",
  server: {
    host: "::",
    port: 5173,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['@radix-ui/react-accordion', '@radix-ui/react-dialog', '@radix-ui/react-tabs', '@radix-ui/react-toast', 'framer-motion'],
          'vendor-supabase': ['@supabase/supabase-js'],
        },
      },
    },
  },
});
