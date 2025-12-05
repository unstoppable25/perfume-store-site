import { getOrderById } from '../../../lib/db'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  const { id } = req.query

  if (!id) {
    return res.status(400).json({ success: false, message: 'Order ID is required' })
  }

  try {
    const order = await getOrderById(id)
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' })
    }

    return res.status(200).json({ success: true, order })
  } catch (err) {
    console.error('Get order by ID error:', err)
    return res.status(500).json({ success: false, message: 'Failed to fetch order' })
  }
}
