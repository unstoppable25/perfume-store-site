import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function Admin() {
  const [products, setProducts] = useState([])
  const [logo, setLogo] = useState(null)
  const [form, setForm] = useState({ name: '', price: '', description: '', image: '' })
  const [isEditing, setIsEditing] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)
  const [activeTab, setActiveTab] = useState('products')
  const [orders, setOrders] = useState([])
  const [messages, setMessages] = useState([])
  const [subscribers, setSubscribers] = useState([])
  const [users, setUsers] = useState([])
  const [resetPasswordUser, setResetPasswordUser] = useState(null)
  const [newPassword, setNewPassword] = useState('')
  const [shopBgImage, setShopBgImage] = useState('')
  const [aboutBgImage, setAboutBgImage] = useState('')
  const router = useRouter()

  useEffect(() => {
    // Check authentication
    const isAuth = sessionStorage.getItem('admin_gate_passed')
    if (isAuth !== 'true') {
      // Redirect to security gate
      router.push('/secure8893')
      return
    }
    setAuthenticated(true)
  }, [router])

  useEffect(() => {
    if (!authenticated) return

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

    // Load orders
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders')
        const data = await res.json()
        if (data.success) {
          setOrders(data.orders || [])
        }
      } catch (err) {
        console.error('Failed to fetch orders', err)
      }
    }
    fetchOrders()

    // Load messages
    const fetchMessages = async () => {
      try {
        const res = await fetch('/api/messages')
        const data = await res.json()
        if (data.success) {
          setMessages(data.messages || [])
        }
      } catch (err) {
        console.error('Failed to fetch messages', err)
      }
    }
    fetchMessages()

    // Load subscribers
    const fetchSubscribers = async () => {
      try {
        const res = await fetch('/api/subscribers')
        const data = await res.json()
        if (data.success) {
          setSubscribers(data.subscribers || [])
        }
      } catch (err) {
        console.error('Failed to fetch subscribers', err)
      }
    }
    fetchSubscribers()

    // Load users
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/users')
        const data = await res.json()
        if (data.success) {
          setUsers(data.users || [])
        }
      } catch (err) {
        console.error('Failed to fetch users', err)
      }
    }
    fetchUsers()

    const savedLogo = localStorage.getItem('scentlumus_logo')
    if (savedLogo) setLogo(savedLogo)
    
    const shopBg = localStorage.getItem('shop_button_bg')
    const aboutBg = localStorage.getItem('about_button_bg')
    if (shopBg) setShopBgImage(shopBg)
    if (aboutBg) setAboutBgImage(aboutBg)
  }, [authenticated])

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
          alert('Product updated successfully!')
        } else {
          const res = await fetch('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
          const created = await res.json()
          const newProducts = [...products, created]
          setProducts(newProducts)
          localStorage.setItem('scentlumus_products_backup', JSON.stringify(newProducts))
          alert('Product added successfully!')
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

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }

    try {
      const res = await fetch('/api/users/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })
      
      const data = await res.json()
      
      if (data.success) {
        setUsers((prev) => prev.filter((u) => u.id !== userId))
        alert('User deleted successfully')
      } else {
        alert('Failed to delete user: ' + data.message)
      }
    } catch (err) {
      console.error('Failed to delete user', err)
      alert('Failed to delete user')
    }
  }

  const handleResetPassword = async () => {
    if (!resetPasswordUser || !newPassword) {
      alert('Please enter a new password')
      return
    }

    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters')
      return
    }

    try {
      const res = await fetch('/api/users/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: resetPasswordUser.id, newPassword })
      })
      
      const data = await res.json()
      
      if (data.success) {
        alert('Password reset successfully')
        setResetPasswordUser(null)
        setNewPassword('')
      } else {
        alert('Failed to reset password: ' + data.message)
      }
    } catch (err) {
      console.error('Failed to reset password', err)
      alert('Failed to reset password')
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

  const handleShopBgUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = async () => {
        try {
          const base64 = reader.result
          const filename = `shop-bg-${Date.now()}-${file.name.replace(/\s+/g,'-')}`
          const res = await fetch('/api/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ filename, data: base64 }) })
          const data = await res.json()
          if (data.url) {
            setShopBgImage(data.url)
            localStorage.setItem('shop_button_bg', data.url)
            alert('Shop button background updated!')
          }
        } catch (err) {
          console.error('Shop background upload failed', err)
          alert('Upload failed')
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAboutBgUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = async () => {
        try {
          const base64 = reader.result
          const filename = `about-bg-${Date.now()}-${file.name.replace(/\s+/g,'-')}`
          const res = await fetch('/api/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ filename, data: base64 }) })
          const data = await res.json()
          if (data.url) {
            setAboutBgImage(data.url)
            localStorage.setItem('about_button_bg', data.url)
            alert('About button background updated!')
          }
        } catch (err) {
          console.error('About background upload failed', err)
          alert('Upload failed')
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem('admin_gate_passed')
    router.push('/')
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    const order = orders.find(o => o.id === orderId)
    const currentStatus = order?.status || 'Pending'
    
    // Prevent changing status if already in Processing or beyond (except to Cancelled)
    if (['Processing', 'Shipped', 'Delivered'].includes(currentStatus) && newStatus === 'Pending') {
      if (!confirm('Warning: This order is already in progress. Are you sure you want to move it back to Pending? This should only be done after contacting the customer.')) {
        return
      }
    }
    
    if (currentStatus === 'Processing' && newStatus !== 'Cancelled' && newStatus !== 'Shipped' && newStatus !== 'Processing') {
      alert('Orders in Processing can only be moved to Shipped or Cancelled. Contact the customer before making changes.')
      return
    }
    
    if (newStatus === 'Cancelled' && ['Processing', 'Shipped'].includes(currentStatus)) {
      if (!confirm('Warning: This order is already in progress. Cancelling may require refund processing. Have you contacted the customer?')) {
        return
      }
    }
    
    try {
      const res = await fetch('/api/orders/cancel', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus })
      })
      
      const data = await res.json()
      
      if (data.success) {
        setOrders(orders.map(o => o.id === orderId ? {...o, status: newStatus, updatedAt: new Date().toISOString()} : o))
        alert('Order status updated!')
      } else {
        alert('Failed to update order status: ' + data.message)
      }
    } catch (err) {
      console.error('Failed to update order status', err)
      alert('Failed to update order status')
    }
  }

  // Get unique customers from orders (filter out orders without customer object)
  const customers = [...new Map(
    orders
      .filter(o => o.customer && o.customer.email)
      .map(o => [o.customer.email, o.customer])
  ).values()]

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Verifying access...</p>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Admin — ScentLumus</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <button 
              onClick={handleLogout}
              className="text-red-600 hover:text-red-800 font-semibold"
            >
              Logout
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab('products')}
                className={`px-6 py-3 font-semibold ${activeTab === 'products' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-600'}`}
              >
                Products ({products.length})
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-6 py-3 font-semibold ${activeTab === 'orders' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-600'}`}
              >
                Orders ({orders.length})
              </button>
              <button
                onClick={() => setActiveTab('customers')}
                className={`px-6 py-3 font-semibold ${activeTab === 'customers' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-600'}`}
              >
                Customers ({customers.length})
              </button>
              <button
                onClick={() => setActiveTab('messages')}
                className={`px-6 py-3 font-semibold ${activeTab === 'messages' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-600'}`}
              >
                Messages ({messages.length})
              </button>
              <button
                onClick={() => setActiveTab('subscribers')}
                className={`px-6 py-3 font-semibold ${activeTab === 'subscribers' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-600'}`}
              >
                Subscribers ({subscribers.length})
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`px-6 py-3 font-semibold ${activeTab === 'users' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-600'}`}
              >
                Registered Users ({users.length})
              </button>
            </div>
          </div>

          {/* Products Tab */}
          {activeTab === 'products' && (
            <>
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

              {/* Home Page Button Backgrounds */}
              <div className="bg-white p-6 rounded-lg shadow mb-8">
                <h2 className="text-2xl font-semibold mb-4">Home Page Button Backgrounds</h2>
                <p className="text-sm text-gray-600 mb-6">Upload background images for the Shop and About buttons on the home page. Images will be dimmed with the button text visible on top.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Shop Button Background */}
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">Shop Button Background</h3>
                    <div className="border-2 border-dashed border-amber-300 rounded-lg p-4">
                      {shopBgImage ? (
                        <div className="space-y-3">
                          <div className="relative h-32 rounded overflow-hidden">
                            <img src={shopBgImage} alt="Shop Background" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black opacity-60"></div>
                            <div className="absolute inset-0 flex items-center justify-center text-white text-xl font-bold">
                              Shop
                            </div>
                          </div>
                          <label className="block w-full bg-amber-600 text-white text-center py-2 rounded cursor-pointer hover:bg-amber-700">
                            <input type="file" accept="image/*" onChange={handleShopBgUpload} className="hidden" />
                            Change Image
                          </label>
                        </div>
                      ) : (
                        <label className="block cursor-pointer hover:bg-amber-50 p-8 text-center">
                          <input type="file" accept="image/*" onChange={handleShopBgUpload} className="hidden" />
                          <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-sm text-gray-600">Click to upload Shop button background</p>
                        </label>
                      )}
                    </div>
                  </div>

                  {/* About Button Background */}
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">About Button Background</h3>
                    <div className="border-2 border-dashed border-amber-300 rounded-lg p-4">
                      {aboutBgImage ? (
                        <div className="space-y-3">
                          <div className="relative h-32 rounded overflow-hidden">
                            <img src={aboutBgImage} alt="About Background" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black opacity-60"></div>
                            <div className="absolute inset-0 flex items-center justify-center text-white text-xl font-bold">
                              About us
                            </div>
                          </div>
                          <label className="block w-full bg-amber-600 text-white text-center py-2 rounded cursor-pointer hover:bg-amber-700">
                            <input type="file" accept="image/*" onChange={handleAboutBgUpload} className="hidden" />
                            Change Image
                          </label>
                        </div>
                      ) : (
                        <label className="block cursor-pointer hover:bg-amber-50 p-8 text-center">
                          <input type="file" accept="image/*" onChange={handleAboutBgUpload} className="hidden" />
                          <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-sm text-gray-600">Click to upload About button background</p>
                        </label>
                      )}
                    </div>
                  </div>
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
                <label className="border p-2 rounded cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploading}
                    onChange={async (e) => {
                      const file = e.target.files[0]
                      if (!file) return
                      
                      setUploading(true)
                      
                      // Compress image before upload
                      const img = new Image()
                      img.onload = async () => {
                        try {
                          // Create canvas to resize image
                          const canvas = document.createElement('canvas')
                          let width = img.width
                          let height = img.height
                          
                          // Resize if too large (max 1200px on longest side)
                          const maxSize = 1200
                          if (width > maxSize || height > maxSize) {
                            if (width > height) {
                              height = (height / width) * maxSize
                              width = maxSize
                            } else {
                              width = (width / height) * maxSize
                              height = maxSize
                            }
                          }
                          
                          canvas.width = width
                          canvas.height = height
                          const ctx = canvas.getContext('2d')
                          ctx.drawImage(img, 0, 0, width, height)
                          
                          // Convert to base64 with compression
                          const base64 = canvas.toDataURL('image/jpeg', 0.8) // 80% quality
                          const filename = `product-${Date.now()}-${file.name.replace(/\s+/g,'-').replace(/\.[^.]+$/, '.jpg')}`
                          
                          console.log('Starting upload...', filename, 'Size:', Math.round(base64.length / 1024), 'KB')
                          const res = await fetch('/api/upload', { 
                            method: 'POST', 
                            headers: { 'Content-Type': 'application/json' }, 
                            body: JSON.stringify({ filename, data: base64 }) 
                          })
                          
                          if (!res.ok) {
                            throw new Error(`Upload failed: ${res.status} ${res.statusText}`)
                          }
                          
                          const data = await res.json()
                          console.log('Upload response:', data)
                          
                          if (data.url) {
                            setForm((f) => ({ ...f, image: data.url }))
                            alert('Image uploaded successfully!')
                          } else {
                            alert('Upload failed: ' + (data.message || 'Unknown error'))
                          }
                        } catch (err) {
                          console.error('Upload failed', err)
                          alert('Upload error: ' + err.message)
                        } finally {
                          setUploading(false)
                          e.target.value = ''
                        }
                      }
                      
                      img.onerror = () => {
                        alert('Failed to load image')
                        setUploading(false)
                      }
                      
                      // Read file as URL for Image object
                      const reader = new FileReader()
                      reader.onload = (ev) => { img.src = ev.target.result }
                      reader.onerror = () => {
                        alert('Failed to read file')
                        setUploading(false)
                      }
                      reader.readAsDataURL(file)
                    }}
                    className="hidden"
                  />
                  <span className="text-sm">
                    {uploading ? 'Uploading...' : 'Upload Image'}
                  </span>
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
          </>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-semibold mb-4">Orders ({orders.length})</h2>
              {orders.length === 0 ? (
                <p className="text-gray-500">No orders yet.</p>
              ) : (
                <div className="space-y-4">
                  {orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((order) => (
                    <div key={order.id} className="border p-4 rounded-lg bg-gray-50">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">Order #{order.id}</h3>
                          <p className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleString()}</p>
                          {order.updatedAt && order.updatedAt !== order.createdAt && (
                            <p className="text-xs text-gray-400">Updated: {new Date(order.updatedAt).toLocaleString()}</p>
                          )}
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <select
                            value={order.status || 'Pending'}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            className={`px-3 py-2 rounded-lg font-semibold border-2 cursor-pointer transition ${
                              order.status === 'Pending' ? 'bg-yellow-50 text-yellow-800 border-yellow-300' :
                              order.status === 'Processing' ? 'bg-blue-50 text-blue-800 border-blue-300' :
                              order.status === 'Shipped' ? 'bg-purple-50 text-purple-800 border-purple-300' :
                              order.status === 'Delivered' ? 'bg-green-50 text-green-800 border-green-300' :
                              'bg-red-50 text-red-800 border-red-300'
                            }`}
                          >
                            <option value="Pending">📋 Pending</option>
                            <option value="Processing">⚙️ Processing</option>
                            <option value="Shipped">🚚 Shipped</option>
                            <option value="Delivered">✅ Delivered</option>
                            <option value="Cancelled">❌ Cancelled</option>
                          </select>
                          {['Processing', 'Shipped', 'Delivered'].includes(order.status) && (
                            <span className="text-xs text-gray-500 italic">
                              🔒 Status locked - Contact customer first
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-700">Customer</p>
                          <p className="text-sm">{order.customer?.firstName || order.firstName || 'N/A'} {order.customer?.lastName || order.lastName || ''}</p>
                          <p className="text-sm text-gray-600">{order.customer?.email || order.email || 'N/A'}</p>
                          <p className="text-sm text-gray-600">{order.customer?.phone || order.phone || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-700">Shipping Address</p>
                          <p className="text-sm">{order.shipping?.address || order.address || 'N/A'}</p>
                          <p className="text-sm text-gray-600">{order.shipping?.city || order.city || 'N/A'}, {order.shipping?.state || order.state || 'N/A'} {order.shipping?.zipCode || order.zipCode || ''}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Items ({order.items.length})</p>
                        {order.items.map((item, idx) => (
                          <div key={idx} className="text-sm text-gray-600 flex justify-between">
                            <span>{item.name} x{item.quantity}</span>
                            <span>₦{(item.price * item.quantity).toLocaleString('en-NG')}</span>
                          </div>
                        ))}
                        <div className="mt-2 pt-2 border-t flex justify-between font-bold">
                          <span>Total</span>
                          <span className="text-purple-600">₦{parseFloat(order.total).toLocaleString('en-NG')}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">Payment: {order.paymentMethod}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Customers Tab */}
          {activeTab === 'customers' && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-semibold mb-4">Customers ({customers.length})</h2>
              {customers.length === 0 ? (
                <p className="text-gray-500">No customers yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Phone</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Orders</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map((customer, idx) => {
                        const customerOrders = orders.filter(o => (o.customer?.email || o.email) === customer.email)
                        return (
                          <tr key={idx} className="border-b">
                            <td className="px-4 py-3">{customer.firstName} {customer.lastName}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{customer.email}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{customer.phone}</td>
                            <td className="px-4 py-3 text-sm font-semibold">{customerOrders.length}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Messages Tab */}
          {activeTab === 'messages' && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-semibold mb-4">Contact Messages ({messages.length})</h2>
              {messages.length === 0 ? (
                <p className="text-gray-500">No messages yet.</p>
              ) : (
                <div className="space-y-4">
                  {messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((msg) => (
                    <div key={msg.id} className="border p-4 rounded-lg bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold">{msg.name}</h3>
                          <p className="text-sm text-gray-600">{msg.email}</p>
                        </div>
                        <p className="text-sm text-gray-500">{new Date(msg.createdAt).toLocaleString()}</p>
                      </div>
                      <p className="font-semibold text-sm text-gray-700 mb-1">Subject: {msg.subject}</p>
                      <p className="text-sm text-gray-600">{msg.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Subscribers Tab */}
          {activeTab === 'subscribers' && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-semibold mb-4">Newsletter Subscribers ({subscribers.length})</h2>
              {subscribers.length === 0 ? (
                <p className="text-gray-500">No subscribers yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Subscribed Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subscribers.sort((a, b) => new Date(b.subscribedAt) - new Date(a.subscribedAt)).map((sub, idx) => (
                        <tr key={idx} className="border-b">
                          <td className="px-4 py-3">{sub.email}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {new Date(sub.subscribedAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Registered Users Tab */}
          {activeTab === 'users' && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-semibold mb-4">Registered Users ({users.length})</h2>
              {users.length === 0 ? (
                <p className="text-gray-500">No registered users yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Phone</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Registered Date</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((user, idx) => (
                        <tr key={idx} className="border-b">
                          <td className="px-4 py-3">{user.firstName} {user.lastName}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{user.phone}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => setResetPasswordUser(user)}
                              className="text-blue-600 hover:text-blue-800 text-sm mr-3"
                            >
                              Reset Password
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Password Reset Modal */}
              {resetPasswordUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
                    <h3 className="text-xl font-semibold mb-4">Reset Password</h3>
                    <p className="text-gray-600 mb-4">
                      Reset password for: <strong>{resetPasswordUser.firstName} {resetPasswordUser.lastName}</strong> ({resetPasswordUser.email})
                    </p>
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">New Password</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password (min 6 characters)"
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => {
                          setResetPasswordUser(null)
                          setNewPassword('')
                        }}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleResetPassword}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Reset Password
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
