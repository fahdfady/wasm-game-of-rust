import { defineConfig } from 'vite'
import { resolve } from 'path'

import wasm from "vite-plugin-wasm";
// not needed, but important for supporting older browsers
import topLevelAwait from "vite-plugin-top-level-await";

export default defineConfig({
    root: '.',
    base: './',
    build: {
        target: 'esnext',
        outDir: 'dist',
        emptyOutDir: true,
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                bootstrap: resolve(__dirname, 'bootstrap.js')
            },
            // Explicitly mark WASM imports as external
            // external: [/\.wasm$/],
            // output: {
            //     // Ensure WASM files are copied to output
            //     assetFileNames: 'assets/[name][extname]'
            // }
        }

    },
    server: {
        open: 'index.html',
        hmr: true,
        headers: {
            'Cross-Origin-Opener-Policy': 'same-origin',
            'Cross-Origin-Embedder-Policy': 'same-origin'
        }
    },
    plugins: [
        wasm(),
        topLevelAwait()
    ],

    optimizeDeps: {
        // Exclude WASM files from dependency optimization
        exclude: ['wasm-game-of-rust']
    }
})