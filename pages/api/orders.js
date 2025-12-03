import { getAllOrders, updateOrderStatus } from '../../lib/db'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const orders = await getAllOrders()
      return res.status(200).json({ success: true, orders })
    } catch (err) {
      console.error('Get orders error:', err)
      return res.status(500).json({ success: false, message: 'Failed to fetch orders' })
    }
  }

  if (req.method === 'PUT') {
    try {
      const { orderId, status } = req.body

      if (!orderId || !status) {
        return res.status(400).json({ success: false, message: 'Missing orderId or status' })
      }

      await updateOrderStatus(orderId, status)
      return res.status(200).json({ success: true, message: 'Order status updated' })
    } catch (err) {
      console.error('Update order status error:', err)
      return res.status(500).json({ success: false, message: 'Failed to update order status' })
    }
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' })
}
