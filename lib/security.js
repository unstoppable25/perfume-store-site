// Security headers middleware for Next.js API routes

export function addSecurityHeaders(res) {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY')

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff')

  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block')

  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Content Security Policy (basic)
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'")

  // HSTS (HTTP Strict Transport Security) - only in production
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }
}

// Rate limiting for general API endpoints
import { rateLimit } from './rateLimit'

export function withRateLimit(handler, maxRequests = 100, windowMs = 15 * 60 * 1000) {
  return async (req, res) => {
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown'
    const rateLimitResult = rateLimit(`api_${clientIP}`, maxRequests, windowMs)

    if (!rateLimitResult.allowed) {
      console.log(`[SECURITY] API rate limit exceeded for IP: ${clientIP}`)
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.'
      })
    }

    // Add security headers
    addSecurityHeaders(res)

    return handler(req, res)
  }
}