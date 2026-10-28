import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Open the site as http://mastan365.localhost:5175 (any *.localhost name
// reaches this machine). The part before ".localhost" picks the domain portal
// from the Rolex database, so clients of that domain can sign in.
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '')
    const apiUrl = env.VITE_API_URL || 'http://localhost:8001'

    return {
        plugins: [react()],
        server: {
            port: 5175,
            strictPort: true,
            proxy: {
                '/api': { target: apiUrl, changeOrigin: true },
            },
        },
    }
})
