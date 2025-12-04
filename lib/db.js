// Flexible DB helper: uses Vercel KV for production, falls back to JSON for local dev
import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const JSON_FILE = path.join(DATA_DIR, 'products.json')

// KV client will be initialized lazily
let kv = null
let kvInitialized = false

async function initKV() {
  if (kvInitialized) {
    console.log('initKV - Using cached KV client:', !!kv)
    return kv
  }
  kvInitialized = true
  
  console.log('initKV - Initializing KV client...')
  const hasUpstashVars = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  const hasVercelKVVars = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
  
  console.log('initKV - Environment check:', { hasUpstashVars, hasVercelKVVars })

  if (hasUpstashVars || hasVercelKVVars) {
    try {
      const kvModule = await import('@vercel/kv')
      const { createClient } = kvModule
      
      if (hasVercelKVVars) {
        kv = createClient({
          url: process.env.KV_REST_API_URL,
          token: process.env.KV_REST_API_TOKEN,
        })
        console.log('Vercel KV initialized successfully')
      } else if (hasUpstashVars) {
        kv = createClient({
          url: process.env.UPSTASH_REDIS_REST_URL,
          token: process.env.UPSTASH_REDIS_REST_TOKEN,
        })
        console.log('Upstash Redis initialized successfully')
      }
    } catch (err) {
      console.error('Failed to initialize KV:', err.message)
      kv = null
    }
  } else {
    console.log('No KV environment variables found, using JSON fallback')
    kv = null
  }
  
  return kv
}

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
  if (!fs.existsSync(JSON_FILE)) {
    fs.writeFileSync(JSON_FILE, '[]')
  }
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

// Orders management
export async function getAllOrders() {
  await initKV()
  
  if (kv) {
    try {
      const orders = await kv.get('orders')
      return orders || []
    } catch (err) {
      console.error('KV get orders error:', err)
      return []
    }
  }
  
  // JSON fallback
  const ordersFile = path.join(DATA_DIR, 'orders.json')
  if (fs.existsSync(ordersFile)) {
    return JSON.parse(fs.readFileSync(ordersFile, 'utf8') || '[]')
  }
  return []
}

export async function createOrder(order) {
  await initKV()
  
  // Add default status and timestamps
  order.status = order.status || 'Pending'
  order.createdAt = order.createdAt || new Date().toISOString()
  order.updatedAt = new Date().toISOString()
  
  if (kv) {
    try {
      const orders = await getAllOrders()
      orders.push(order)
      await kv.set('orders', orders)
      return order
    } catch (err) {
      console.error('KV create order error:', err)
      throw err
    }
  }
  
  // JSON fallback
  const ordersFile = path.join(DATA_DIR, 'orders.json')
  const orders = await getAllOrders()
  orders.push(order)
  
  try {
    fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2))
  } catch (err) {
    console.error('Failed to save order:', err)
  }
  
  return order
}

export async function deleteOrder(orderId) {
  await initKV()
  
  if (kv) {
    try {
      const orders = await getAllOrders()
      const filteredOrders = orders.filter(o => o.id !== orderId)
      await kv.set('orders', filteredOrders)
      console.log('Order deleted from KV:', orderId)
      return { success: true, message: 'Order cancelled successfully' }
    } catch (err) {
      console.error('KV delete order error:', err)
      return { success: false, message: 'Failed to cancel order' }
    }
  }
  
  // JSON fallback
  const ordersFile = path.join(DATA_DIR, 'orders.json')
  try {
    const orders = await getAllOrders()
    const filteredOrders = orders.filter(o => o.id !== orderId)
    fs.writeFileSync(ordersFile, JSON.stringify(filteredOrders, null, 2))
    console.log('Order deleted from JSON:', orderId)
    return { success: true, message: 'Order cancelled successfully' }
  } catch (err) {
    console.error('Failed to delete order:', err)
    return { success: false, message: 'Failed to cancel order' }
  }
}

