const cache = new Map()

function hashString(value) {
  let hash = 2166136261
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function createRandom(seed) {
  let state = seed
  return () => {
    state += 0x6d2b79f5
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function readImageSize(src) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () =>
      resolve({ width: image.naturalWidth, height: image.naturalHeight })
    image.onerror = () => reject(new Error('Unable to read image'))
    image.src = src
  })
}

function simulate(width, height, seed) {
  const random = createRandom(seed)
  const sizeFactor = Math.min(1, Math.sqrt(width * height) / 900)
  const count = Math.round(70 + random() * 150 + sizeFactor * 120)
  const markerCount = Math.max(12, Math.min(75, Math.round(count * 0.45)))
  const markers = Array.from({ length: markerCount }, () => ({
    x: 0.04 + random() * 0.92,
    y: 0.04 + random() * 0.92,
  }))
  return {
    count,
    confidence: Math.round(66 + random() * 29),
    markers,
  }
}

export async function detectFibres(imageSrc) {
  const cached = cache.get(imageSrc)
  if (cached) return cached

  const seed = hashString(imageSrc)
  try {
    const { width, height } = await readImageSize(imageSrc)
    const result = simulate(width, height, seed)
    cache.set(imageSrc, result)
    return result
  } catch {
    const result = simulate(800, 800, seed)
    cache.set(imageSrc, result)
    return result
  }
}