// Paystack webhook handler
import crypto from 'crypto'
import { createOrder } from '../../lib/db'
import { sendOrderConfirmationEmail } from '../../lib/email'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  // Verify the webhook signature
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
    .update(JSON.stringify(req.body))
    .digest('hex')

  if (hash !== req.headers['x-paystack-signature']) {
    console.error('Invalid webhook signature')
    return res.status(400).json({ message: 'Invalid signature' })
  }

  const event = req.body

  console.log('Paystack webhook event:', event.event)

  // Handle successful payment
  if (event.event === 'charge.success') {
    const { reference, amount, customer, metadata } = event.data

    try {
      // Create order in database
      const order = {
        id: reference,
        customer: {
          email: customer.email,
          firstName: metadata.customer?.firstName || '',
          lastName: metadata.customer?.lastName || '',
          phone: metadata.customer?.phone || ''
        },
        shipping: {
          address: metadata.shipping?.address || '',
          city: metadata.shipping?.city || '',
          state: metadata.shipping?.state || '',
          zipCode: metadata.shipping?.zipCode || ''
        },
        items: metadata.cart || [],
        total: amount / 100, // Convert from kobo to naira
        status: 'Processing',
        paymentMethod: 'Paystack',
        paymentReference: reference,
        createdAt: new Date().toISOString()
      }

      await createOrder(order)
      console.log('Order created successfully:', reference)

      // Send order confirmation email
      try {
        await sendOrderConfirmationEmail(order)
        console.log('Order confirmation email sent to:', customer.email)
      } catch (emailErr) {
        console.error('Failed to send order confirmation email:', emailErr)
        // Don't fail the webhook if email fails
      }

      return res.status(200).json({ message: 'Webhook processed successfully' })
    } catch (err) {
      console.error('Error creating order:', err)
      return res.status(500).json({ message: 'Error processing webhook' })
    }
  }

  // Acknowledge other events
  res.status(200).json({ message: 'Event received' })
}
