import { deleteOrder } from '../../../lib/db'

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

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
}
