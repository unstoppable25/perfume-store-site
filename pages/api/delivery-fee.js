import { getSettings } from '../../lib/db'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { state, city, cartTotal } = req.body

      // Get delivery settings from database
      const settings = await getSettings()
      console.log('Delivery fee calc - raw settings:', {
        default_fee: settings.delivery_default_fee,
        free_threshold: settings.delivery_free_threshold,
        zones: settings.delivery_zones
      })
      
      const defaultFee = settings.delivery_default_fee ? parseInt(settings.delivery_default_fee) : 2000
      const freeThreshold = settings.delivery_free_threshold ? parseInt(settings.delivery_free_threshold) : 0
      
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
        console.error('Failed to parse delivery zones in fee calc:', err)
        zones = []
      }
      
      console.log('Delivery fee calc - parsed:', { defaultFee, freeThreshold, zonesCount: zones.length })

      // Check if free delivery applies
      console.log('Checking free delivery: cartTotal =', cartTotal, 'freeThreshold =', freeThreshold)
      if (freeThreshold > 0 && cartTotal >= freeThreshold) {
        console.log('FREE DELIVERY APPLIED!')
        return res.status(200).json({
          success: true,
          fee: 0,
          message: `🎉 FREE DELIVERY on orders above ₦${freeThreshold.toLocaleString('en-NG')}`
        })
      }

      // Check if location matches any zone - prioritize specific matches
      if (state || city) {
        let matchingZone = null
        let bestMatchType = 'none' // 'city', 'state', or 'none'

        for (const zone of zones) {
          if (!zone.states || zone.states.length === 0) continue

          // Check for exact city/LGA match first
          if (city) {
            const cityMatch = zone.states.some(s =>
              s.toLowerCase() === city.toLowerCase() ||
              s.toLowerCase().includes(city.toLowerCase()) ||
              city.toLowerCase().includes(s.toLowerCase())
            )
            if (cityMatch) {
              matchingZone = zone
              bestMatchType = 'city'
              break // Exact city match takes priority
            }
          }

          // If no city match, check for state match (but only if we haven't found a city match)
          if (bestMatchType !== 'city' && state) {
            const stateMatch = zone.states.some(s =>
              s.toLowerCase() === state.toLowerCase() ||
              s.toLowerCase().includes(state.toLowerCase()) ||
              state.toLowerCase().includes(s.toLowerCase())
            )
            if (stateMatch && bestMatchType !== 'city') {
              matchingZone = zone
              bestMatchType = 'state'
              // Don't break - continue looking for city matches
            }
          }
        }

        if (matchingZone) {
          return res.status(200).json({
            success: true,
            fee: matchingZone.fee,
            message: `${matchingZone.name} delivery`,
            zone: matchingZone.name,
            matchType: bestMatchType
          })
        }
      }

      // Return default fee
      return res.status(200).json({
        success: true,
        fee: defaultFee,
        message: 'Standard delivery'
      })

    } catch (err) {
      console.error('Error calculating delivery fee:', err)
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to calculate delivery fee',
        fee: 2000 // Fallback fee
      })
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' })
  }
}
