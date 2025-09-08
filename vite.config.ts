import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
   server: {
     host: "::",
     port: 8080,
     fs: {
       allow: [
         path.resolve(__dirname),
         path.resolve(__dirname, "client"),
         path.resolve(__dirname, "shared"),
       ],
       deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**"],
     },
   },
  build: {
    outDir: "dist/spa",
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));
