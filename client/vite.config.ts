import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react';
import path from "path";
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [react(),
        tailwindcss(),],
    //added these to resolve incase we ever use the shared folders defined in the config
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
            "@shared": path.resolve(__dirname, "../shared"),
        },
    },
    //need to add proxy when we have built the server and deinfed port, etc
    build: {
        outDir: "../server/dist/client", // build the assets so it can be served
        emptyOutDir: true,
    },
});