import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Divide o bundle de entrada (~744 KB num único arquivo): sem isso,
        // a primeira pintura espera o download, a execução e o parse de tudo
        // — React, router, framer-motion, Radix, react-query e Supabase —
        // e cada deploy invalida o cache inteiro. Com os vendors separados,
        // o navegador baixa em paralelo e só volta a baixar o chunk do app
        // quando o código muda; os vendors ficam em cache entre deploys.
        manualChunks: (id: string) => {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("/node_modules/framer-motion/")) return "vendor-motion";
          if (id.includes("/node_modules/@supabase/")) return "vendor-data";
          if (id.includes("/node_modules/react-dom/") || id.includes("/node_modules/react-router")) return "vendor-react";
          if (id.includes("/node_modules/react/")) return "vendor-react";
          if (
            id.includes("/node_modules/@radix-ui/") ||
            id.includes("/node_modules/@tanstack/") ||
            id.includes("/node_modules/react-helmet-async/") ||
            id.includes("/node_modules/sonner/") ||
            id.includes("/node_modules/lucide-react/")
          ) return "vendor-ui";
          // Sem catch-all de propósito: bibliotecas pesadas usadas só por rotas
          // preguiçosas (ex.: xlsx, jszip) cairiam num chunk "vendor" compartilhado
          // que a entrada importa estaticamente — e a primeira pintura voltaria
          // a esperar ~800 KB. Devolvendo undefined, o Rollup deixa cada uma
          // no chunk da rota que a usa.
          return undefined;
        },
      },
    },
  },
}));
