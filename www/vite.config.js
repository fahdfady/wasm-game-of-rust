import { defineConfig } from 'vite'
import { resolve } from 'path'

import wasm from "vite-plugin-wasm";
// not needed, but important for supporting older browsers
import topLevelAwait from "vite-plugin-top-level-await";

export default defineConfig({
    root: '.',
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                bootstrap: resolve(__dirname, 'bootstrap.js')
            }
        }
    },
    server: {
        open: 'index.html'
    },
    plugins: [
        wasm(),
        topLevelAwait()
    ]
})