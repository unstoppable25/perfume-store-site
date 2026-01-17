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

      let stateFlatRates = {}
      try {
        if (settings.state_flat_rates) {
          const ratesValue = settings.state_flat_rates
          if (typeof ratesValue === 'string' && ratesValue.trim()) {
            stateFlatRates = JSON.parse(ratesValue)
          } else if (typeof ratesValue === 'object') {
            stateFlatRates = ratesValue
          }
        }
      } catch (err) {
        console.error('Failed to parse state flat rates:', err)
      }

      let pickupAddresses = []
      try {
        if (settings.pickup_addresses) {
          const addressesValue = settings.pickup_addresses
          if (Array.isArray(addressesValue)) {
            pickupAddresses = addressesValue
          } else if (typeof addressesValue === 'string' && addressesValue.trim()) {
            pickupAddresses = JSON.parse(addressesValue)
          }
        }
      } catch (err) {
        console.error('Failed to parse pickup addresses:', err)
        pickupAddresses = []
      }
      
      const deliverySettings = {
        defaultFee: settings.delivery_default_fee ? parseInt(settings.delivery_default_fee) : 2000,
        freeThreshold: settings.delivery_free_threshold ? parseInt(settings.delivery_free_threshold) : 0,
        selfPickupEnabled: settings.self_pickup_enabled === 'true' || settings.self_pickup_enabled === true,
        zones: zones,
        pickupAddresses: pickupAddresses,
        stateFlatRates: stateFlatRates
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
