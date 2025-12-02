import { useState, useEffect } from 'react'
import Head from 'next/head'

export default function Admin() {
  const [products, setProducts] = useState([])
  const [logo, setLogo] = useState(null)
  const [form, setForm] = useState({ name: '', price: '', description: '', image: '' })
  const [isEditing, setIsEditing] = useState(null)

  useEffect(() => {
    // Load products from server API
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products')
        const data = await res.json()
        setProducts(data)
        // Also save to localStorage as backup
        if (data && data.length > 0) {
          localStorage.setItem('scentlumus_products_backup', JSON.stringify(data))
        } else {
          // If server has no products, try localStorage backup
          const backup = localStorage.getItem('scentlumus_products_backup')
          if (backup) {
            setProducts(JSON.parse(backup))
          }
        }
      } catch (err) {
        console.error('Failed to fetch products', err)
        // Fallback to localStorage if API fails
        const backup = localStorage.getItem('scentlumus_products_backup')
        if (backup) {
          setProducts(JSON.parse(backup))
        }
      }
    }
    fetchProducts()

    const savedLogo = localStorage.getItem('scentlumus_logo')
    if (savedLogo) setLogo(savedLogo)
  }, [])

  const handleAddProduct = (e) => {
    e.preventDefault()
    ;(async () => {
      try {
        if (isEditing !== null) {
          // update existing product
          const payload = { id: isEditing, ...form }
          const res = await fetch('/api/products', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
          const updated = await res.json()
          const newProducts = products.map((p) => (p.id === updated.id ? updated : p))
          setProducts(newProducts)
          localStorage.setItem('scentlumus_products_backup', JSON.stringify(newProducts))
          setIsEditing(null)
        } else {
          const res = await fetch('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
          const created = await res.json()
          const newProducts = [...products, created]
          setProducts(newProducts)
          localStorage.setItem('scentlumus_products_backup', JSON.stringify(newProducts))
          alert('Product added successfully! Note: Using browser storage until database is connected.')
        }
      } catch (err) {
        console.error('Failed to save product', err)
        alert('Server save failed. Product saved in browser only.')
        // Save to localStorage even if server fails
        if (isEditing !== null) {
          const newProducts = products.map((p) => (p.id === isEditing ? { id: isEditing, ...form } : p))
          setProducts(newProducts)
          localStorage.setItem('scentlumus_products_backup', JSON.stringify(newProducts))
        } else {
          const newProduct = { id: Date.now().toString(), ...form }
          const newProducts = [...products, newProduct]
          setProducts(newProducts)
          localStorage.setItem('scentlumus_products_backup', JSON.stringify(newProducts))
        }
      } finally {
        setForm({ name: '', price: '', description: '', image: '' })
      }
    })()
  }

  const handleEdit = (product) => {
    setForm({ name: product.name, price: product.price, description: product.description, image: product.image })
    setIsEditing(product.id)
  }

  const handleDelete = async (id) => {
    try {
      await fetch(`/api/products?id=${id}`, { method: 'DELETE' })
      setProducts((prev) => prev.filter((p) => p.id !== id))
    } catch (err) {
      console.error('Failed to delete', err)
    }
  }

  const handleLogoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = async () => {
        try {
          const base64 = reader.result
          const filename = `logo-${Date.now()}-${file.name.replace(/\s+/g,'-')}`
          const res = await fetch('/api/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ filename, data: base64 }) })
          const data = await res.json()
          if (data.url) {
            setLogo(data.url)
            localStorage.setItem('scentlumus_logo', data.url)
          }
        } catch (err) {
          console.error('Logo upload failed', err)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <>
      <Head>
        <title>Admin — ScentLumus</title>
      </Head>
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <a href="/" className="text-amber-700 hover:text-amber-900">← Back to Store</a>
          </div>

          {/* Logo Upload */}
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h2 className="text-2xl font-semibold mb-4">Logo</h2>
            <div className="flex items-center gap-6">
              {logo && <img src={logo} alt="Logo" className="h-24 w-24 object-contain" />}
              <label className="border-2 border-dashed border-amber-300 p-4 rounded cursor-pointer hover:bg-amber-50">
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                <p className="text-sm text-gray-600">Click to upload logo</p>
              </label>
            </div>
          </div>

          {/* Add/Edit Product */}
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h2 className="text-2xl font-semibold mb-4">{isEditing !== null ? 'Edit' : 'Add'} Product</h2>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Product Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="border p-3 rounded focus:outline-none focus:ring-2 focus:ring-amber-600"
                  required
                />
                <input
                  type="number"
                  placeholder="Price (USD)"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="border p-3 rounded focus:outline-none focus:ring-2 focus:ring-amber-600"
                  required
                />
              </div>
              <textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-amber-600"
                rows="3"
              />
              <input
                type="text"
                placeholder="Image URL (paste link or upload)"
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
              <div className="flex items-center gap-4">
                <label className="border p-2 rounded cursor-pointer bg-gray-50">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files[0]
                      if (!file) return
                      const reader = new FileReader()
                      reader.onloadend = async () => {
                        try {
                          const base64 = reader.result
                          const filename = `product-${Date.now()}-${file.name.replace(/\s+/g,'-')}`
                          const res = await fetch('/api/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ filename, data: base64 }) })
                          const data = await res.json()
                          if (data.url) setForm((f) => ({ ...f, image: data.url }))
                        } catch (err) {
                          console.error('Upload failed', err)
                        }
                      }
                      reader.readAsDataURL(file)
                    }}
                    className="hidden"
                  />
                  <span className="text-sm">Upload Image</span>
                </label>
                {form.image && <img src={form.image} alt="preview" className="h-12 w-12 object-cover rounded" />}
              </div>
              <div className="flex gap-2">
                <button type="submit" className="bg-amber-700 text-white px-6 py-2 rounded hover:bg-amber-800">
                  {isEditing !== null ? 'Update' : 'Add'} Product
                </button>
                {isEditing !== null && (
                  <button
                    type="button"
                    onClick={() => { setIsEditing(null); setForm({ name: '', price: '', description: '', image: '' }) }}
                    className="bg-gray-400 text-white px-6 py-2 rounded hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Product List */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-4">Products ({products.length})</h2>
            {products.length === 0 ? (
              <p className="text-gray-500">No products yet. Add one above!</p>
            ) : (
              <div className="space-y-4">
                {products.map((product) => (
                  <div key={product.id} className="border p-4 rounded-lg bg-gray-50">
                    <div className="flex gap-4">
                      {product.image && <img src={product.image} alt={product.name} className="h-20 w-20 object-cover rounded" />}
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{product.name}</h3>
                        <p className="text-amber-700 font-bold">₦{parseFloat(product.price).toLocaleString('en-NG')}</p>
                        <p className="text-sm text-gray-600">{product.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
