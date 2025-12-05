import { getAllOrders } from '../../lib/db'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // Import KV client
      const { kv } = await import('@vercel/kv')
      
      // Get all orders
      const orders = await getAllOrders()
      
      let fixedCount = 0
      const fixedOrders = orders.map(order => {
        // Add ID if missing
        if (!order.id) {
          order.id = 'order_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
          fixedCount++
        }
        return order
      })
      
      // Save back to database
      await kv.set('orders', fixedOrders)
      
      console.log(`Fixed ${fixedCount} orders without IDs`)
      
      res.status(200).json({ 
        success: true, 
        message: `Fixed ${fixedCount} orders. Total orders: ${fixedOrders.length}`,
        fixedCount,
        totalOrders: fixedOrders.length
      })
    } catch (err) {
      console.error('Failed to fix orders:', err)
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fix orders', 
        error: err.message 
      })
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}
