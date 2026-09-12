import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// @vitejs/plugin-react was already a devDependency but never registered
// anywhere -- without this file Vite falls back to bare esbuild JSX
// handling, which means no Fast Refresh (every edit triggers a full page
// reload and loses component state) and no automatic JSX runtime
// guarantee across all file types. This just makes explicit what the
// project already depended on.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
});
