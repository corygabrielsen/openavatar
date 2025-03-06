import express from 'express'
import fs from 'fs'
import { createProxyMiddleware } from 'http-proxy-middleware'
import https from 'https'
import path from 'path'

const app = express()
const httpServerPort = 8545 // The port of your local HTTP server
const httpsServerPort = 443 // The port where the proxy server will listen for HTTPS traffic

const certsPath = path.join(__dirname, '../certs')

const sslOptions = {
  key: fs.readFileSync(path.join(certsPath, 'private-key.key')),
  cert: fs.readFileSync(path.join(certsPath, 'api_openavatarnft_io.crt')),
  ca: fs.readFileSync(path.join(certsPath, 'api_openavatarnft_io.ca-bundle')),
}

app.use(
  '/',
  createProxyMiddleware({
    target: `http://localhost:${httpServerPort}`,
    changeOrigin: true,
    secure: false,
  })
)

https.createServer(sslOptions, app).listen(httpsServerPort, () => {
  console.log(`HTTPS proxy server listening on port ${httpsServerPort}`)
})
