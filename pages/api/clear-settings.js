export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // Import KV client
      const { kv } = await import('@vercel/kv')
      
      // Delete all delivery and promo settings to start fresh
      await kv.hdel('site_settings', 
        'delivery_zones',
        'promo_codes', 
        'delivery_default_fee',
        'delivery_free_threshold',
        'self_pickup_enabled'
      )
      
      console.log('Corrupted settings deleted from KV')
      
      // Set fresh defaults
      await kv.hset('site_settings', {
        'delivery_zones': '[]',
        'promo_codes': '[]',
        'delivery_default_fee': '2000',
        'delivery_free_threshold': '0',
        'self_pickup_enabled': 'false'
      })
      
      console.log('Fresh default settings created')
      
      res.status(200).json({ 
        success: true, 
        message: 'Settings cleared and reset to defaults. Please refresh the admin page.' 
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
