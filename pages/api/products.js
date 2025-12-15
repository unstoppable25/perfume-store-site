import { getAllProducts, createProduct, updateProduct, deleteProduct } from '../../lib/db'

export default async function handler(req, res) {
  const { method } = req

  if (method === 'GET') {
    const products = await getAllProducts()
    return res.status(200).json(products)
  }

  if (method === 'POST') {
    const { name, price, oldPrice, description, image, categories, active } = req.body || {}
    if (!name || !price) return res.status(400).json({ message: 'Name and price are required' })
    const newProduct = { 
      id: Date.now().toString(), 
      name, 
      price: String(price),
      oldPrice: oldPrice ? String(oldPrice) : '',
      description: description || '', 
      image: image || '',
      categories: categories || [],
      active: active !== false // default to true
    }
    const created = await createProduct(newProduct)
    return res.status(201).json(created)
  }

  if (method === 'PUT') {
    const { id, name, price, oldPrice, description, image, categories, active } = req.body || {}
    if (!id) return res.status(400).json({ message: 'Product id is required' })
    const updated = await updateProduct({ 
      id, 
      name, 
      price: String(price),
      oldPrice: oldPrice ? String(oldPrice) : '',
      description: description || '', 
      image: image || '',
      categories: categories || [],
      active: active !== false
    })
    return res.status(200).json(updated)
  }

  if (method === 'DELETE') {
    const { id } = req.query || {}
    if (!id) return res.status(400).json({ message: 'Product id is required (query string)' })
    await deleteProduct(id)
    return res.status(200).json({ message: 'Deleted' })
  }

  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
  res.status(405).end(`Method ${method} Not Allowed`)
}
