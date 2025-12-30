import { updateProduct } from '../../../lib/db'

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    res.setHeader('Allow', ['PUT'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  const { products } = req.body || {}
  if (!Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ message: 'No products provided' })
  }

  const results = []
  for (const product of products) {
    if (!product.id) continue
    try {
      const updated = await updateProduct(product)
      results.push({ id: product.id, success: true, updated })
    } catch (err) {
      results.push({ id: product.id, success: false, error: err.message })
    }
  }
  return res.status(200).json({ updated: results })
}
