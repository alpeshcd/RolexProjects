import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Open the panel as http://mastan365.localhost:5174 (any *.localhost name
// reaches this machine; no domain or hosts-file entry needed). The part
// before ".localhost" picks the Mastan domain portal from the Rolex database.
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '')
    const apiUrl = env.VITE_API_URL || 'http://localhost:8001'

    return {
        plugins: [react()],
        server: {
            port: 5174,
            strictPort: true,
            proxy: {
                '/api': { target: apiUrl, changeOrigin: true },
            },
        },
    }
})
