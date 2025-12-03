import { createOrder } from '../../lib/db'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  try {
    const { customer, shipping, items, total, paymentMethod } = req.body

    if (!customer || !shipping || !items || !total) {
      return res.status(400).json({ success: false, message: 'Missing required fields' })
    }

    const order = {
      id: 'ORD-' + Date.now(),
      customer,
      shipping,
      items,
      total,
      paymentMethod,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    await createOrder(order)

    // For Stripe payment, you would create a Stripe checkout session here
    // For now, we'll just return success
    if (paymentMethod === 'stripe') {
      // In production, create Stripe session:
      // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
      // const session = await stripe.checkout.sessions.create({...})
      // return res.status(200).json({ success: true, orderId: order.id, paymentUrl: session.url })
      
      // For now, simulate payment
      return res.status(200).json({ 
        success: true, 
        orderId: order.id,
        message: 'Order created successfully'
      })
    }

    return res.status(200).json({ 
      success: true, 
      orderId: order.id,
      message: 'Order created successfully'
    })

  } catch (err) {
    console.error('Create order error:', err)
    return res.status(500).json({ success: false, message: 'Failed to create order' })
  }
}
