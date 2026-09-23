export async function sendOrderDiscordNotification(order) {
  const webhookUrl = process.env.DISCORD_ORDER_WEBHOOK_URL

  if (!webhookUrl) {
    console.log('Discord notification skipped: webhook not configured')
    return { success: false, message: 'Discord webhook not configured' }
  }

  const customer = order.customer || {}
  const shipping = order.shipping || {}
  const items = Array.isArray(order.items) ? order.items : []
  const itemSummary = items
    .map(item => `${item.name || 'Item'} x${item.quantity || 1}`)
    .join('\n')
    .slice(0, 1024) || 'No item details'

  const location = [shipping.address, shipping.city, shipping.state]
    .filter(Boolean)
    .join(', ') || 'Not provided'

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'ScentLumus Orders',
        embeds: [{
          title: 'New customer order',
          color: 0xb45309,
          fields: [
            { name: 'Order ID', value: String(order.id || 'Unknown'), inline: true },
            { name: 'Total', value: `NGN ${Number(order.total || 0).toLocaleString('en-NG')}`, inline: true },
            { name: 'Payment', value: String(order.paymentMethod || 'Not provided'), inline: true },
            { name: 'Customer', value: `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Not provided', inline: true },
            { name: 'Phone', value: String(customer.phone || 'Not provided'), inline: true },
            { name: 'Email', value: String(customer.email || 'Not provided'), inline: true },
            { name: 'Items', value: itemSummary },
            { name: 'Delivery address', value: location }
          ],
          timestamp: order.createdAt || new Date().toISOString(),
          footer: { text: 'ScentLumus order notification' }
        }]
      })
    })

    if (!response.ok) {
      throw new Error(`Discord webhook returned ${response.status}`)
    }

    return { success: true }
  } catch (error) {
    console.error('Failed to send Discord order notification:', error.message)
    return { success: false, message: error.message }
  }
}
