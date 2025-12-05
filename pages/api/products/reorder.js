import { initKV, kv } from '../../../lib/db'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { products } = req.body

    if (!Array.isArray(products)) {
      return res.status(400).json({ error: 'Products must be an array' })
    }

    // Initialize KV connection
    await initKV()

    // Update the products with new order
    if (kv) {
      await kv.set('products', products)
    }

    return res.status(200).json({ 
      success: true,
      message: 'Products reordered successfully' 
    })
  } catch (error) {
    console.error('Error reordering products:', error)
    return res.status(500).json({ error: 'Failed to reorder products' })
  }
}
