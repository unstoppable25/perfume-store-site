// Flexible DB helper: uses Vercel KV for production, falls back to JSON for local dev
import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const JSON_FILE = path.join(DATA_DIR, 'products.json')

// KV client will be initialized lazily
let kv = null
let kvInitialized = false

async function initKV() {
  if (kvInitialized) return
  kvInitialized = true
  
  const hasUpstashVars = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  const hasVercelKVVars = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN

  if (hasUpstashVars || hasVercelKVVars) {
    try {
      const kvModule = await import('@vercel/kv')
      
      if (hasUpstashVars) {
        const { createClient } = kvModule
        kv = createClient({
          url: process.env.UPSTASH_REDIS_REST_URL,
          token: process.env.UPSTASH_REDIS_REST_TOKEN,
        })
        console.log('Upstash Redis initialized successfully')
      } else {
        kv = kvModule.kv
        console.log('Vercel KV initialized successfully')
      }
    } catch (err) {
      console.error('Failed to initialize KV:', err.message)
      kv = null
    }
  } else {
    console.log('No KV environment variables found, using JSON fallback')
    kv = null
  }
}

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR)
  if (!fs.existsSync(JSON_FILE)) fs.writeFileSync(JSON_FILE, '[]')
}

function readProductsFile() {
  ensureDataFile()
  const raw = fs.readFileSync(JSON_FILE, 'utf8')
  try {
    return JSON.parse(raw || '[]')
  } catch (e) {
    return []
  }
}

function writeProductsFile(products) {
  try {
    ensureDataFile()
    fs.writeFileSync(JSON_FILE, JSON.stringify(products, null, 2))
    console.log('Products saved successfully to:', JSON_FILE)
  } catch (err) {
    console.error('Failed to write products file:', err.message)
    console.error('This is expected on Vercel (read-only filesystem)')
    // Don't throw - let KV handle it
  }
}

export async function getAllProducts() {
  await initKV()
  
  if (kv) {
    try {
      const products = await kv.get('products')
      return products || []
    } catch (err) {
      console.error('KV get error:', err)
      return []
    }
  }
  return readProductsFile()
}

export async function getProductById(id) {
  const products = await getAllProducts()
  return products.find((p) => p.id === id)
}

export async function createProduct(p) {
  await initKV()
  
  if (kv) {
    try {
      const products = await getAllProducts()
      products.push(p)
      await kv.set('products', products)
      return p
    } catch (err) {
      console.error('KV create error:', err)
      throw err
    }
  }
  const products = readProductsFile()
  products.push(p)
  writeProductsFile(products)
  return p
}

export async function updateProduct(p) {
  await initKV()
  
  if (kv) {
    try {
      const products = await getAllProducts()
      const idx = products.findIndex((x) => x.id === p.id)
      if (idx === -1) return null
      products[idx] = p
      await kv.set('products', products)
      return products[idx]
    } catch (err) {
      console.error('KV update error:', err)
      throw err
    }
  }
  const products = readProductsFile()
  const idx = products.findIndex((x) => x.id === p.id)
  if (idx === -1) return null
  products[idx] = p
  writeProductsFile(products)
  return products[idx]
}

export async function deleteProduct(id) {
  await initKV()
  
  if (kv) {
    try {
      const products = await getAllProducts()
      const updated = products.filter((p) => p.id !== id)
      await kv.set('products', updated)
      return { deleted: true }
    } catch (err) {
      console.error('KV delete error:', err)
      throw err
    }
  }
  const products = readProductsFile()
  const updated = products.filter((p) => p.id !== id)
  writeProductsFile(updated)
  return { deleted: true }
}

export function setSetting(key, value) {
  // simple JSON fallback: store settings in a file under data/settings.json
  const file = path.join(DATA_DIR, 'settings.json')
  let settings = {}
  if (fs.existsSync(file)) settings = JSON.parse(fs.readFileSync(file, 'utf8') || '{}')
  settings[key] = value
  try {
    fs.writeFileSync(file, JSON.stringify(settings, null, 2))
  } catch (err) {
    console.error('Failed to save settings:', err.message)
  }
}

export function getSetting(key) {
  const file = path.join(DATA_DIR, 'settings.json')
  if (!fs.existsSync(file)) return null
  const settings = JSON.parse(fs.readFileSync(file, 'utf8') || '{}')
  return settings[key] || null
}
