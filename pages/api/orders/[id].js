import { getOrderById, updateOrder, deleteOrder } from '../../../lib/db'

export default async function handler(req, res) {
  const { id } = req.query

  if (!id) {
    return res.status(400).json({ success: false, message: 'Order ID is required' })
  }

  // GET - Get single order
  if (req.method === 'GET') {
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

  // PUT - Update order
  if (req.method === 'PUT') {
    try {
      const updates = req.body
      const updatedOrder = await updateOrder(id, updates)
      
      if (!updatedOrder) {
        return res.status(404).json({ success: false, message: 'Order not found' })
      }
      
      return res.status(200).json({ success: true, order: updatedOrder, message: 'Order updated successfully' })
    } catch (err) {
      console.error('Update order error:', err)
      return res.status(500).json({ success: false, message: 'Failed to update order' })
    }
  }

  // DELETE - Delete order
  if (req.method === 'DELETE') {
    try {
      await deleteOrder(id)
      return res.status(200).json({ success: true, message: 'Order deleted successfully' })
    } catch (err) {
      console.error('Delete order error:', err)
      return res.status(500).json({ success: false, message: 'Failed to delete order' })
    }
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' })
}
