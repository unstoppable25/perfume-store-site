import { getSettings } from '../../lib/db'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { state, city, cartTotal, customerLat, customerLng } = req.body

      // Get delivery settings from database
      const settings = await getSettings()

      const defaultFee = settings.delivery_default_fee ? parseInt(settings.delivery_default_fee) : 2000
      const freeThreshold = settings.delivery_free_threshold ? parseInt(settings.delivery_free_threshold) : 0

      // Parse delivery settings
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

      // Only use ZONE-BASED delivery system (legacy system)
      console.log('Using ZONE-BASED delivery system')

      // Check if free delivery applies
      if (freeThreshold > 0 && cartTotal >= freeThreshold) {
        console.log('FREE DELIVERY APPLIED!')
        return res.status(200).json({
          success: true,
          fee: 0,
          message: `🎉 FREE DELIVERY on orders above ₦${freeThreshold.toLocaleString('en-NG')}`,
          deliveryType: 'free'
        })
      }

      // Zone-based delivery logic
      let deliveryFee = defaultFee
      let deliveryMessage = 'Standard delivery'
      let deliveryType = 'default'

      // Check for exact zone matches
      let matchedZone = null

      // First, try to find exact city match
      if (city) {
        for (const zone of zones) {
          if (!zone.states || !Array.isArray(zone.states)) continue

          // Check for exact city match in zone locations
          if (zone.states.some(location =>
            location.toLowerCase().trim() === city.toLowerCase().trim()
          )) {
            matchedZone = zone
            deliveryType = 'zone_exact_match'
            break
          }
        }
      }

      // If no exact city match, check for state-level zones
      if (!matchedZone && state) {
        for (const zone of zones) {
          if (!zone.states || !Array.isArray(zone.states)) continue

          // Check if zone covers the entire state
          if (zone.states.some(location =>
            location.toLowerCase().trim() === state.toLowerCase().trim()
          )) {
            matchedZone = zone
            deliveryType = 'zone_state_match'
            break
          }
        }
      }

      // Apply matched zone fee
      if (matchedZone) {
        deliveryFee = parseInt(matchedZone.fee) || defaultFee
        deliveryMessage = `${matchedZone.name} delivery`
        console.log('Zone match found:', {
          zone: matchedZone.name,
          fee: deliveryFee,
          locations: matchedZone.states,
          matchType: deliveryType,
          customerLocation: { city, state }
        })
      } else {
        // No zone match - check for state flat rates
        if (stateFlatRates[state] && stateFlatRates[state] > 0) {
          deliveryFee = stateFlatRates[state]
          deliveryMessage = `${state} delivery`
          deliveryType = 'state_flat_rate'
          console.log('Using state flat rate:', {
            state,
            fee: deliveryFee
          })
        } else {
          console.log('No zone or state match found, using default fee:', {
            state,
            city,
            availableZones: zones.map(z => ({ name: z.name, locations: z.states })),
            availableStateRates: Object.keys(stateFlatRates)
          })
        }
      }

      console.log('Zone-based delivery fee calculation result:', {
        fee: deliveryFee,
        message: deliveryMessage,
        type: deliveryType,
        matchedZone: matchedZone ? matchedZone.name : null,
        customerLocation: { city, state }
      })

      return res.status(200).json({
        success: true,
        fee: deliveryFee,
        message: deliveryMessage,
        deliveryType
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
