import { getSettings } from '../../lib/db'

// Simple distance calculation function (Haversine formula)
// This can be replaced with Google Maps API for production
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

// Mock coordinate lookup for Nigerian locations
// In production, this should use Google Maps Geocoding API
function getCoordinatesForLocation(state, city) {
  // This is a simplified mock - replace with real geocoding
  const mockCoordinates = {
    'Lagos': { lat: 6.5244, lng: 3.3792 },
    'Abuja': { lat: 9.0765, lng: 7.3986 },
    'Ogun': { lat: 6.9098, lng: 3.2584 },
    // Add more coordinates as needed
  }

  // Try city first, then state
  return mockCoordinates[city] || mockCoordinates[state] || { lat: 6.5244, lng: 3.3792 } // Default to Lagos
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { state, city, cartTotal, customerLat, customerLng } = req.body

      // Get delivery settings from database
      const settings = await getSettings()

      const defaultFee = settings.delivery_default_fee ? parseInt(settings.delivery_default_fee) : 2000
      const freeThreshold = settings.delivery_free_threshold ? parseInt(settings.delivery_free_threshold) : 0

      // Parse new delivery settings
      let storeAddress = {
        address: '',
        city: 'Lagos',
        state: 'Lagos',
        coordinates: { lat: 6.5244, lng: 3.3792 }
      }
      try {
        if (settings.store_address) {
          const addressValue = settings.store_address
          if (typeof addressValue === 'string' && addressValue.trim()) {
            storeAddress = JSON.parse(addressValue)
          } else if (typeof addressValue === 'object') {
            storeAddress = addressValue
          }
        }
      } catch (err) {
        console.error('Failed to parse store address:', err)
      }

      let distanceTiers = [
        { min: 0, max: 3, fee: 1500 },
        { min: 3, max: 6, fee: 2000 },
        { min: 6, max: 10, fee: 2500 },
        { min: 10, max: 15, fee: 3000 },
        { min: 15, max: null, fee: 3500 }
      ]
      try {
        if (settings.distance_tiers) {
          const tiersValue = settings.distance_tiers
          if (Array.isArray(tiersValue)) {
            distanceTiers = tiersValue
          } else if (typeof tiersValue === 'string' && tiersValue.trim()) {
            distanceTiers = JSON.parse(tiersValue)
          }
        }
      } catch (err) {
        console.error('Failed to parse distance tiers:', err)
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

      // Check which delivery system to use
      const useDistanceBasedPricing = settings.use_distance_based_pricing === 'true' || settings.use_distance_based_pricing === true

      if (useDistanceBasedPricing) {
        // NEW DISTANCE-BASED SYSTEM
        console.log('Using NEW distance-based delivery system')
        
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

        // Distance-based delivery logic
        let deliveryFee = defaultFee
        let deliveryMessage = 'Standard delivery'
        let deliveryType = 'default'

        // Get customer coordinates
        let customerCoords = null
        if (customerLat && customerLng) {
          customerCoords = { lat: parseFloat(customerLat), lng: parseFloat(customerLng) }
        } else {
          // Fallback to mock coordinates based on state/city
          customerCoords = getCoordinatesForLocation(state, city)
        }

        // Calculate distance from store
        const storeCoords = storeAddress.coordinates || { lat: 6.5244, lng: 3.3792 }
        const distance = calculateDistance(
          storeCoords.lat, storeCoords.lng,
          customerCoords.lat, customerCoords.lng
        )

        console.log('Distance calculation:', {
          store: storeCoords,
          customer: customerCoords,
          distance: distance.toFixed(2) + ' km'
        })

        // Determine if location is in coverage area (Lagos + 15km Ogun)
        const isInCoverageArea = (
          state === 'Lagos' ||
          (state === 'Ogun' && distance <= 15)
        )

        if (isInCoverageArea) {
          // Use distance-based pricing
          for (const tier of distanceTiers) {
            if (tier.max === null && distance >= tier.min) {
              // Flat rate for 15km+
              deliveryFee = tier.fee
              deliveryMessage = `${tier.min}+ km delivery`
              deliveryType = 'distance_flat'
              break
            } else if (distance >= tier.min && distance < tier.max) {
              deliveryFee = tier.fee
              deliveryMessage = `${tier.min}-${tier.max} km delivery`
              deliveryType = 'distance_tier'
              break
            }
          }
        } else {
          // Use state flat rate
          if (stateFlatRates[state] && stateFlatRates[state] > 0) {
            deliveryFee = stateFlatRates[state]
            deliveryMessage = `${state} delivery`
            deliveryType = 'state_flat'
          } else {
            // Use default fee for states without specific rates
            deliveryFee = defaultFee
            deliveryMessage = 'Standard delivery'
            deliveryType = 'default'
          }
        }

        console.log('Distance-based delivery fee calculation result:', {
          fee: deliveryFee,
          message: deliveryMessage,
          type: deliveryType,
          distance: distance.toFixed(2),
          inCoverageArea
        })

        return res.status(200).json({
          success: true,
          fee: deliveryFee,
          message: deliveryMessage,
          deliveryType,
          distance: parseFloat(distance.toFixed(2)),
          inCoverageArea
        })
      } else {
        // LEGACY ZONE-BASED SYSTEM
        console.log('Using LEGACY zone-based delivery system')
        
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

        // Legacy zone-based logic (simplified - you may need to restore original logic)
        let deliveryFee = defaultFee
        let deliveryMessage = 'Standard delivery'
        let deliveryType = 'default'

        // For now, use default fee - you can restore original zone logic here
        console.log('Legacy delivery fee calculation result:', {
          fee: deliveryFee,
          message: deliveryMessage,
          type: deliveryType
        })

        return res.status(200).json({
          success: true,
          fee: deliveryFee,
          message: deliveryMessage,
          deliveryType
        })
      }

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
