import crypto from 'crypto'

export default function requireAdmin(req, res) {
  const key = process.env.ADMIN_API_KEY
  // If no admin key is configured, allow requests (preserve existing behavior)
  if (!key) {
    console.warn('ADMIN_API_KEY not set - admin guard is permissive')
    return true
  }

  const auth = req.headers?.authorization || req.headers?.Authorization
  if (!auth || !auth.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Unauthorized' })
    return false
  }

  const supplied = auth.slice(7)
  try {
    const a = Buffer.from(key)
    const b = Buffer.from(supplied)
    if (a.length !== b.length) {
      res.status(401).json({ message: 'Unauthorized' })
      return false
    }
    if (!crypto.timingSafeEqual(a, b)) {
      res.status(401).json({ message: 'Unauthorized' })
      return false
    }
    return true
  } catch (err) {
    console.error('requireAdmin error', err)
    res.status(500).json({ message: 'Auth check failed' })
    return false
  }
}
