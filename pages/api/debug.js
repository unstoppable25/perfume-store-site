export default async function handler(req, res) {
  const envCheck = {
    hasUpstashUrl: !!process.env.UPSTASH_REDIS_REST_URL,
    hasUpstashToken: !!process.env.UPSTASH_REDIS_REST_TOKEN,
    hasKVUrl: !!process.env.KV_REST_API_URL,
    hasKVToken: !!process.env.KV_REST_API_TOKEN,
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV
  }

  // Test file system access
  const fs = require('fs')
  const path = require('path')
  const dataDir = path.join(process.cwd(), 'data')
  
  let fsTest = {
    dataDirExists: fs.existsSync(dataDir),
    canWrite: false
  }

  try {
    const testFile = path.join(dataDir, 'test.json')
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }
    fs.writeFileSync(testFile, JSON.stringify({ test: true }))
    fsTest.canWrite = true
    fs.unlinkSync(testFile)
  } catch (err) {
    fsTest.error = err.message
  }

  // Test KV connection
  let kvTest = { connected: false }
  try {
    const { createUser, getUserByEmailOrPhone, getAllUsers } = require('../../lib/db')
    const allUsers = await getAllUsers()
    kvTest.connected = true
    kvTest.userCount = allUsers.length
    kvTest.users = allUsers.map(u => ({ id: u.id, email: u.email, firstName: u.firstName }))
  } catch (err) {
    kvTest.error = err.message
  }

  return res.status(200).json({
    environment: envCheck,
    fileSystem: fsTest,
    database: kvTest,
    message: 'Debug info retrieved'
  })
}
