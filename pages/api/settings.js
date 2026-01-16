import { getSettings, updateSettings } from '../../lib/db'
import requireAdmin from '../../lib/requireAdmin'
import { addSecurityHeaders } from '../../lib/security'

export default async function handler(req, res) {
  // Add security headers
  addSecurityHeaders(res)
  if (req.method === 'GET') {
    try {
      const settings = await getSettings()
      console.log('GET /api/settings - Retrieved settings:', Object.keys(settings))
      res.status(200).json({ success: true, settings })
    } catch (err) {
      console.error('Failed to get settings:', err)
      res.status(500).json({ success: false, message: 'Failed to get settings', error: err.message })
    }
  } else if (req.method === 'POST') {
    if (!requireAdmin(req, res)) return
    try {
      const { key, value } = req.body

      // Input validation
      if (!key || typeof key !== 'string' || key.length > 100) {
        console.log(`[SECURITY AUDIT] Invalid settings key: ${key}`)
        return res.status(400).json({ success: false, message: 'Invalid key format' })
      }

      // Handle different value types for logging
      const logValue = typeof value === 'string'
        ? value.substring(0, 50) + '...'
        : Array.isArray(value)
          ? `Array(${value.length})`
          : JSON.stringify(value)

      console.log(`[ADMIN AUDIT] Settings updated - Key: ${key}, Value: ${logValue}, IP: ${req.headers['x-forwarded-for'] || req.connection.remoteAddress}, Time: ${new Date().toISOString()}`)

      const updatedSettings = await updateSettings(key, value)
      console.log('POST /api/settings - Settings saved successfully')
      res.status(200).json({ success: true, settings: updatedSettings })
    } catch (err) {
      console.error('Failed to update settings:', err)
      res.status(500).json({ success: false, message: 'Failed to update settings', error: err.message })
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}