export async function getOrderById(id) {
  const orders = await getAllOrders()
  return orders.find((o) => o.id === id)
}

export async function updateOrderStatus(orderId, status) {
  await initKV()
  
  if (kv) {
    try {
      const orders = await getAllOrders()
      const idx = orders.findIndex((o) => o.id === orderId)
      if (idx === -1) return null
      orders[idx].status = status
      orders[idx].updatedAt = new Date().toISOString()
      await kv.set('orders', orders)
      return orders[idx]
    } catch (err) {
      console.error('KV update order error:', err)
      throw err
    }
  }
  
  // JSON fallback
  const ordersFile = path.join(DATA_DIR, 'orders.json')
  const orders = await getAllOrders()
  const idx = orders.findIndex((o) => o.id === orderId)
  if (idx === -1) return null
  orders[idx].status = status
  orders[idx].updatedAt = new Date().toISOString()
  
  try {
    fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2))
  } catch (err) {
    console.error('Failed to update order:', err)
  }
  
  return orders[idx]
}

// Newsletter subscribers
export async function getAllSubscribers() {
  await initKV()
  
  if (kv) {
    try {
      const subscribers = await kv.get('subscribers')
      return subscribers || []
    } catch (err) {
      console.error('KV get subscribers error:', err)
      return []
    }
  }
  
  // JSON fallback
  const subsFile = path.join(DATA_DIR, 'subscribers.json')
  if (fs.existsSync(subsFile)) {
    return JSON.parse(fs.readFileSync(subsFile, 'utf8') || '[]')
  }
  return []
}

export async function addSubscriber(email) {
  await initKV()
  
  const subscriber = {
    id: Date.now().toString(),
    email,
    subscribedAt: new Date().toISOString()
  }
  
  if (kv) {
    try {
      const subscribers = await getAllSubscribers()
      // Check if already subscribed
      if (subscribers.find(s => s.email === email)) {
        return { alreadySubscribed: true }
      }
      subscribers.push(subscriber)
      await kv.set('subscribers', subscribers)
      return subscriber
    } catch (err) {
      console.error('KV add subscriber error:', err)
      throw err
    }
  }
  
  // JSON fallback
  const subsFile = path.join(DATA_DIR, 'subscribers.json')
  const subscribers = await getAllSubscribers()
  if (subscribers.find(s => s.email === email)) {
    return { alreadySubscribed: true }
  }
  subscribers.push(subscriber)
  
  try {
    fs.writeFileSync(subsFile, JSON.stringify(subscribers, null, 2))
  } catch (err) {
    console.error('Failed to save subscriber:', err)
  }
  
  return subscriber
}

// Contact messages
export async function getAllMessages() {
  await initKV()
  
  if (kv) {
    try {
      const messages = await kv.get('messages')
      return messages || []
    } catch (err) {
      console.error('KV get messages error:', err)
      return []
    }
  }
  
  // JSON fallback
  const messagesFile = path.join(DATA_DIR, 'messages.json')
  if (fs.existsSync(messagesFile)) {
    return JSON.parse(fs.readFileSync(messagesFile, 'utf8') || '[]')
  }
  return []
}

export async function createMessage(message) {
  await initKV()
  
  if (kv) {
    try {
      const messages = await getAllMessages()
      messages.push(message)
      await kv.set('messages', messages)
      return message
    } catch (err) {
      console.error('KV create message error:', err)
      throw err
    }
  }
  
  // JSON fallback
  const messagesFile = path.join(DATA_DIR, 'messages.json')
  const messages = await getAllMessages()
  messages.push(message)
  
  try {
    fs.writeFileSync(messagesFile, JSON.stringify(messages, null, 2))
  } catch (err) {
    console.error('Failed to save message:', err)
  }
  
  return message
}

// ============================================
// User Management Functions
// ============================================

