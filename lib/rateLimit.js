// Simple in-memory rate limiter for Vercel serverless functions
// In production, consider using Redis or a dedicated rate limiting service

const rateLimitStore = new Map()

export function rateLimit(identifier, maxRequests = 5, windowMs = 15 * 60 * 1000) { // 15 minutes
  const now = Date.now()
  const key = identifier

  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, { requests: [], blocked: false, blockedUntil: 0 })
  }

  const userData = rateLimitStore.get(key)

  // Check if user is currently blocked
  if (userData.blocked && now < userData.blockedUntil) {
    return {
      allowed: false,
      remainingTime: Math.ceil((userData.blockedUntil - now) / 1000),
      message: 'Too many requests. Please try again later.'
    }
  }

  // Clean old requests outside the window
  userData.requests = userData.requests.filter(time => now - time < windowMs)

  // Check if under limit
  if (userData.requests.length < maxRequests) {
    userData.requests.push(now)
    userData.blocked = false
    return { allowed: true, remainingRequests: maxRequests - userData.requests.length }
  }

  // Rate limit exceeded - block for window duration
  userData.blocked = true
  userData.blockedUntil = now + windowMs

  return {
    allowed: false,
    remainingTime: Math.ceil(windowMs / 1000),
    message: `Too many requests. Blocked for ${Math.ceil(windowMs / 60000)} minutes.`
  }
}

// Clean up old entries periodically (basic cleanup)
setInterval(() => {
  const now = Date.now()
  for (const [key, data] of rateLimitStore.entries()) {
    // Remove entries that haven't been active in the last hour
    if (data.requests.length === 0 && (!data.blocked || now > data.blockedUntil)) {
      rateLimitStore.delete(key)
    }
  }
}, 60 * 60 * 1000) // Clean every hour