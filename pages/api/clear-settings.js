import { updateSettings } from '../../lib/db'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // Clear corrupted settings and set defaults
      await updateSettings('delivery_zones', '[]')
      await updateSettings('promo_codes', '[]')
      await updateSettings('delivery_default_fee', '2000')
      await updateSettings('delivery_free_threshold', '0')
      await updateSettings('self_pickup_enabled', 'false')
      
      res.status(200).json({ 
        success: true, 
        message: 'Settings cleared and reset to defaults' 
      })
    } catch (err) {
      console.error('Failed to clear settings:', err)
      res.status(500).json({ 
        success: false, 
        message: 'Failed to clear settings', 
        error: err.message 
      })
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}