export async function createUser(user) {
  const kv = await initKV()
  
  // Always save to JSON fallback for redundancy
  const dataDir = path.join(process.cwd(), 'data')
  const usersFile = path.join(dataDir, 'users.json')
  
  // Ensure data directory exists
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
    console.log('Created data directory')
  }
  
  let users = []
  try {
    if (fs.existsSync(usersFile)) {
      const fileContent = fs.readFileSync(usersFile, 'utf-8')
      users = JSON.parse(fileContent)
      console.log('Read existing users from JSON:', users.length)
    } else {
      console.log('Users file does not exist, creating new')
    }
  } catch (err) {
    console.error('Failed to read users file:', err)
    users = []
  }
  
  users.push(user)
  
  try {
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2))
    console.log('User saved to JSON:', user.id, 'Total users:', users.length)
  } catch (err) {
    console.error('Failed to save user to JSON:', err)
  }
  
  // Try to save to KV if available
  console.log('createUser - About to save to KV, kv available:', !!kv)
  if (kv) {
    try {
      console.log('createUser - User data to save:', user.id)
      
      // @vercel/kv automatically serializes objects, no JSON.stringify needed
      await kv.hset('users', { [user.id]: user })
      console.log('createUser - User saved to KV successfully:', user.id)
      
      // Verify it was saved
      const verify = await kv.hgetall('users')
      console.log('createUser - Verification: Total fields in users hash:', verify ? Object.keys(verify).length : 0)
    } catch (err) {
      console.error('KV createUser error:', err.message, err.stack)
    }
  } else {
    console.log('createUser - KV not available, skipping KV save')
  }
  
  return user
}

export async function getUserByEmailOrPhone(emailOrPhone) {
  const kv = await initKV()
  
  // Always try JSON file first for reliability
  const usersFile = path.join(process.cwd(), 'data', 'users.json')
  try {
    if (fs.existsSync(usersFile)) {
      const fileContent = fs.readFileSync(usersFile, 'utf-8')
      const users = JSON.parse(fileContent)
      const found = users.find(u => u.email === emailOrPhone || u.phone === emailOrPhone)
      if (found) {
        console.log('JSON user search for:', emailOrPhone, 'Found:', !!found)
        return found
      }
    }
  } catch (err) {
    console.error('Failed to read users from JSON:', err)
  }
  
  // Try KV if available
  console.log('getUserByEmailOrPhone - Searching KV, kv available:', !!kv)
  if (kv) {
    try {
      const users = await kv.hgetall('users')
      console.log('getUserByEmailOrPhone - Raw KV response:', users ? Object.keys(users).length + ' fields' : 'null')
      if (users) {
        // @vercel/kv returns objects directly, no JSON.parse needed
        const userArray = Object.values(users)
        console.log('getUserByEmailOrPhone - Users count:', userArray.length)
        const found = userArray.find(u => u.email === emailOrPhone || u.phone === emailOrPhone)
        if (found) {
          console.log('KV user search for:', emailOrPhone, 'Found:', !!found)
          return found
        }
      }
    } catch (err) {
      console.error('KV getUserByEmailOrPhone error:', err.message, err.stack)
    }
  }
  
  console.log('User not found:', emailOrPhone)
  return null
}

export async function getAllUsers() {
  const kv = await initKV()
  
  // Always try JSON file first for reliability
  const usersFile = path.join(process.cwd(), 'data', 'users.json')
  let jsonUsers = []
  try {
    if (fs.existsSync(usersFile)) {
      const fileContent = fs.readFileSync(usersFile, 'utf-8')
      jsonUsers = JSON.parse(fileContent)
      console.log('Found users in JSON:', jsonUsers.length)
    }
  } catch (err) {
    console.error('Failed to read users from JSON:', err)
  }
  
  // Try KV if available
  if (kv) {
    try {
      const users = await kv.hgetall('users')
      if (users && Object.keys(users).length > 0) {
        // @vercel/kv returns objects directly, no JSON.parse needed
        const kvUsers = Object.values(users)
        console.log('Found users in KV:', kvUsers.length)
        return kvUsers
      }
    } catch (err) {
      console.error('KV getAllUsers error:', err)
    }
  }
  
  return jsonUsers
}

