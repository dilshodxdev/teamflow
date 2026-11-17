import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    fs: {
      allow: [
        fileURLToPath(new URL(".", import.meta.url)),
        fileURLToPath(new URL("./node_modules", import.meta.url)),
        fileURLToPath(new URL("../../node_modules", import.meta.url)),
      ],
      deny: [
        "**/.env",
        "**/.env.*",
        "**/*.{crt,pem}",
        "**/.git/**",
        "**/backend/data/**",
        "**/*.db",
        "**/*.db-*",
        "**/*.sqlite*",
        "**/demo-credentials.json",
        "**/*.demo-credentials.json",
      ],
    },
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
