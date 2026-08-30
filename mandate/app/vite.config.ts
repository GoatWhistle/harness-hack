import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // TrueForge UI and the host application must share one React dispatcher.
    // Duplicating React across the chat route produces invalid hook call #321.
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
  optimizeDeps: {
    include: ["@truefoundry/trueforge-ui", "@assistant-ui/react", "@assistant-ui/core"],
  },
  server: {
    proxy: {
      "/api": "http://127.0.0.1:8030",
    },
  },
});
