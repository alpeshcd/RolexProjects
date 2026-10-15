import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import dynamicImport from 'vite-plugin-dynamic-import'

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '')
    const apiUrl = env.VITE_APP_API_URL || 'http://localhost:8000'
    
    return {
        plugins: [react(), dynamicImport()],
        assetsInclude: ['**/*.md'],
        resolve: {
            alias: {
                '@': path.join(__dirname, 'src'),
            },
        },
        server: {
            port: 5173,
            proxy: {
                '/api': {
                    target: apiUrl,
                    changeOrigin: true,
                    secure: false,
                },
            },
        },
        build: {
            outDir: 'build',
        },
    }
})