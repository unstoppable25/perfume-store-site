import { getAllOrders, updateOrderStatus, getOrderById, createOrder } from '../../lib/db'
import { sendOrderStatusUpdateEmail, sendOrderConfirmationEmail } from '../../lib/email'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { email } = req.query
      
      // Get all orders
      const allOrders = await getAllOrders()
      
      // If email is provided, filter orders for that user
      let orders = allOrders
      if (email) {
        orders = allOrders.filter(order => order.customerEmail === email)
      }
      
      return res.status(200).json({ success: true, orders })
    } catch (err) {
      console.error('Get orders error:', err)
      return res.status(500).json({ success: false, message: 'Failed to fetch orders' })
    }
  }

  if (req.method === 'POST') {
    try {
      const orderData = req.body

      if (!orderData.customerEmail || !orderData.items || orderData.items.length === 0) {
        return res.status(400).json({ success: false, message: 'Missing required order data' })
      }

      // Create order
      const newOrder = await createOrder(orderData)

      // Send confirmation email
      try {
        await sendOrderConfirmationEmail(newOrder)
      } catch (emailErr) {
        console.error('Failed to send order confirmation email:', emailErr)
      }

      return res.status(201).json({ success: true, order: newOrder, message: 'Order created successfully' })
    } catch (err) {
      console.error('Create order error:', err)
      return res.status(500).json({ success: false, message: 'Failed to create order' })
    }
  }

  if (req.method === 'PUT') {
    try {
      const { orderId, status } = req.body

      if (!orderId || !status) {
        return res.status(400).json({ success: false, message: 'Missing orderId or status' })
      }

      // Get current order to compare status
      const order = await getOrderById(orderId)
      const oldStatus = order?.status

      await updateOrderStatus(orderId, status)

      // Send status update email if status changed
      if (order && oldStatus !== status) {
        try {
          await sendOrderStatusUpdateEmail(order, oldStatus, status)
          console.log(`Status update email sent for order ${orderId}: ${oldStatus} → ${status}`)
        } catch (emailErr) {
          console.error('Failed to send status update email:', emailErr)
          // Don't fail the request if email fails
        }
      }

      return res.status(200).json({ success: true, message: 'Order status updated' })
    } catch (err) {
      console.error('Update order status error:', err)
      return res.status(500).json({ success: false, message: 'Failed to update order status' })
    }
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' })
}
