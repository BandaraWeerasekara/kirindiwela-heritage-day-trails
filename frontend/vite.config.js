import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// Forwards /api calls to the backend so the frontend needs no CORS setup in dev.
export default defineConfig({ plugins: [react()], server: { proxy: { "/api": "http://localhost:5000" } } });
