import { deleteOrder, updateOrderStatus, getOrderById } from '../../../lib/db'
import { sendOrderStatusUpdateEmail } from '../../../lib/email'

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

      // Get the current order to know the old status
      const currentOrder = await getOrderById(orderId)
      const oldStatus = currentOrder ? currentOrder.status : 'Unknown'
      
      const result = await updateOrderStatus(orderId, status)
      if (result) {
        // Send email notification for status changes to Delivered or Cancelled
        if ((status === 'Delivered' || status === 'Cancelled') && oldStatus !== status) {
          try {
            await sendOrderStatusUpdateEmail(result, oldStatus, status)
            console.log(`Email sent for order ${orderId} status change: ${oldStatus} -> ${status}`)
          } catch (emailErr) {
            console.error('Failed to send status update email:', emailErr)
            // Don't fail the request if email fails
          }
        }
        
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
