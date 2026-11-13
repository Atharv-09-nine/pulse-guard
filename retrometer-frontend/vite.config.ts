import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function esp32CorsProxyPlugin(): Plugin {
  return {
    name: 'esp32-cors-proxy',
    configureServer(server) {
      server.middlewares.use('/api/proxy', async (req, res) => {
        try {
          const url = new URL(req.url || '', 'http://localhost')
          const target = url.searchParams.get('target') || 'http://10.50.134.121/data'
          const controller = new AbortController()
          const timeout = setTimeout(() => controller.abort(), 2000)
          const upstream = await fetch(target, { signal: controller.signal })
          clearTimeout(timeout)
          const body = await upstream.text()
          res.setHeader('Content-Type', 'application/json')
          res.setHeader('Access-Control-Allow-Origin', '*')
          res.writeHead(upstream.status)
          res.end(body)
        } catch (err: any) {
          res.setHeader('Content-Type', 'application/json')
          res.writeHead(502)
          res.end(JSON.stringify({ error: err.message || 'Upstream Unreachable' }))
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    esp32CorsProxyPlugin(),
  ],
})
