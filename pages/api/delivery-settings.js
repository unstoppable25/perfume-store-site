import { getSettings } from '../../lib/db'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const settings = await getSettings()
      
      const deliverySettings = {
        defaultFee: settings.delivery_default_fee ? parseInt(settings.delivery_default_fee) : 2000,
        freeThreshold: settings.delivery_free_threshold ? parseInt(settings.delivery_free_threshold) : 0,
        zones: settings.delivery_zones ? JSON.parse(settings.delivery_zones) : []
      }

      return res.status(200).json({
        success: true,
        settings: deliverySettings
      })

    } catch (err) {
      console.error('Error fetching delivery settings:', err)
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch delivery settings'
      })
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' })
  }
}
