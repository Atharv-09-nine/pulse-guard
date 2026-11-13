// Lightweight Node.js Server for Render Deployment (Zero External Dependencies)
// Serves the Vite frontend and provides real-time SSE streaming for mobile phones and remote clients.

import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DIST_DIR = path.join(__dirname, 'dist')
const PORT = process.env.PORT || 3000

// MIME types for static assets
const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

// In-memory telemetry cache (strictly holds previous values from ESP32)
let latestTelemetry = null
const sseClients = new Set()

function broadcastTelemetry(data) {
  latestTelemetry = { ...data, receivedAt: Date.now() }
  const payload = `data: ${JSON.stringify(latestTelemetry)}\n\n`
  for (const client of sseClients) {
    try {
      client.write(payload)
    } catch {
      sseClients.delete(client)
    }
  }
}

const server = http.createServer((req, res) => {
  // CORS headers for API access
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`)
  const pathname = parsedUrl.pathname

  // 1. GET /api/telemetry -> Returns held previous values
  if (req.method === 'GET' && pathname === '/api/telemetry') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(latestTelemetry || { status: 'waiting_for_esp32' }))
    return
  }

  // 2. GET /api/events -> Server-Sent Events (SSE) for Real-Time Streaming to Phones
  if (req.method === 'GET' && pathname === '/api/events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    })
    res.write('retry: 3000\n\n')

    // Send latest held telemetry immediately upon connection
    if (latestTelemetry) {
      res.write(`data: ${JSON.stringify(latestTelemetry)}\n\n`)
    }

    sseClients.add(res)
    req.on('close', () => sseClients.delete(res))
    return
  }

  // 3. POST /api/telemetry -> Ingest telemetry from ESP32 (Wi-Fi or PC Bridge)
  if (req.method === 'POST' && pathname === '/api/telemetry') {
    let body = ''
    req.on('data', (chunk) => {
      body += chunk
      if (body.length > 1e6) req.destroy() // 1MB limit
    })
    req.on('end', () => {
      try {
        const data = JSON.parse(body)
        broadcastTelemetry(data)
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ success: true, clients: sseClients.size }))
      } catch (err) {
        // Try raw text if ESP sent plaintext serial
        broadcastTelemetry({ raw: body })
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ success: true, mode: 'raw' }))
      }
    })
    return
  }

  // 4. Static file serving from ./dist
  let filePath = path.join(DIST_DIR, pathname)

  // Protect against directory traversal
  if (!filePath.startsWith(DIST_DIR)) {
    res.writeHead(403)
    res.end('Forbidden')
    return
  }

  // If path is a file, serve it
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase()
    const contentType = MIME_TYPES[ext] || 'application/octet-stream'
    res.writeHead(200, { 'Content-Type': contentType })
    fs.createReadStream(filePath).pipe(res)
    return
  }

  // Otherwise, fallback to dist/index.html for React Router SPA
  const indexPath = path.join(DIST_DIR, 'index.html')
  if (fs.existsSync(indexPath)) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' })
    fs.createReadStream(indexPath).pipe(res)
    return
  }

  res.writeHead(404)
  res.end('Not Found. Please run `npm run build` first.')
})

server.listen(PORT, () => {
  console.log(`PulseGuard server running on port ${PORT}`)
  console.log(`Live telemetry SSE endpoint: http://localhost:${PORT}/api/events`)
})
