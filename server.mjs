import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { createServer } from 'node:http'
import path from 'node:path'

try {
  process.loadEnvFile()
} catch {
  // .env is optional when the key is supplied via the environment
}

const PORT = process.env.PORT || 3001
const GEMINI_KEY = process.env.COCONUT_AI_API_KEY
const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

const DIST_DIR = path.join(process.cwd(), 'dist')
const INDEX_FILE = path.join(DIST_DIR, 'index.html')

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
}

const INSTRUCTION =
  'Analyze this coconut image. Estimate the number of clearly visible individual coconut fibres/hairs on the outer fibrous husk. Do not count the background, coconut flesh, shadows, table, or other objects. Do not invent fibres that are not visibly present. Return ONLY the estimated numerical count and a short confidence percentage, exactly in this format:\ncount: <number>\nconfidence: <number>'

function parseGeminiText(text) {
  const countMatch = text.match(/count:\s*(\d+)/i)
  const confidenceMatch = text.match(/confidence:\s*(\d+)/i)
  if (!countMatch) throw new Error('Could not parse count from response')
  const confidenceRaw = confidenceMatch ? parseInt(confidenceMatch[1], 10) : null
  const confidence =
    confidenceRaw == null
      ? null
      : Math.min(1, Math.max(0, Math.round((confidenceRaw / 100) * 100) / 100))
  return {
    fibreCount: parseInt(countMatch[1], 10),
    confidence,
  }
}

async function analyzeImage(base64Data, mimeType) {
  const response = await fetch(`${GEMINI_URL}?key=${GEMINI_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: INSTRUCTION },
            { inline_data: { mime_type: mimeType, data: base64Data } },
          ],
        },
      ],
      generationConfig: { temperature: 0.1 },
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '')
    throw new Error(`Gemini API error ${response.status}: ${errorBody}`)
  }

  const data = await response.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('Empty response from Gemini')
  return parseGeminiText(text)
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = []
    request.on('data', (chunk) => chunks.push(chunk))
    request.on('end', () => resolve(Buffer.concat(chunks).toString()))
    request.on('error', reject)
  })
}

function sendJson(response, statusCode, payload) {
  const body = JSON.stringify(payload)
  response.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  })
  response.end(body)
}

async function handleAnalyze(request, response) {
  if (!GEMINI_KEY) {
    sendJson(response, 500, {
      error: 'Server is missing COCONUT_AI_API_KEY environment variable.',
    })
    return
  }

  try {
    const body = JSON.parse(await readBody(request))
    const imageData = body?.image
    if (!imageData || typeof imageData !== 'string') {
      sendJson(response, 400, { error: 'No image provided.' })
      return
    }

    const dataUrlMatch = imageData.match(
      /^data:([^;]+);base64,([A-Za-z0-9+/=]+)$/,
    )
    if (!dataUrlMatch) {
      sendJson(response, 400, { error: 'Invalid image format.' })
      return
    }

    const [, mimeType, base64Data] = dataUrlMatch
    const result = await analyzeImage(base64Data, mimeType)
    sendJson(response, 200, result)
  } catch (error) {
    console.error('[Coconut API]', error?.message)
    sendJson(response, 502, {
      error: 'Coconut analysis failed. Please try again.',
    })
  }
}

async function serveStatic(request, response) {
  const method = request.method || 'GET'
  if (method !== 'GET' && method !== 'HEAD') {
    sendJson(response, 405, { error: 'Method not allowed.' })
    return
  }

  let pathname
  try {
    pathname = decodeURIComponent(
      new URL(request.url, 'http://localhost').pathname,
    )
  } catch {
    pathname = '/'
  }
  if (pathname === '/') pathname = '/index.html'

  const filePath = path.normalize(path.join(DIST_DIR, pathname))
  if (!filePath.startsWith(DIST_DIR)) {
    sendJson(response, 403, { error: 'Forbidden.' })
    return
  }

  const resolved = existsSync(filePath) ? filePath : INDEX_FILE

  try {
    const content = await readFile(resolved)
    const ext = path.extname(resolved).toLowerCase()
    response.writeHead(200, {
      'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
      'Content-Length': content.length,
    })
    response.end(content)
  } catch {
    sendJson(response, 404, { error: 'Not found.' })
  }
}

const server = createServer(async (request, response) => {
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (request.method === 'OPTIONS') {
    response.writeHead(204)
    response.end()
    return
  }

  if (request.method === 'POST' && request.url === '/api/analyze') {
    await handleAnalyze(request, response)
    return
  }

  if ((request.url || '').startsWith('/api')) {
    sendJson(response, 404, { error: 'Not found.' })
    return
  }

  await serveStatic(request, response)
})

server.listen(PORT, () => {
  console.log(`Coconut Hair Counter running on http://localhost:${PORT}`)
})