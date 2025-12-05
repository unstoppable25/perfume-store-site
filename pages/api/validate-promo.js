import { getSettings } from '../../lib/db'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { code, cartTotal } = req.body

      if (!code) {
        return res.status(400).json({ success: false, message: 'Promo code is required' })
      }

      // Get promo codes from settings
      const settings = await getSettings()
      console.log('Promo validation - raw promo_codes:', settings.promo_codes)
      
      let promoCodes = []
      try {
        if (settings.promo_codes) {
          if (Array.isArray(settings.promo_codes)) {
            promoCodes = settings.promo_codes
          } else if (typeof settings.promo_codes === 'string' && settings.promo_codes.trim()) {
            promoCodes = JSON.parse(settings.promo_codes)
          }
        }
      } catch (err) {
        console.error('Failed to parse promo codes in validation:', err)
        promoCodes = []
      }
      
      console.log('Promo validation - parsed promo codes:', promoCodes)

      if (promoCodes.length === 0) {
        return res.status(404).json({ success: false, message: 'No promo codes available' })
      }

      // Find the promo code (case-insensitive)
      const promo = promoCodes.find(p => p.code.toUpperCase() === code.toUpperCase())

      if (!promo) {
        return res.status(404).json({ success: false, message: 'Invalid promo code' })
      }

      // Check if promo is active
      if (!promo.active) {
        return res.status(400).json({ success: false, message: 'This promo code is no longer active' })
      }

      // Check if expired
      if (promo.expiryDate && new Date(promo.expiryDate) < new Date()) {
        return res.status(400).json({ success: false, message: 'This promo code has expired' })
      }

      // Check if max uses reached
      if (promo.maxUses && promo.usedCount >= promo.maxUses) {
        return res.status(400).json({ success: false, message: 'This promo code has reached its usage limit' })
      }

      // Check minimum order amount
      if (promo.minOrder && cartTotal < promo.minOrder) {
        return res.status(400).json({ 
          success: false, 
          message: `Minimum order of ₦${promo.minOrder.toLocaleString('en-NG')} required for this promo code` 
        })
      }

      // Calculate discount
      let discountAmount = 0
      if (promo.discountType === 'percentage') {
        discountAmount = (cartTotal * promo.discountValue) / 100
      } else {
        discountAmount = promo.discountValue
      }

      // Ensure discount doesn't exceed cart total
      discountAmount = Math.min(discountAmount, cartTotal)

      return res.status(200).json({
        success: true,
        promo: {
          code: promo.code,
          discountType: promo.discountType,
          discountValue: promo.discountValue,
          discountAmount: Math.round(discountAmount)
        },
        message: `Promo code applied! You saved ₦${Math.round(discountAmount).toLocaleString('en-NG')}`
      })

    } catch (err) {
      console.error('Error validating promo code:', err)
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to validate promo code'
      })
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' })
  }
}
