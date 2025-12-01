// Flexible DB helper: prefer better-sqlite3, fall back to JSON file store for local dev
import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const JSON_FILE = path.join(DATA_DIR, 'products.json')

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR)
  if (!fs.existsSync(JSON_FILE)) fs.writeFileSync(JSON_FILE, '[]')
}

let sqliteAvailable = false
let db = null
try {
  // try to require better-sqlite3 if installed
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Database = require('better-sqlite3')
  const DB_FILE = path.join(DATA_DIR, 'store.db')
  ensureDataFile()
  db = new Database(DB_FILE)
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price TEXT NOT NULL,
      description TEXT,
      image TEXT
    );
  `)
  sqliteAvailable = true
} catch (err) {
  // better-sqlite3 not available — will use JSON file fallback
  sqliteAvailable = false
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
  ensureDataFile()
  fs.writeFileSync(JSON_FILE, JSON.stringify(products, null, 2))
}

export function getAllProducts() {
  if (sqliteAvailable) {
    const stmt = db.prepare('SELECT * FROM products')
    return stmt.all()
  }
  return readProductsFile()
}

export function getProductById(id) {
  if (sqliteAvailable) {
    const stmt = db.prepare('SELECT * FROM products WHERE id = ?')
    return stmt.get(id)
  }
  return readProductsFile().find((p) => p.id === id)
}

export function createProduct(p) {
  if (sqliteAvailable) {
    const stmt = db.prepare('INSERT INTO products (id, name, price, description, image) VALUES (@id,@name,@price,@description,@image)')
    stmt.run(p)
    return p
  }
  const products = readProductsFile()
  products.push(p)
  writeProductsFile(products)
  return p
}

export function updateProduct(p) {
  if (sqliteAvailable) {
    const stmt = db.prepare('UPDATE products SET name=@name, price=@price, description=@description, image=@image WHERE id=@id')
    stmt.run(p)
    return getProductById(p.id)
  }
  const products = readProductsFile()
  const idx = products.findIndex((x) => x.id === p.id)
  if (idx === -1) return null
  products[idx] = p
  writeProductsFile(products)
  return products[idx]
}

export function deleteProduct(id) {
  if (sqliteAvailable) {
    const stmt = db.prepare('DELETE FROM products WHERE id = ?')
    return stmt.run(id)
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
  fs.writeFileSync(file, JSON.stringify(settings, null, 2))
}

export function getSetting(key) {
  const file = path.join(DATA_DIR, 'settings.json')
  if (!fs.existsSync(file)) return null
  const settings = JSON.parse(fs.readFileSync(file, 'utf8') || '{}')
  return settings[key] || null
}

export default db
