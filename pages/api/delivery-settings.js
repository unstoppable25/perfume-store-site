import { getSettings } from '../../lib/db'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const settings = await getSettings()
      console.log('Delivery settings - raw zones:', settings.delivery_zones)
      
      let zones = []
      try {
        if (settings.delivery_zones) {
          if (Array.isArray(settings.delivery_zones)) {
            zones = settings.delivery_zones
          } else if (typeof settings.delivery_zones === 'string' && settings.delivery_zones.trim()) {
            zones = JSON.parse(settings.delivery_zones)
          }
        }
      } catch (err) {
        console.error('Failed to parse delivery zones:', err)
        zones = []
      }
      
      const deliverySettings = {
        defaultFee: settings.delivery_default_fee ? parseInt(settings.delivery_default_fee) : 2000,
        freeThreshold: settings.delivery_free_threshold ? parseInt(settings.delivery_free_threshold) : 0,
        selfPickupEnabled: settings.self_pickup_enabled === 'true' || settings.self_pickup_enabled === true,
        zones: zones
      }
      
      console.log('Delivery settings API response:', deliverySettings)
      console.log('Raw self_pickup_enabled value:', settings.self_pickup_enabled, 'Type:', typeof settings.self_pickup_enabled)

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
