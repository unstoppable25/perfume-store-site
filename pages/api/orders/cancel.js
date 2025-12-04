import { deleteOrder, updateOrderStatus } from '../../../lib/db'

export default async function handler(req, res) {
  if (req.method === 'DELETE') {
    try {
      const { orderId } = req.body

      if (!orderId) {
        return res.status(400).json({ success: false, message: 'Order ID is required' })
      }

      const result = await deleteOrder(orderId)
      
      if (result.success) {
        return res.status(200).json(result)
      } else {
        return res.status(500).json(result)
      }

    } catch (err) {
      console.error('Cancel order error:', err)
      return res.status(500).json({ success: false, message: 'Failed to cancel order: ' + err.message })
    }
  } else if (req.method === 'PUT') {
    // Update order status
    try {
      const { orderId, status } = req.body
      
      if (!orderId || !status) {
        return res.status(400).json({ success: false, message: 'Order ID and status are required' })
      }

      const result = await updateOrderStatus(orderId, status)
      if (result) {
        return res.status(200).json({ success: true, order: result })
      } else {
        return res.status(404).json({ success: false, message: 'Order not found' })
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      return res.status(500).json({ success: false, message: 'Failed to update order status' })
    }
  } else {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }
}