export async function deleteUser(userId) {
  const kv = await initKV()
  
  // Try to delete from JSON file
  const usersFile = path.join(process.cwd(), 'data', 'users.json')
  try {
    if (fs.existsSync(usersFile)) {
      const fileContent = fs.readFileSync(usersFile, 'utf-8')
      let users = JSON.parse(fileContent)
      users = users.filter(u => u.id !== userId)
      fs.writeFileSync(usersFile, JSON.stringify(users, null, 2))
      console.log('User deleted from JSON:', userId)
    }
  } catch (err) {
    console.error('Failed to delete user from JSON:', err)
  }
  
  // Delete from KV if available
  if (kv) {
    try {
      await kv.hdel('users', userId)
      console.log('User deleted from KV:', userId)
      return { success: true, message: 'User deleted successfully' }
    } catch (err) {
      console.error('KV deleteUser error:', err)
      return { success: false, message: 'Failed to delete user from KV' }
    }
  }
  
  return { success: true, message: 'User deleted from JSON' }
}

export async function updateUserPassword(userId, newPassword) {
  const kv = await initKV()
  
  // Try to update in JSON file
  const usersFile = path.join(process.cwd(), 'data', 'users.json')
  try {
    if (fs.existsSync(usersFile)) {
      const fileContent = fs.readFileSync(usersFile, 'utf-8')
      let users = JSON.parse(fileContent)
      const userIndex = users.findIndex(u => u.id === userId)
      if (userIndex !== -1) {
        users[userIndex].password = newPassword
        fs.writeFileSync(usersFile, JSON.stringify(users, null, 2))
        console.log('Password updated in JSON:', userId)
      }
    }
  } catch (err) {
    console.error('Failed to update password in JSON:', err)
  }
  
  // Update in KV if available
  if (kv) {
    try {
      const users = await kv.hgetall('users')
      if (users && users[userId]) {
        const user = users[userId]
        user.password = newPassword
        await kv.hset('users', { [userId]: user })
        console.log('Password updated in KV:', userId)
        return { success: true, message: 'Password updated successfully' }
      } else {
        return { success: false, message: 'User not found' }
      }
    } catch (err) {
      console.error('KV updateUserPassword error:', err)
      return { success: false, message: 'Failed to update password' }
    }
  }
  
  return { success: true, message: 'Password updated in JSON' }
}

// Settings functions for site-wide configuration
export async function getSettings() {
  await initKV()
  
  // Try to get from KV first
  if (kv) {
    try {
      const settings = await kv.hgetall('site_settings')
      if (settings) {
        return settings
      }
    } catch (err) {
      console.error('KV getSettings error:', err)
    }
  }
  
  // Fallback to JSON
  const settingsFile = path.join(DATA_DIR, 'settings.json')
  if (fs.existsSync(settingsFile)) {
    return JSON.parse(fs.readFileSync(settingsFile, 'utf-8'))
  }
  
  return {}
}

export async function updateSettings(key, value) {
  await initKV()
  
  // Update in JSON
  const settingsFile = path.join(DATA_DIR, 'settings.json')
  let settings = {}
  if (fs.existsSync(settingsFile)) {
    settings = JSON.parse(fs.readFileSync(settingsFile, 'utf-8'))
  }
  settings[key] = value
  
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
  fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2))
  
  // Update in KV if available
  if (kv) {
    try {
      await kv.hset('site_settings', { [key]: value })
      console.log('Settings updated in KV:', key)
    } catch (err) {
      console.error('KV updateSettings error:', err)
    }
  }
  
  return settings
}
