import { getSettings } from '../../lib/db'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { code, cartTotal, userId, userEmail } = req.body

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

      // Check if promo requires login
      if (promo.requiresLogin && !userId && !userEmail) {
        return res.status(400).json({ success: false, message: 'This promo code requires you to be logged in' })
      }

      // Check per user limit
      if (promo.perUserLimit && (userId || userEmail)) {
        const userKey = userId || userEmail
        const userUsage = promo.userUsages?.[userKey] || 0
        if (userUsage >= promo.perUserLimit) {
          return res.status(400).json({ success: false, message: `You have already used this promo code ${promo.perUserLimit} time(s)` })
        }
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
          discountAmount: Math.round(discountAmount),
          requiresLogin: promo.requiresLogin,
          canCombine: promo.canCombine,
          perUserLimit: promo.perUserLimit
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
