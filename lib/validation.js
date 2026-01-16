// Input validation utilities for security

export function sanitizeString(input, maxLength = 1000) {
  if (typeof input !== 'string') return ''
  return input.trim().substring(0, maxLength).replace(/[<>]/g, '')
}

export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

export function validatePhone(phone) {
  // Basic phone validation - allow digits, spaces, hyphens, parentheses, plus
  const phoneRegex = /^[\d\s\-\(\)\+]{7,20}$/
  return phoneRegex.test(phone)
}

export function validatePromoCode(code) {
  // Allow alphanumeric, uppercase, hyphens, underscores, max 20 chars
  const codeRegex = /^[A-Z0-9\-_]{1,20}$/
  return codeRegex.test(code)
}

export function validateProductData(product) {
  const errors = []

  if (!product.name || typeof product.name !== 'string' || product.name.trim().length < 2) {
    errors.push('Product name must be at least 2 characters')
  }

  if (!product.price || isNaN(parseFloat(product.price)) || parseFloat(product.price) < 0) {
    errors.push('Valid price is required')
  }

  if (product.description && product.description.length > 5000) {
    errors.push('Description too long (max 5000 characters)')
  }

  return errors
}

export function validateOrderData(order) {
  const errors = []

  if (!order.customer?.email || !validateEmail(order.customer.email)) {
    errors.push('Valid customer email is required')
  }

  if (!order.customer?.firstName || order.customer.firstName.trim().length < 2) {
    errors.push('Customer first name is required')
  }

  if (!order.items || !Array.isArray(order.items) || order.items.length === 0) {
    errors.push('Order must contain at least one item')
  }

  return errors
}

// XSS prevention - basic HTML entity encoding
export function encodeHtml(text) {
  if (typeof text !== 'string') return text
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}