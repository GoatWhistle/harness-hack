import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    include: ["@truefoundry/trueforge-ui", "@assistant-ui/react", "@assistant-ui/core"],
  },
  server: {
    proxy: {
      "/api": "http://127.0.0.1:8030",
    },
  },
});
