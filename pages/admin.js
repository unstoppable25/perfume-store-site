  // Parent/Child Category CRUD Handlers
  const handleAddParent = async () => {
    const name = newParent.trim();
    if (!name || categories.some(p => p.name === name)) return;
    const updated = [...categories, { name, children: [] }];
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'categories', value: updated })
      });
      const data = await res.json();
      if (data.success) {
        setCategories(updated);
        setNewParent('');
      } else {
        alert('Failed to add brand: ' + (data.error || data.message || 'Unknown error'));
      }
    } catch (err) {
      alert('Failed to add brand: ' + err.message);
    }
  };

  const handleEditParent = async (oldName, newName) => {
    const trimmed = newName.trim();
    if (!trimmed || trimmed === oldName) return;
    const updated = categories.map(p => p.name === oldName ? { ...p, name: trimmed } : p);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'categories', value: updated })
      });
      const data = await res.json();
      if (data.success) {
        setCategories(updated);
        setEditingParent(null);
        setEditParentName('');
      } else {
        alert('Failed to edit brand: ' + (data.error || data.message || 'Unknown error'));
      }
    } catch (err) {
      alert('Failed to edit brand: ' + err.message);
    }
  };

  const handleDeleteParent = async (name) => {
    if (!confirm(`Delete brand "${name}" and all its sub-categories?`)) return;
    const updated = categories.filter(p => p.name !== name);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'categories', value: updated })
      });
      const data = await res.json();
      if (data.success) {
        setCategories(updated);
      } else {
        alert('Failed to delete brand: ' + (data.error || data.message || 'Unknown error'));
      }
    } catch (err) {
      alert('Failed to delete brand: ' + err.message);
    }
  };

  const handleAddChild = async (parentName) => {
    const name = newChild.trim();
    if (!name) return;
    const updated = categories.map(p => p.name === parentName ? { ...p, children: [...p.children, name] } : p);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'categories', value: updated })
      });
      const data = await res.json();
      if (data.success) {
        setCategories(updated);
        setNewChild('');
      } else {
        alert('Failed to add sub-category: ' + (data.error || data.message || 'Unknown error'));
      }
    } catch (err) {
      alert('Failed to add sub-category: ' + err.message);
    }
  };

  const handleEditChild = async (parentName, oldChild, newChildName) => {
    const trimmed = newChildName.trim();
    if (!trimmed || trimmed === oldChild) return;
    const updated = categories.map(p => p.name === parentName ? { ...p, children: p.children.map(c => c === oldChild ? trimmed : c) } : p);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'categories', value: updated })
      });
      const data = await res.json();
      if (data.success) {
        setCategories(updated);
        setEditingChild({ parent: null, child: null });
        setEditChildName('');
      } else {
        alert('Failed to edit sub-category: ' + (data.error || data.message || 'Unknown error'));
      }
    } catch (err) {
      alert('Failed to edit sub-category: ' + err.message);
    }
  };

  const handleDeleteChild = async (parentName, childName) => {
    if (!confirm(`Delete sub-category "${childName}"?`)) return;
    const updated = categories.map(p => p.name === parentName ? { ...p, children: p.children.filter(c => c !== childName) } : p);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'categories', value: updated })
      });
      const data = await res.json();
      if (data.success) {
        setCategories(updated);
      } else {
        alert('Failed to delete sub-category: ' + (data.error || data.message || 'Unknown error'));
      }
    } catch (err) {
      alert('Failed to delete sub-category: ' + err.message);
    }
  };
import { useState, useEffect } from 'react'

// --- ReviewsAdmin Component ---
function ReviewsAdmin() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ rating: '', comment: '', featured: false, hidden: false, response: '' });
  useEffect(() => {
    fetch('/api/reviews')
      .then(res => res.json())
      .then(data => { setReviews(data.reviews || []); setLoading(false); });
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    await fetch('/api/reviews', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    setReviews(reviews.filter(r => r.id !== id));
  };
  const handleEdit = (review) => {
    setEditId(review.id);
    setEditForm({
      rating: review.rating,
      comment: review.comment,
      featured: !!review.featured,
      hidden: !!review.hidden,
      response: review.response || ''
    });
  };
  const handleSave = async (id) => {
    const res = await fetch('/api/reviews', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...editForm })
    });
    const data = await res.json();
    setReviews(reviews.map(r => r.id === id ? data.review : r));
    setEditId(null);
  };
  const handleCancel = () => setEditId(null);

  if (loading) return <div className="p-4 text-center text-gray-500">Loading reviews...</div>;
  if (reviews.length === 0) return <div className="p-4 text-center text-gray-500">No reviews yet.</div>;

  return (
    <div className="bg-white rounded-lg shadow p-2 sm:p-4 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Product Reviews</h2>
      <div className="space-y-3">
        {reviews.map((r) => (
          <div key={r.id} className="border rounded p-2 sm:p-4 flex flex-col sm:flex-row gap-2 sm:gap-4 items-start sm:items-center bg-gray-50">
            <div className="flex-1 w-full">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-sm">Product:</span>
                <span className="text-xs text-gray-700">{r.productId}</span>
                <span className="ml-2 text-yellow-500">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                {r.featured && <span className="ml-2 px-2 py-0.5 bg-amber-200 text-amber-800 rounded text-xs">Featured</span>}
                {r.hidden && <span className="ml-2 px-2 py-0.5 bg-gray-300 text-gray-700 rounded text-xs">Hidden</span>}
              </div>
              {editId === r.id ? (
                <div className="space-y-2">
                  <input type="number" min="1" max="5" value={editForm.rating} onChange={e => setEditForm(f => ({ ...f, rating: e.target.value }))} className="border p-2 rounded w-16" />
                  <textarea value={editForm.comment} onChange={e => setEditForm(f => ({ ...f, comment: e.target.value }))} className="border p-2 rounded w-full" rows={2} />
                  <div className="flex gap-2 flex-wrap">
                    <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={editForm.featured} onChange={e => setEditForm(f => ({ ...f, featured: e.target.checked }))} />Featured</label>
                    <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={editForm.hidden} onChange={e => setEditForm(f => ({ ...f, hidden: e.target.checked }))} />Hidden</label>
                  </div>
                  <input type="text" placeholder="Response (optional)" value={editForm.response} onChange={e => setEditForm(f => ({ ...f, response: e.target.value }))} className="border p-2 rounded w-full" />
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => handleSave(r.id)} className="bg-amber-700 text-white px-3 py-1 rounded text-xs">Save</button>
                    <button onClick={handleCancel} className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-xs">Cancel</button>
                  </div>
              ) : (
                <>
                  <div className="text-sm text-gray-800 mb-1">{r.comment}</div>
                  {r.response && <div className="text-xs text-purple-700 bg-purple-50 rounded px-2 py-1 mb-1">Admin Response: {r.response}</div>}
                  <div className="flex gap-2 flex-wrap mt-1">
                    <button onClick={() => handleEdit(r)} className="bg-amber-700 text-white px-3 py-1 rounded text-xs">Edit</button>
                    <button onClick={() => handleDelete(r.id)} className="bg-red-100 text-red-700 px-3 py-1 rounded text-xs">Delete</button>
                  </div>
                </>
              )}
              <div className="text-xs text-gray-500 mt-1">{new Date(r.createdAt).toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function Admin() {
  const [products, setProducts] = useState([])
  const [logo, setLogo] = useState(null)
  const [form, setForm] = useState({ name: '', price: '', oldPrice: '', description: '', image: '', categories: [] })
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
  const [editingUser, setEditingUser] = useState(null)
  const [userForm, setUserForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  })
  const [shopBgImage, setShopBgImage] = useState('')
  const [aboutBgImage, setAboutBgImage] = useState('')
  // Categories: [{ name: 'Brand1', children: ['SubCat1', 'SubCat2'] }, ...]
  const [categories, setCategories] = useState([])
  const [newParent, setNewParent] = useState('')
  const [editingParent, setEditingParent] = useState(null)
  const [editParentName, setEditParentName] = useState('')
  const [newChild, setNewChild] = useState('')
  const [editingChild, setEditingChild] = useState({ parent: null, child: null })
  const [editChildName, setEditChildName] = useState('')
  const [editingOrder, setEditingOrder] = useState(null)
  const [showAddOrder, setShowAddOrder] = useState(false)
  const [orderForm, setOrderForm] = useState({
    customerEmail: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    status: 'Pending',
    paymentMethod: 'Paystack',
    items: [],
    total: 0
  })
  const [orderItemForm, setOrderItemForm] = useState({ name: '', price: '', quantity: 1 })
  const [deliverySettings, setDeliverySettings] = useState({
    defaultFee: 2000,
    freeDeliveryThreshold: 0,
    selfPickupEnabled: false,
    zones: []
  })
  const [newZone, setNewZone] = useState({ name: '', fee: '', states: '' })
  const [editingZone, setEditingZone] = useState(null)
  const [promoCodes, setPromoCodes] = useState([])
  const [newPromo, setNewPromo] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    minOrder: '',
    maxUses: '',
    expiryDate: '',
    active: true
  })
  const [editingPromo, setEditingPromo] = useState(null)
  const [categoryFilter, setCategoryFilter] = useState('all')
  const router = useRouter()

  useEffect(() => {
    // Check authentication
    const isAuth = localStorage.getItem('admin_gate_passed')
    if (isAuth !== 'true') {
      // Redirect to security gate
      router.push('/secure8893')
      return
    }
    setAuthenticated(true)
    
    // Set active tab from URL hash
    const hash = window.location.hash.slice(1)
    if (hash && ['products', 'orders', 'customers', 'messages', 'subscribers', 'users', 'delivery', 'promotions'].includes(hash)) {
      setActiveTab(hash)
    }
  }, [router])

  useEffect(() => {
    if (!authenticated) return

    // Load products from server API
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products')
        const data = await res.json()
        
        // Always use server data, even if empty
        setProducts(data || [])
        
        // Update localStorage backup with server data
        if (data && data.length > 0) {
          localStorage.setItem('scentlumus_products_backup', JSON.stringify(data))
        } else {
          // Clear backup if server has no products
          localStorage.removeItem('scentlumus_products_backup')
        }
      } catch (err) {
        console.error('Failed to fetch products', err)
        // Only use backup if server is unreachable (network error)
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
    
    // Load button background images and categories from database
    const loadSettings = async () => {
      try {
        const res = await fetch('/api/settings')
        const data = await res.json()
        if (data.success && data.settings) {
          if (data.settings.shop_button_bg) setShopBgImage(data.settings.shop_button_bg)
          if (data.settings.about_button_bg) setAboutBgImage(data.settings.about_button_bg)
          if (data.settings.categories && Array.isArray(data.settings.categories)) {
            setCategories(data.settings.categories)
          }
          // Load delivery settings
          console.log('Raw delivery_zones from DB:', data.settings.delivery_zones)
          console.log('Raw promo_codes from DB:', data.settings.promo_codes)
          
          let parsedZones = []
          try {
            if (data.settings.delivery_zones) {
              const zonesValue = data.settings.delivery_zones
              // Check if it's already an array or needs parsing
              if (Array.isArray(zonesValue)) {
                parsedZones = zonesValue
              } else if (typeof zonesValue === 'string' && zonesValue.trim()) {
                parsedZones = JSON.parse(zonesValue)
              }
            }
          } catch (err) {
            console.error('Failed to parse delivery zones:', err, 'Value was:', data.settings.delivery_zones)
            parsedZones = []
          }
          
          const deliveryData = {
            defaultFee: data.settings.delivery_default_fee ? parseInt(data.settings.delivery_default_fee) : 2000,
            freeDeliveryThreshold: data.settings.delivery_free_threshold ? parseInt(data.settings.delivery_free_threshold) : 0,
            selfPickupEnabled: data.settings.self_pickup_enabled === 'true' || data.settings.self_pickup_enabled === true,
            zones: parsedZones
          }
          console.log('Loaded delivery settings:', deliveryData)
          setDeliverySettings(deliveryData)
          
          // Load promo codes
          let parsedPromos = []
          try {
            if (data.settings.promo_codes) {
              const promosValue = data.settings.promo_codes
              // Check if it's already an array or needs parsing
              if (Array.isArray(promosValue)) {
                parsedPromos = promosValue
              } else if (typeof promosValue === 'string' && promosValue.trim()) {
                parsedPromos = JSON.parse(promosValue)
              }
            }
          } catch (err) {
            console.error('Failed to parse promo codes:', err, 'Value was:', data.settings.promo_codes)
            parsedPromos = []
          }
          console.log('Loaded promo codes:', parsedPromos)
          setPromoCodes(parsedPromos)
        }
      } catch (err) {
        console.error('Failed to load settings:', err)
      }
    }
    loadSettings()
  }, [authenticated])

  const handleAddProduct = (e) => {
    e.preventDefault()
    ;(async () => {
      try {
        // Only allow children (sub-categories) in form.categories
        const allChildren = categories.flatMap(p => p.children);
        const filteredCategories = form.categories.filter(c => allChildren.includes(c));
        const payload = { ...form, categories: filteredCategories };
        if (isEditing !== null) {
          // update existing product
          payload.id = isEditing;
          const res = await fetch('/api/products', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
          const updated = await res.json();
          const newProducts = products.map((p) => (p.id === updated.id ? updated : p));
          setProducts(newProducts);
          localStorage.setItem('scentlumus_products_backup', JSON.stringify(newProducts));
          setIsEditing(null);
          alert('Product updated successfully!');
        } else {
          const res = await fetch('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
          const created = await res.json();
          const newProducts = [...products, created];
          setProducts(newProducts);
          localStorage.setItem('scentlumus_products_backup', JSON.stringify(newProducts));
          alert('Product added successfully!');
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
        setForm({ name: '', price: '', oldPrice: '', description: '', image: '', categories: [] })
      }
    })()
  }

  const handleEdit = (product) => {
    setForm({ 
      name: product.name, 
      price: product.price,
      oldPrice: product.oldPrice || '',
      description: product.description, 
      image: product.image,
      categories: product.categories || []
    })
    setIsEditing(product.id)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return
    }
    try {
      console.log('Deleting product with id:', id)
      const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      console.log('Delete response:', data)
      
      if (res.ok) {
        // Refetch products from server to ensure sync
        const fetchRes = await fetch('/api/products')
        const serverProducts = await fetchRes.json()
        setProducts(serverProducts)
        localStorage.setItem('scentlumus_products_backup', JSON.stringify(serverProducts))
        alert('Product deleted successfully')
      } else {
        alert('Failed to delete product: ' + (data.message || 'Unknown error'))
      }
    } catch (err) {
      console.error('Failed to delete', err)
      alert('Failed to delete product: ' + err.message)
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

  const handleEditUser = (user) => {
    setEditingUser(user.id)
    setUserForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || ''
    })
  }

  const handleUpdateUser = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/users/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: editingUser, ...userForm })
      })
      
      const data = await res.json()
      
      if (data.success) {
        setUsers(prev => prev.map(u => u.id === editingUser ? { ...u, ...userForm } : u))
        setEditingUser(null)
        setUserForm({ firstName: '', lastName: '', email: '', phone: '' })
        alert('User updated successfully')
      } else {
        alert('Failed to update user: ' + data.message)
      }
    } catch (err) {
      console.error('Failed to update user', err)
      alert('Failed to update user')
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

  const handleAddCategory = async () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      const updatedCategories = [...categories, newCategory.trim()]
      
      // Save to database first
      try {
        const res = await fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'categories', value: updatedCategories })
        })
        const data = await res.json()
        
        if (data.success) {
          setCategories(updatedCategories)
          setNewCategory('')
          // Category added successfully - no alert needed
        } else {
          console.error('Category save response:', data)
          alert('Failed to save category: ' + (data.error || data.message || 'Unknown error'))
        }
      } catch (err) {
        console.error('Failed to save category:', err)
        alert('Failed to save category: ' + err.message)
      }
    }
  }

  const handleDeleteCategory = async (categoryToDelete) => {
    if (confirm(`Are you sure you want to delete the category "${categoryToDelete}"?`)) {
      const updatedCategories = categories.filter(c => c !== categoryToDelete)
      
      // Save to database
      try {
        const res = await fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'categories', value: updatedCategories })
        })
        const data = await res.json()
        
        if (data.success) {
          setCategories(updatedCategories)
          alert('Category deleted successfully')
        } else {
          alert('Failed to delete category: ' + (data.error || data.message || 'Unknown error'))
        }
      } catch (err) {
        console.error('Failed to delete category:', err)
        alert('Failed to delete category: ' + err.message)
      }
    }
  }

  const handleEditCategory = async (oldName, newName) => {
    if (newName.trim() && newName !== oldName) {
      const trimmedNewName = newName.trim();
      const updatedCategories = categories.map(c => c === oldName ? trimmedNewName : c);

      // Update all products that reference the old category name
      const updatedProducts = products.map(product => {
        if (product.categories && product.categories.includes(oldName)) {
          return {
            ...product,
            categories: product.categories.map(cat => cat === oldName ? trimmedNewName : cat)
          };
        }
        return product;
      });

      try {
        // Save updated categories
        const res = await fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'categories', value: updatedCategories })
        });
        const data = await res.json();

        if (data.success) {
          setCategories(updatedCategories);
          setEditingCategory(null);
          setEditCategoryName('');

          // Save all updated products to server in one request
          try {
            const bulkRes = await fetch('/api/products/bulk-update', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ products: updatedProducts })
            });
            const bulkData = await bulkRes.json();
            setProducts(updatedProducts);
            localStorage.setItem('scentlumus_products_backup', JSON.stringify(updatedProducts));

            if (bulkRes.ok) {
              alert('Category and products updated successfully');
            } else {
              alert('Category updated, but some products failed to update.');
            }
          } catch (err) {
            // Category updated, but product update failed
            alert('Category updated, but failed to update products.');
          }
        } else {
          alert('Failed to update category: ' + (data.error || data.message || 'Unknown error'));
        }
      } catch (err) {
        console.error('Failed to update category:', err);
        alert('A network or server error occurred. Please try again.');
      }
    }
  }

  const handleMoveCategoryUp = async (index) => {
    if (index === 0) return
    const newCategories = [...categories]
    const temp = newCategories[index]
    newCategories[index] = newCategories[index - 1]
    newCategories[index - 1] = temp
    
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'categories', value: newCategories })
      })
      if (res.ok) {
        setCategories(newCategories)
      }
    } catch (err) {
      console.error('Failed to reorder category:', err)
    }
  }

  const handleMoveCategoryDown = async (index) => {
    if (index === categories.length - 1) return
    const newCategories = [...categories]
    const temp = newCategories[index]
    newCategories[index] = newCategories[index + 1]
    newCategories[index + 1] = temp
    
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'categories', value: newCategories })
      })
      if (res.ok) {
        setCategories(newCategories)
      }
    } catch (err) {
      console.error('Failed to reorder category:', err)
    }
  }

  const handleMoveProductUp = async (index) => {
    if (index === 0) return
    const filteredProducts = getFilteredProducts()
    const productToMove = filteredProducts[index]
    const productAbove = filteredProducts[index - 1]
    
    // Store category-specific order in the product
    const currentCategory = categoryFilter === 'all' ? null : categoryFilter
    
    if (!productToMove.categoryOrder) productToMove.categoryOrder = {}
    if (!productAbove.categoryOrder) productAbove.categoryOrder = {}
    
    if (currentCategory) {
      // Swap positions within this specific category
      const tempOrder = productToMove.categoryOrder[currentCategory] || index
      productToMove.categoryOrder[currentCategory] = productAbove.categoryOrder[currentCategory] || (index - 1)
      productAbove.categoryOrder[currentCategory] = tempOrder
    } else {
      // Global swap
      const temp = productToMove.order || index
      productToMove.order = productAbove.order || (index - 1)
      productAbove.order = temp
    }
    
    const newProducts = products.map(p => {
      if (p.id === productToMove.id) return productToMove
      if (p.id === productAbove.id) return productAbove
      return p
    })
    
    try {
      await fetch('/api/products/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: newProducts })
      })
      setProducts(newProducts)
    } catch (err) {
      console.error('Failed to reorder product:', err)
    }
  }

  const handleMoveProductDown = async (index) => {
    const filteredProducts = getFilteredProducts()
    if (index === filteredProducts.length - 1) return
    
    const productToMove = filteredProducts[index]
    const productBelow = filteredProducts[index + 1]
    
    // Store category-specific order in the product
    const currentCategory = categoryFilter === 'all' ? null : categoryFilter
    
    if (!productToMove.categoryOrder) productToMove.categoryOrder = {}
    if (!productBelow.categoryOrder) productBelow.categoryOrder = {}
    
    if (currentCategory) {
      // Swap positions within this specific category
      const tempOrder = productToMove.categoryOrder[currentCategory] || index
      productToMove.categoryOrder[currentCategory] = productBelow.categoryOrder[currentCategory] || (index + 1)
      productBelow.categoryOrder[currentCategory] = tempOrder
    } else {
      // Global swap
      const temp = productToMove.order || index
      productToMove.order = productBelow.order || (index + 1)
      productBelow.order = temp
    }
    
    const newProducts = products.map(p => {
      if (p.id === productToMove.id) return productToMove
      if (p.id === productBelow.id) return productBelow
      return p
    })
    
    try {
      await fetch('/api/products/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: newProducts })
      })
      setProducts(newProducts)
    } catch (err) {
      console.error('Failed to reorder product:', err)
    }
  }

  const getFilteredProducts = () => {
    let filtered = []
    
    if (categoryFilter === 'all') {
      filtered = products
    } else if (categoryFilter === 'uncategorized') {
      filtered = products.filter(p => !p.categories || p.categories.length === 0)
    } else {
      filtered = products.filter(p => p.categories && p.categories.includes(categoryFilter))
    }
    
    // Sort by category-specific order if filtering by category
    if (categoryFilter !== 'all' && categoryFilter !== 'uncategorized') {
      filtered.sort((a, b) => {
        const orderA = a.categoryOrder?.[categoryFilter] !== undefined ? a.categoryOrder[categoryFilter] : 999999
        const orderB = b.categoryOrder?.[categoryFilter] !== undefined ? b.categoryOrder[categoryFilter] : 999999
        return orderA - orderB
      })
    } else {
      // Sort by global order
      filtered.sort((a, b) => {
        const orderA = a.order !== undefined ? a.order : 999999
        const orderB = b.order !== undefined ? b.order : 999999
        return orderA - orderB
      })
    }
    
    return filtered
  }

  const handleShopBgUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = async () => {
        try {
          const base64 = reader.result
          const filename = `shop-bg-${Date.now()}-${file.name.replace(/\s+/g,'-')}`
          const uploadRes = await fetch('/api/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ filename, data: base64 }) })
          const uploadData = await uploadRes.json()
          if (uploadData.url) {
            setShopBgImage(uploadData.url)
            // Save to database
            const settingsRes = await fetch('/api/settings', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ key: 'shop_button_bg', value: uploadData.url })
            })
            const settingsData = await settingsRes.json()
            if (settingsData.success) {
              alert('Shop button background updated successfully!')
            } else {
              console.error('Settings save failed:', settingsData)
              const errorMsg = settingsData.error || settingsData.message || 'Unknown error'
              const details = settingsData.details || ''
              alert(`Image uploaded but failed to save settings.\n\nError: ${errorMsg}\n${details}`)
            }
          }
        } catch (err) {
          console.error('Shop background upload failed', err)
          alert('Upload failed: ' + err.message)
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
          const uploadRes = await fetch('/api/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ filename, data: base64 }) })
          const uploadData = await uploadRes.json()
          if (uploadData.url) {
            setAboutBgImage(uploadData.url)
            // Save to database
            const settingsRes = await fetch('/api/settings', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ key: 'about_button_bg', value: uploadData.url })
            })
            const settingsData = await settingsRes.json()
            if (settingsData.success) {
              alert('About button background updated successfully!')
            } else {
              console.error('Settings save failed:', settingsData)
              const errorMsg = settingsData.error || settingsData.message || 'Unknown error'
              const details = settingsData.details || ''
              alert(`Image uploaded but failed to save settings.\n\nError: ${errorMsg}\n${details}`)
            }
          }
        } catch (err) {
          console.error('About background upload failed', err)
          alert('Upload failed: ' + err.message)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_gate_passed')
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

  const handleDeleteOrder = async (orderId) => {
    if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      return
    }

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE'
      })

      const data = await res.json()

      if (data.success) {
        setOrders(orders.filter(o => o.id !== orderId))
        alert('Order deleted successfully!')
      } else {
        alert('Failed to delete order: ' + data.message)
      }
    } catch (err) {
      console.error('Failed to delete order', err)
      alert('Failed to delete order')
    }
  }

  const handleEditOrder = (order) => {
    setEditingOrder(order)
    setOrderForm({
      customerEmail: order.customerEmail || order.customer?.email || '',
      firstName: order.firstName || order.customer?.firstName || '',
      lastName: order.lastName || order.customer?.lastName || '',
      phone: order.phone || order.customer?.phone || '',
      address: order.address || order.shipping?.address || '',
      city: order.city || order.shipping?.city || '',
      state: order.state || order.shipping?.state || '',
      zipCode: order.zipCode || order.shipping?.zipCode || '',
      status: order.status || 'Pending',
      paymentMethod: order.paymentMethod || 'Paystack',
      items: order.items || [],
      total: order.total || 0
    })
  }

  const handleUpdateOrder = async (e) => {
    e.preventDefault()

    if (orderForm.items.length === 0) {
      alert('Please add at least one item to the order')
      return
    }

    try {
      const updates = {
        customerEmail: orderForm.customerEmail,
        customer: {
          firstName: orderForm.firstName,
          lastName: orderForm.lastName,
          email: orderForm.customerEmail,
          phone: orderForm.phone
        },
        shipping: {
          address: orderForm.address,
          city: orderForm.city,
          state: orderForm.state,
          zipCode: orderForm.zipCode
        },
        status: orderForm.status,
        paymentMethod: orderForm.paymentMethod,
        items: orderForm.items,
        total: orderForm.total
      }

      const res = await fetch(`/api/orders/${editingOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      const data = await res.json()

      if (data.success) {
        setOrders(orders.map(o => o.id === editingOrder.id ? data.order : o))
        setEditingOrder(null)
        resetOrderForm()
        alert('Order updated successfully!')
      } else {
        alert('Failed to update order: ' + data.message)
      }
    } catch (err) {
      console.error('Failed to update order', err)
      alert('Failed to update order')
    }
  }

  const handleCreateOrder = async (e) => {
    e.preventDefault()

    if (orderForm.items.length === 0) {
      alert('Please add at least one item to the order')
      return
    }

    try {
      const orderData = {
        id: 'ORD_' + Date.now(),
        customerEmail: orderForm.customerEmail,
        customer: {
          firstName: orderForm.firstName,
          lastName: orderForm.lastName,
          email: orderForm.customerEmail,
          phone: orderForm.phone
        },
        shipping: {
          address: orderForm.address,
          city: orderForm.city,
          state: orderForm.state,
          zipCode: orderForm.zipCode
        },
        status: orderForm.status,
        paymentMethod: orderForm.paymentMethod,
        items: orderForm.items,
        total: orderForm.total,
        createdAt: new Date().toISOString()
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })

      const data = await res.json()

      if (data.success) {
        setOrders([data.order, ...orders])
        setShowAddOrder(false)
        resetOrderForm()
        alert('Order created successfully!')
      } else {
        alert('Failed to create order: ' + data.message)
      }
    } catch (err) {
      console.error('Failed to create order', err)
      alert('Failed to create order')
    }
  }

  const resetOrderForm = () => {
    setOrderForm({
      customerEmail: '',
      firstName: '',
      lastName: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      status: 'Pending',
      paymentMethod: 'Paystack',
      items: [],
      total: 0
    })
    setOrderItemForm({ name: '', price: '', quantity: 1 })
  }

  const addOrderItem = () => {
    if (!orderItemForm.name || !orderItemForm.price) {
      alert('Please fill in item name and price')
      return
    }

    const newItem = {
      name: orderItemForm.name,
      price: parseFloat(orderItemForm.price),
      quantity: parseInt(orderItemForm.quantity)
    }

    const newItems = [...orderForm.items, newItem]
    const newTotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)

    setOrderForm({
      ...orderForm,
      items: newItems,
      total: newTotal
    })

    setOrderItemForm({ name: '', price: '', quantity: 1 })
  }

  const removeOrderItem = (index) => {
    const newItems = orderForm.items.filter((_, i) => i !== index)
    const newTotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)

    setOrderForm({
      ...orderForm,
      items: newItems,
      total: newTotal
    })
  }

  // Delivery Settings Functions
  const handleUpdateDeliverySettings = async () => {
    try {
      // Save default fee
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'delivery_default_fee', value: deliverySettings.defaultFee.toString() })
      })

      // Save free delivery threshold
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'delivery_free_threshold', value: deliverySettings.freeDeliveryThreshold.toString() })
      })

      // Save self pickup enabled
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'self_pickup_enabled', value: deliverySettings.selfPickupEnabled.toString() })
      })

      // Save zones
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'delivery_zones', value: JSON.stringify(deliverySettings.zones) })
      })

      alert('Delivery settings saved successfully!')
    } catch (err) {
      console.error('Failed to save delivery settings', err)
      alert('Failed to save delivery settings')
    }
  }

  const handleAddZone = async () => {
    if (!newZone.name || !newZone.fee) {
      alert('Please fill in zone name and delivery fee')
      return
    }

    const zone = {
      id: Date.now(),
      name: newZone.name,
      fee: parseInt(newZone.fee),
      states: newZone.states.split(',').map(s => s.trim()).filter(s => s)
    }

    const updatedSettings = {
      ...deliverySettings,
      zones: [...deliverySettings.zones, zone]
    }
    setDeliverySettings(updatedSettings)

    // Auto-save zones
    console.log('Saving zones:', updatedSettings.zones)
    const zonesString = JSON.stringify(updatedSettings.zones)
    console.log('Zones as JSON string:', zonesString)
    
    const response = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'delivery_zones', value: zonesString })
    })
    const result = await response.json()
    console.log('Save response:', result)

    setNewZone({ name: '', fee: '', states: '' })
    alert('Delivery zone added successfully!')
  }

  const handleEditZone = (zone) => {
    setEditingZone(zone.id)
    setNewZone({
      name: zone.name,
      fee: zone.fee.toString(),
      states: zone.states.join(', ')
    })
  }

  const handleUpdateZone = async () => {
    if (!newZone.name || !newZone.fee) {
      alert('Please fill in zone name and delivery fee')
      return
    }

    const updatedZones = deliverySettings.zones.map(zone => {
      if (zone.id === editingZone) {
        return {
          ...zone,
          name: newZone.name,
          fee: parseInt(newZone.fee),
          states: newZone.states.split(',').map(s => s.trim()).filter(s => s)
        }
      }
      return zone
    })

    setDeliverySettings({
      ...deliverySettings,
      zones: updatedZones
    })

    // Auto-save zones
    console.log('Updating zones:', updatedZones)
    const zonesString = JSON.stringify(updatedZones)
    
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'delivery_zones', value: zonesString })
    })

    setEditingZone(null)
    setNewZone({ name: '', fee: '', states: '' })
    alert('Delivery zone updated successfully!')
  }

  const handleDeleteZone = async (zoneId) => {
    if (confirm('Are you sure you want to delete this delivery zone?')) {
      const updatedZones = deliverySettings.zones.filter(zone => zone.id !== zoneId)
      setDeliverySettings({
        ...deliverySettings,
        zones: updatedZones
      })

      // Auto-save zones
      console.log('Deleting zone, remaining zones:', updatedZones)
      const zonesString = JSON.stringify(updatedZones)
      
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'delivery_zones', value: zonesString })
      })

      alert('Delivery zone deleted successfully!')
    }
  }

  const handleCancelZoneEdit = () => {
    setEditingZone(null)
    setNewZone({ name: '', fee: '', states: '' })
  }

  // Promo Code Functions
  const handleSavePromoCodes = async () => {
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'promo_codes', value: JSON.stringify(promoCodes) })
      })
      alert('Promo codes saved successfully!')
    } catch (err) {
      console.error('Failed to save promo codes', err)
      alert('Failed to save promo codes')
    }
  }

  const handleAddPromo = async () => {
    if (!newPromo.code || !newPromo.discountValue) {
      alert('Please fill in promo code and discount value')
      return
    }

    const promo = {
      id: Date.now(),
      code: newPromo.code.toUpperCase().trim(),
      discountType: newPromo.discountType,
      discountValue: parseFloat(newPromo.discountValue),
      minOrder: newPromo.minOrder ? parseFloat(newPromo.minOrder) : 0,
      maxUses: newPromo.maxUses ? parseInt(newPromo.maxUses) : null,
      usedCount: 0,
      expiryDate: newPromo.expiryDate || null,
      active: newPromo.active,
      createdAt: new Date().toISOString()
    }

    const updatedPromos = [...promoCodes, promo]
    setPromoCodes(updatedPromos)

    // Auto-save promo codes
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'promo_codes', value: JSON.stringify(updatedPromos) })
    })

    setNewPromo({
      code: '',
      discountType: 'percentage',
      discountValue: '',
      minOrder: '',
      maxUses: '',
      expiryDate: '',
      active: true
    })
    alert('Promo code added successfully!')
  }

  const handleEditPromo = (promo) => {
    setEditingPromo(promo.id)
    setNewPromo({
      code: promo.code,
      discountType: promo.discountType,
      discountValue: promo.discountValue.toString(),
      minOrder: promo.minOrder ? promo.minOrder.toString() : '',
      maxUses: promo.maxUses ? promo.maxUses.toString() : '',
      expiryDate: promo.expiryDate || '',
      active: promo.active
    })
  }

  const handleUpdatePromo = async () => {
    if (!newPromo.code || !newPromo.discountValue) {
      alert('Please fill in promo code and discount value')
      return
    }

    const updatedPromos = promoCodes.map(promo => {
      if (promo.id === editingPromo) {
        return {
          ...promo,
          code: newPromo.code.toUpperCase().trim(),
          discountType: newPromo.discountType,
          discountValue: parseFloat(newPromo.discountValue),
          minOrder: newPromo.minOrder ? parseFloat(newPromo.minOrder) : 0,
          maxUses: newPromo.maxUses ? parseInt(newPromo.maxUses) : null,
          expiryDate: newPromo.expiryDate || null,
          active: newPromo.active
        }
      }
      return promo
    })

    setPromoCodes(updatedPromos)

    // Auto-save promo codes
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'promo_codes', value: JSON.stringify(updatedPromos) })
    })

    setEditingPromo(null)
    setNewPromo({
      code: '',
      discountType: 'percentage',
      discountValue: '',
      minOrder: '',
      maxUses: '',
      expiryDate: '',
      active: true
    })
    alert('Promo code updated successfully!')
  }

  const handleDeletePromo = async (promoId) => {
    if (confirm('Are you sure you want to delete this promo code?')) {
      const updatedPromos = promoCodes.filter(promo => promo.id !== promoId)
      setPromoCodes(updatedPromos)

      // Auto-save promo codes
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'promo_codes', value: JSON.stringify(updatedPromos) })
      })

      alert('Promo code deleted successfully!')
    }
  }

  const handleTogglePromo = async (promoId) => {
    const updatedPromos = promoCodes.map(promo => {
      if (promo.id === promoId) {
        return { ...promo, active: !promo.active }
      }
      return promo
    })
    setPromoCodes(updatedPromos)

    // Auto-save promo codes
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'promo_codes', value: JSON.stringify(updatedPromos) })
    })
  }

  const handleCancelPromoEdit = () => {
    setEditingPromo(null)
    setNewPromo({
      code: '',
      discountType: 'percentage',
      discountValue: '',
      minOrder: '',
      maxUses: '',
      expiryDate: '',
      active: true
    })
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
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto">
          {/* Professional Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-b-lg shadow-lg mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-1">Admin Dashboard</h1>
                <p className="text-purple-100 text-sm">ScentLumus Management Portal</p>
              </div>
              <button 
                onClick={handleLogout}
                className="bg-white text-purple-600 px-6 py-2 rounded-lg font-semibold hover:bg-purple-50 transition flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow-md mb-6 overflow-x-auto">
            <div className="flex border-b min-w-max">
              <button
                onClick={() => { setActiveTab('products'); window.location.hash = 'products' }}
                className={`px-6 py-3 font-semibold ${activeTab === 'products' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-600'}`}
              >
                Products ({products.length})
              </button>
              <button
                onClick={() => { setActiveTab('orders'); window.location.hash = 'orders' }}
                className={`px-6 py-3 font-semibold ${activeTab === 'orders' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-600'}`}
              >
                Orders ({orders.length})
              </button>
              <button
                onClick={() => { setActiveTab('customers'); window.location.hash = 'customers' }}
                className={`px-6 py-3 font-semibold ${activeTab === 'customers' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-600'}`}
              >
                Customers ({customers.length})
              </button>
              <button
                onClick={() => { setActiveTab('messages'); window.location.hash = 'messages' }}
                className={`px-6 py-3 font-semibold ${activeTab === 'messages' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-600'}`}
              >
                Messages ({messages.length})
              </button>
              <button
                onClick={() => { setActiveTab('subscribers'); window.location.hash = 'subscribers' }}
                className={`px-6 py-3 font-semibold ${activeTab === 'subscribers' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-600'}`}
              >
                Subscribers ({subscribers.length})
              </button>
              <button
                onClick={() => { setActiveTab('users'); window.location.hash = 'users' }}
                className={`px-6 py-3 font-semibold ${activeTab === 'users' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-600'}`}
              >
                Registered Users ({users.length})
              </button>
              <button
                onClick={() => { setActiveTab('delivery'); window.location.hash = 'delivery' }}
                className={`px-6 py-3 font-semibold ${activeTab === 'delivery' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-600'}`}
              >
                Delivery Settings
              </button>
              <button
                onClick={() => { setActiveTab('reviews'); window.location.hash = 'reviews' }}
                className={`px-6 py-3 font-semibold ${activeTab === 'reviews' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-600'}`}
              >
                Reviews
              </button>
              <button
                onClick={() => { setActiveTab('promotions'); window.location.hash = 'promotions' }}
                className={`px-6 py-3 font-semibold ${activeTab === 'promotions' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-600'}`}
              >
                Promo Codes ({promoCodes.length})
              </button>
              {/* Reviews Tab */}
              {activeTab === 'reviews' && (
                <ReviewsAdmin />
              )}
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
                  placeholder="Price (NGN)"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="border p-3 rounded focus:outline-none focus:ring-2 focus:ring-amber-600"
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Old Price (Optional - for strike-through)"
                  value={form.oldPrice}
                  onChange={(e) => setForm({ ...form, oldPrice: e.target.value })}
                  className="border p-3 rounded focus:outline-none focus:ring-2 focus:ring-amber-600"
                />
                <div className="text-sm text-gray-500 flex items-center">
                  <span>💡 Add old price to show a strike-through discount</span>
                </div>
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

              {/* Categories Section */}
              <div className="border-t pt-4 mt-4">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">Product Categories</h3>
                <p className="text-sm text-gray-600 mb-3">Select one or more categories for this product</p>
                
                {categories.length === 0 ? (
                  <p className="text-sm text-gray-500 italic mb-4">No categories yet. Add your first category below.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
                    {categories.map((category) => (
                      <label
                        key={category}
                        className="flex items-center space-x-2 p-3 border rounded cursor-pointer hover:bg-amber-50 transition"
                      >
                        <input
                          type="checkbox"
                          checked={form.categories.includes(category)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setForm({ ...form, categories: [...form.categories, category] })
                            } else {
                              <div className="border-t pt-4 mt-4">
                                <h3 className="text-lg font-semibold mb-3 text-gray-800">Product Categories</h3>
                                <p className="text-sm text-gray-600 mb-3">Select one or more sub-categories for this product</p>
                                {categories.length === 0 ? (
                                  <p className="text-sm text-gray-500 italic mb-4">No parent categories yet. Add your first brand below.</p>
                                ) : (
                                  <div className="mb-4">
                                    {categories.map((parent, pIdx) => (
                                      <div key={parent.name} className="mb-2">
                                        <div className="font-semibold text-purple-700 mb-1">{parent.name}</div>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                          {parent.children.map((child) => (
                                            <label key={child} className="flex items-center space-x-2 p-2 border rounded cursor-pointer hover:bg-amber-50 transition">
                                              <input
                                                type="checkbox"
                                                checked={form.categories.includes(child)}
                                                onChange={(e) => {
                                                  if (e.target.checked) {
                                                    setForm({ ...form, categories: [...form.categories, child] })
                                                  } else {
                                                    setForm({ ...form, categories: form.categories.filter(c => c !== child) })
                                                  }
                                                }}
                                                className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                                              />
                                              <span className="text-sm flex-1">{child}</span>
                                            </label>
                                          ))}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {/* Add New Parent Category (Brand) */}
                                <div className="flex gap-2 mb-4">
                                  <input
                                    type="text"
                                    placeholder="Add new brand (parent category)"
                                    value={newParent}
                                    onChange={(e) => setNewParent(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddParent())}
                                    className="flex-1 border p-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
                                  />
                                  <button
                                    type="button"
                                    onClick={handleAddParent}
                                    className="px-4 py-2 bg-purple-700 text-white rounded hover:bg-purple-800 text-sm font-medium"
                                  >
                                    Add Brand
                                  </button>
                                </div>
                                {/* Manage Parent/Child Categories */}
                                {categories.length > 0 && (
                                  <div className="border-t pt-3">
                                    <h4 className="text-sm font-semibold mb-2 text-gray-700">Manage Brands & Sub-Categories</h4>
                                    <div className="space-y-4">
                                      {categories.map((parent, pIdx) => (
                                        <div key={parent.name} className="bg-gray-50 rounded p-3">
                                          <div className="flex items-center gap-2 mb-2">
                                            {editingParent === parent.name ? (
                                              <>
                                                <input
                                                  type="text"
                                                  value={editParentName}
                                                  onChange={(e) => setEditParentName(e.target.value)}
                                                  className="flex-1 border px-2 py-1 rounded text-sm"
                                                  autoFocus
                                                />
                                                <button type="button" onClick={() => handleEditParent(parent.name, editParentName)} className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700">Save</button>
                                                <button type="button" onClick={() => { setEditingParent(null); setEditParentName(''); }} className="px-3 py-1 bg-gray-400 text-white rounded text-xs hover:bg-gray-500">Cancel</button>
                                              </>
                                            ) : (
                                              <>
                                                <span className="flex-1 text-sm font-bold text-purple-700">{parent.name}</span>
                                                <button type="button" onClick={() => { setEditingParent(parent.name); setEditParentName(parent.name); }} className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">Edit</button>
                                                <button type="button" onClick={() => handleDeleteParent(parent.name)} className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700">Delete</button>
                                              </>
                                            )}
                                          </div>
                                          {/* Children (Sub-Categories) */}
                                          <div className="ml-4">
                                            <div className="flex gap-2 mb-2">
                                              <input
                                                type="text"
                                                placeholder="Add new sub-category"
                                                value={newChild}
                                                onChange={(e) => setNewChild(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddChild(parent.name))}
                                                className="flex-1 border p-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
                                              />
                                              <button type="button" onClick={() => handleAddChild(parent.name)} className="px-3 py-1 bg-amber-700 text-white rounded text-xs hover:bg-amber-800">Add Sub-Category</button>
                                            </div>
                                            <div className="space-y-1">
                                              {parent.children.map((child, cIdx) => (
                                                <div key={child} className="flex items-center gap-2 p-1">
                                                  {editingChild.parent === parent.name && editingChild.child === child ? (
                                                    <>
                                                      <input
                                                        type="text"
                                                        value={editChildName}
                                                        onChange={(e) => setEditChildName(e.target.value)}
                                                        className="flex-1 border px-2 py-1 rounded text-sm"
                                                        autoFocus
                                                      />
                                                      <button type="button" onClick={() => handleEditChild(parent.name, child, editChildName)} className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700">Save</button>
                                                      <button type="button" onClick={() => { setEditingChild({ parent: null, child: null }); setEditChildName(''); }} className="px-3 py-1 bg-gray-400 text-white rounded text-xs hover:bg-gray-500">Cancel</button>
                                                    </>
                                                  ) : (
                                                    <>
                                                      <span className="flex-1 text-sm">{child}</span>
                                                      <button type="button" onClick={() => { setEditingChild({ parent: parent.name, child }); setEditChildName(child); }} className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">Edit</button>
                                                      <button type="button" onClick={() => handleDeleteChild(parent.name, child)} className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700">Delete</button>
                                                    </>
                                                  )}
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {form.categories.length > 0 && (
                                  <div className="mt-3 text-sm text-gray-600">
                                    Selected: <span className="font-semibold text-amber-700">{form.categories.join(', ')}</span>
                                  </div>
                                )}
                              </div>
                <div>
                  <label className="border p-2 rounded cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploading}
                      onChange={async (e) => {
                        const file = e.target.files[0]
                        if (!file) return
                        setUploading(true)
                        // ...existing code...
                      }}
                      className="hidden"
                    />
                    <span className="text-sm">
                      {uploading ? 'Uploading...' : 'Upload Image'}
                    </span>
                  </label>
                  {form.image && <img src={form.image} alt="preview" className="h-12 w-12 object-cover rounded" />}
                  <div>
                    <div className="flex gap-2 mt-4">
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
                  </div>
                </div>
              </form>
          </div>

          {/* Product List */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Products ({products.length})</h2>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Filter by Category:</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Products</option>
                  <option value="uncategorized">Uncategorized</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
            {products.length === 0 ? (
              <p className="text-gray-500">No products yet. Add one above!</p>
            ) : getFilteredProducts().length === 0 ? (
              <p className="text-gray-500">No products in this category.</p>
            ) : (
              <div className="space-y-4">
                {getFilteredProducts().map((product, index) => (
                  <div key={product.id} className="border p-4 rounded-lg bg-gray-50">
                    <div className="flex gap-4">
                      <div className="flex flex-col gap-1 justify-center">
                        <button
                          onClick={() => handleMoveProductUp(index)}
                          disabled={index === 0}
                          className={`text-gray-600 hover:text-gray-900 p-1 ${index === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
                          title="Move up"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleMoveProductDown(index)}
                          disabled={index === getFilteredProducts().length - 1}
                          className={`text-gray-600 hover:text-gray-900 p-1 ${index === getFilteredProducts().length - 1 ? 'opacity-30 cursor-not-allowed' : ''}`}
                          title="Move down"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                      {product.image && <img src={product.image} alt={product.name} className="h-20 w-20 object-cover rounded" />}
                      <div className="flex-1">
                        <div className="flex items-start gap-2 mb-1">
                          <h3 className="font-semibold text-lg">{product.name}</h3>
                          {product.categories && product.categories.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {product.categories.map(cat => (
                                <span key={cat} className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                                  {cat}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                              Uncategorized
                            </span>
                          )}
                        </div>
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
                        <button
                          onClick={async () => {
                            const updated = { ...product, active: product.active === false ? true : false }
                            await fetch('/api/products', {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify(updated)
                            })
                            setProducts(products.map(p => p.id === product.id ? updated : p))
                          }}
                          className={product.active === false ? "bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500" : "bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"}
                        >
                          {product.active === false ? 'Enable' : 'Disable'}
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
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Orders ({orders.length})</h2>
                <button
                  onClick={() => {
                    resetOrderForm()
                    setShowAddOrder(true)
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  + Add New Order
                </button>
              </div>

              {/* Add/Edit Order Form */}
              {(showAddOrder || editingOrder) && (
                <div className="mb-6 bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
                  <h3 className="text-xl font-semibold mb-4">
                    {editingOrder ? 'Edit Order' : 'Create New Order'}
                  </h3>
                  <form onSubmit={editingOrder ? handleUpdateOrder : handleCreateOrder} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Customer Email *</label>
                        <input
                          type="email"
                          value={orderForm.customerEmail}
                          onChange={(e) => setOrderForm({...orderForm, customerEmail: e.target.value})}
                          className="w-full border px-3 py-2 rounded"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Phone *</label>
                        <input
                          type="tel"
                          value={orderForm.phone}
                          onChange={(e) => setOrderForm({...orderForm, phone: e.target.value})}
                          className="w-full border px-3 py-2 rounded"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">First Name *</label>
                        <input
                          type="text"
                          value={orderForm.firstName}
                          onChange={(e) => setOrderForm({...orderForm, firstName: e.target.value})}
                          className="w-full border px-3 py-2 rounded"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Last Name *</label>
                        <input
                          type="text"
                          value={orderForm.lastName}
                          onChange={(e) => setOrderForm({...orderForm, lastName: e.target.value})}
                          className="w-full border px-3 py-2 rounded"
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium mb-1">Address *</label>
                        <input
                          type="text"
                          value={orderForm.address}
                          onChange={(e) => setOrderForm({...orderForm, address: e.target.value})}
                          className="w-full border px-3 py-2 rounded"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">City *</label>
                        <input
                          type="text"
                          value={orderForm.city}
                          onChange={(e) => setOrderForm({...orderForm, city: e.target.value})}
                          className="w-full border px-3 py-2 rounded"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">State *</label>
                        <input
                          type="text"
                          value={orderForm.state}
                          onChange={(e) => setOrderForm({...orderForm, state: e.target.value})}
                          className="w-full border px-3 py-2 rounded"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Zip Code</label>
                        <input
                          type="text"
                          value={orderForm.zipCode}
                          onChange={(e) => setOrderForm({...orderForm, zipCode: e.target.value})}
                          className="w-full border px-3 py-2 rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Status</label>
                        <select
                          value={orderForm.status}
                          onChange={(e) => setOrderForm({...orderForm, status: e.target.value})}
                          className="w-full border px-3 py-2 rounded"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Payment Method</label>
                        <select
                          value={orderForm.paymentMethod}
                          onChange={(e) => setOrderForm({...orderForm, paymentMethod: e.target.value})}
                          className="w-full border px-3 py-2 rounded"
                        >
                          <option value="Paystack">Paystack</option>
                          <option value="Bank Transfer">Bank Transfer</option>
                          <option value="Cash on Delivery">Cash on Delivery</option>
                        </select>
                      </div>
                    </div>

                    {/* Items Section */}
                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-3">Order Items</h4>
                      
                      {/* Add Item Form */}
                      <div className="grid grid-cols-4 gap-2 mb-3">
                        <input
                          type="text"
                          placeholder="Product name"
                          value={orderItemForm.name}
                          onChange={(e) => setOrderItemForm({...orderItemForm, name: e.target.value})}
                          className="border px-3 py-2 rounded col-span-2"
                        />
                        <input
                          type="number"
                          placeholder="Price"
                          value={orderItemForm.price}
                          onChange={(e) => setOrderItemForm({...orderItemForm, price: e.target.value})}
                          className="border px-3 py-2 rounded"
                        />
                        <input
                          type="number"
                          placeholder="Qty"
                          min="1"
                          value={orderItemForm.quantity}
                          onChange={(e) => setOrderItemForm({...orderItemForm, quantity: e.target.value})}
                          className="border px-3 py-2 rounded"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={addOrderItem}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm mb-3"
                      >
                        + Add Item
                      </button>

                      {/* Items List */}
                      {orderForm.items.length > 0 && (
                        <div className="space-y-2">
                          {orderForm.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-white p-2 rounded border">
                              <span>{item.name} x{item.quantity}</span>
                              <span className="font-semibold">₦{(item.price * item.quantity).toLocaleString('en-NG')}</span>
                              <button
                                type="button"
                                onClick={() => removeOrderItem(idx)}
                                className="text-red-600 hover:text-red-800"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                          <div className="flex justify-between items-center font-bold text-lg pt-2 border-t">
                            <span>Total:</span>
                            <span className="text-purple-600">₦{orderForm.total.toLocaleString('en-NG')}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                      >
                        {editingOrder ? 'Update Order' : 'Create Order'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingOrder(null)
                          setShowAddOrder(false)
                          resetOrderForm()
                        }}
                        className="bg-gray-400 text-white px-6 py-2 rounded hover:bg-gray-500"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {orders.length === 0 ? (
                <p className="text-gray-500">No orders yet.</p>
              ) : (
                <div className="space-y-4">
                  {(() => {
                    const validOrders = orders.filter(order => order && order.id)
                    console.log('Total orders:', orders.length, 'Valid orders:', validOrders.length)
                    console.log('Orders data:', orders)
                    
                    if (validOrders.length === 0) {
                      return <p className="text-red-500">Orders exist but have no IDs. Please run the fix-orders script.</p>
                    }
                    
                    return validOrders
                      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                      .map((order) => (
                    <div key={order.id} className="border p-4 rounded-lg bg-gray-50">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">Order #{order.id.slice(0, 12)}</h3>
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
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditOrder(order)}
                              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteOrder(order.id)}
                              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
                            >
                              Delete
                            </button>
                          </div>
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
                  ))
                  })()}
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
              
              {/* Edit User Form */}
              {editingUser && (
                <div className="mb-6 bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
                  <h3 className="text-xl font-semibold mb-4">Edit User</h3>
                  <form onSubmit={handleUpdateUser} className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">First Name *</label>
                      <input
                        type="text"
                        value={userForm.firstName}
                        onChange={(e) => setUserForm({...userForm, firstName: e.target.value})}
                        className="w-full border px-3 py-2 rounded"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Last Name *</label>
                      <input
                        type="text"
                        value={userForm.lastName}
                        onChange={(e) => setUserForm({...userForm, lastName: e.target.value})}
                        className="w-full border px-3 py-2 rounded"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Email *</label>
                      <input
                        type="email"
                        value={userForm.email}
                        onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                        className="w-full border px-3 py-2 rounded"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Phone</label>
                      <input
                        type="tel"
                        value={userForm.phone}
                        onChange={(e) => setUserForm({...userForm, phone: e.target.value})}
                        className="w-full border px-3 py-2 rounded"
                      />
                    </div>
                    <div className="col-span-2 flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingUser(null)
                          setUserForm({ firstName: '', lastName: '', email: '', phone: '' })
                        }}
                        className="bg-gray-400 text-white px-6 py-2 rounded hover:bg-gray-500"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                      >
                        Update User
                      </button>
                    </div>
                  </form>
                </div>
              )}
              
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
                        <tr key={idx} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3">{user.firstName} {user.lastName}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{user.phone || 'N/A'}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditUser(user)}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => setResetPasswordUser(user)}
                                className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                              >
                                Reset Password
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                              >
                                Delete
                              </button>
                            </div>
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

          {/* Delivery Settings Tab */}
          {activeTab === 'delivery' && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-semibold mb-6">Delivery Settings</h2>

              {/* Default Delivery Fee */}
              <div className="mb-8 p-6 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Default Delivery Fee</h3>
                <div className="max-w-md">
                  <label className="block text-sm font-medium mb-2">Default Fee (NGN)</label>
                  <input
                    type="number"
                    value={deliverySettings.defaultFee}
                    onChange={async (e) => {
                      const newFee = parseInt(e.target.value) || 0
                      setDeliverySettings({ ...deliverySettings, defaultFee: newFee })
                      // Auto-save
                      await fetch('/api/settings', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ key: 'delivery_default_fee', value: newFee.toString() })
                      })
                      console.log('Default fee saved:', newFee)
                    }}
                    placeholder="2000"
                    className="w-full px-3 py-2 border rounded-lg mb-4"
                  />
                  <p className="text-sm text-gray-600 mb-2">This is the standard delivery fee applied to all orders unless a zone-specific fee applies.</p>
                </div>
              </div>

              {/* Free Delivery Threshold */}
              <div className="mb-8 p-6 bg-green-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Free Delivery Promotion</h3>
                <div className="max-w-md">
                  <label className="block text-sm font-medium mb-2">Free Delivery on Orders Above (NGN)</label>
                  <input
                    type="number"
                    value={deliverySettings.freeDeliveryThreshold}
                    onChange={async (e) => {
                      const newThreshold = parseInt(e.target.value) || 0
                      setDeliverySettings({ ...deliverySettings, freeDeliveryThreshold: newThreshold })
                      // Auto-save
                      await fetch('/api/settings', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ key: 'delivery_free_threshold', value: newThreshold.toString() })
                      })
                      console.log('Free delivery threshold saved:', newThreshold)
                    }}
                    placeholder="0 for no promotion"
                    className="w-full px-3 py-2 border rounded-lg mb-4"
                  />
                  <p className="text-sm text-gray-600">
                    {deliverySettings.freeDeliveryThreshold > 0 
                      ? `🎉 FREE DELIVERY on orders above ₦${deliverySettings.freeDeliveryThreshold.toLocaleString('en-NG')}`
                      : 'Set to 0 to disable free delivery promotion'
                    }
                  </p>
                </div>
              </div>

              {/* Self Pickup Option */}
              <div className="mb-8 p-6 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Self Pickup Option</h3>
                <div className="max-w-md">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={deliverySettings.selfPickupEnabled}
                      onChange={async (e) => {
                        const isEnabled = e.target.checked
                        setDeliverySettings({ ...deliverySettings, selfPickupEnabled: isEnabled })
                        // Auto-save
                        const response = await fetch('/api/settings', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ key: 'self_pickup_enabled', value: isEnabled.toString() })
                        })
                        const result = await response.json()
                        console.log('Self pickup saved:', isEnabled, 'Response:', result)
                        
                        // Verify it was saved
                        const verifyRes = await fetch('/api/settings')
                        const verifyData = await verifyRes.json()
                        console.log('Verification - self_pickup_enabled in DB:', verifyData.settings.self_pickup_enabled)
                        
                        alert(`Self-pickup ${isEnabled ? 'ENABLED' : 'DISABLED'} successfully!`)
                      }}
                      className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm font-medium">Enable Self-Pickup (Zero Delivery Fee)</span>
                  </label>
                  <p className="text-sm text-gray-600 mt-2">
                    {deliverySettings.selfPickupEnabled 
                      ? '✅ Customers can choose to pick up orders themselves for FREE'
                      : '❌ Self-pickup option is disabled'
                    }
                  </p>
                </div>
              </div>

              {/* Delivery Zones */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Delivery Zones</h3>
                <p className="text-sm text-gray-600 mb-4">Set custom delivery fees for specific locations or states</p>

                {/* Add/Edit Zone Form */}
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold mb-3">{editingZone ? 'Edit Zone' : 'Add New Zone'}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Zone Name</label>
                      <input
                        type="text"
                        value={newZone.name}
                        onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
                        placeholder="e.g., Lagos Island"
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Delivery Fee (NGN)</label>
                      <input
                        type="number"
                        value={newZone.fee}
                        onChange={(e) => setNewZone({ ...newZone, fee: e.target.value })}
                        placeholder="3000"
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">States/Cities (comma-separated)</label>
                      <input
                        type="text"
                        value={newZone.states}
                        onChange={(e) => setNewZone({ ...newZone, states: e.target.value })}
                        placeholder="Lagos, Abuja"
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    {editingZone ? (
                      <>
                        <button
                          onClick={handleUpdateZone}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Update Zone
                        </button>
                        <button
                          onClick={handleCancelZoneEdit}
                          className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={handleAddZone}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        + Add Zone
                      </button>
                    )}
                  </div>
                </div>

                {/* Zones List */}
                <div className="space-y-3">
                  {deliverySettings.zones.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No delivery zones added yet. Add zones to set custom fees for specific areas.</p>
                  ) : (
                    deliverySettings.zones.map(zone => (
                      <div key={zone.id} className="p-4 border rounded-lg bg-white hover:shadow-md transition">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg">{zone.name}</h4>
                            <p className="text-amber-700 font-bold">₦{zone.fee.toLocaleString('en-NG')} delivery</p>
                            {zone.states && zone.states.length > 0 && (
                              <p className="text-sm text-gray-600 mt-1">
                                Applies to: {zone.states.join(', ')}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditZone(zone)}
                              className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteZone(zone.id)}
                              className="px-3 py-1 text-red-600 hover:bg-red-50 rounded"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-6 border-t">
                <button
                  onClick={handleUpdateDeliverySettings}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold"
                >
                  💾 Save All Delivery Settings
                </button>
              </div>

              {/* Info Box */}
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">💡 How It Works:</h4>
                <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                  <li>Set a default delivery fee for all orders</li>
                  <li>Run promotions with free delivery above a certain amount</li>
                  <li>Enable self-pickup for customers to collect orders for free</li>
                  <li>Create zones for specific locations with custom fees</li>
                  <li>Zone fees override the default fee when the customer's state matches</li>
                  <li>Free delivery promotion applies to all zones when threshold is met</li>
                </ul>
              </div>
            </div>
          )}

          {/* Promotions Tab */}
          {activeTab === 'promotions' && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-semibold mb-6">Promo Codes & Discounts</h2>

              {/* Add/Edit Promo Form */}
              <div className="mb-8 p-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">{editingPromo ? 'Edit Promo Code' : 'Create New Promo Code'}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Promo Code *</label>
                    <input
                      type="text"
                      value={newPromo.code}
                      onChange={(e) => setNewPromo({ ...newPromo, code: e.target.value.toUpperCase() })}
                      placeholder="SAVE20"
                      className="w-full px-3 py-2 border rounded-lg uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Discount Type *</label>
                    <select
                      value={newPromo.discountType}
                      onChange={(e) => setNewPromo({ ...newPromo, discountType: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (₦)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Discount Value *</label>
                    <input
                      type="number"
                      value={newPromo.discountValue}
                      onChange={(e) => setNewPromo({ ...newPromo, discountValue: e.target.value })}
                      placeholder={newPromo.discountType === 'percentage' ? '20' : '5000'}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {newPromo.discountType === 'percentage' ? 'Enter percentage (e.g., 20 for 20%)' : 'Enter amount in Naira'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Minimum Order (NGN)</label>
                    <input
                      type="number"
                      value={newPromo.minOrder}
                      onChange={(e) => setNewPromo({ ...newPromo, minOrder: e.target.value })}
                      placeholder="0 for no minimum"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Max Uses</label>
                    <input
                      type="number"
                      value={newPromo.maxUses}
                      onChange={(e) => setNewPromo({ ...newPromo, maxUses: e.target.value })}
                      placeholder="Unlimited"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Expiry Date</label>
                    <input
                      type="date"
                      value={newPromo.expiryDate}
                      onChange={(e) => setNewPromo({ ...newPromo, expiryDate: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newPromo.active}
                      onChange={(e) => setNewPromo({ ...newPromo, active: e.target.checked })}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm font-medium">Active</span>
                  </label>
                  <div className="flex-1"></div>
                  {editingPromo ? (
                    <>
                      <button
                        onClick={handleUpdatePromo}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                      >
                        Update Promo
                      </button>
                      <button
                        onClick={handleCancelPromoEdit}
                        className="px-6 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 font-medium"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleAddPromo}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                    >
                      + Add Promo Code
                    </button>
                  )}
                </div>
              </div>

              {/* Promo Codes List */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Active & Inactive Promo Codes</h3>
                {promoCodes.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No promo codes yet. Create your first promo code above!</p>
                ) : (
                  <div className="space-y-3">
                    {promoCodes.map(promo => {
                      const isExpired = promo.expiryDate && new Date(promo.expiryDate) < new Date()
                      const isMaxedOut = promo.maxUses && promo.usedCount >= promo.maxUses
                      
                      return (
                        <div key={promo.id} className={`p-4 border-2 rounded-lg ${
                          !promo.active ? 'bg-gray-100 border-gray-300' :
                          isExpired || isMaxedOut ? 'bg-red-50 border-red-300' :
                          'bg-white border-green-300'
                        }`}>
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-2xl font-bold text-amber-700">{promo.code}</span>
                                {!promo.active && <span className="px-2 py-1 bg-gray-500 text-white text-xs rounded">DISABLED</span>}
                                {isExpired && <span className="px-2 py-1 bg-red-500 text-white text-xs rounded">EXPIRED</span>}
                                {isMaxedOut && <span className="px-2 py-1 bg-red-500 text-white text-xs rounded">MAX USES REACHED</span>}
                              </div>
                              <p className="text-lg font-semibold text-green-700">
                                {promo.discountType === 'percentage' 
                                  ? `${promo.discountValue}% OFF` 
                                  : `₦${promo.discountValue.toLocaleString('en-NG')} OFF`
                                }
                              </p>
                              <div className="text-sm text-gray-600 mt-2 space-y-1">
                                {promo.minOrder > 0 && <p>Min. order: ₦{promo.minOrder.toLocaleString('en-NG')}</p>}
                                {promo.maxUses && <p>Uses: {promo.usedCount || 0} / {promo.maxUses}</p>}
                                {promo.expiryDate && <p>Expires: {new Date(promo.expiryDate).toLocaleDateString()}</p>}
                                <p className="text-xs text-gray-400">Created: {new Date(promo.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div className="flex flex-col gap-2">
                              <button
                                onClick={() => handleTogglePromo(promo.id)}
                                className={`px-3 py-1 rounded text-sm font-medium ${
                                  promo.active 
                                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                                    : 'bg-green-200 text-green-800 hover:bg-green-300'
                                }`}
                              >
                                {promo.active ? 'Disable' : 'Enable'}
                              </button>
                              <button
                                onClick={() => handleEditPromo(promo)}
                                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeletePromo(promo.id)}
                                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-6 border-t">
                <button
                  onClick={handleSavePromoCodes}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold"
                >
                  💾 Save All Promo Codes
                </button>
              </div>

              {/* Info Box */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">💡 How Promo Codes Work:</h4>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li><strong>Percentage:</strong> Takes off a % of the cart total (e.g., 20% off)</li>
                  <li><strong>Fixed Amount:</strong> Deducts a specific amount (e.g., ₦5,000 off)</li>
                  <li><strong>Minimum Order:</strong> Code only works if cart meets minimum amount</li>
                  <li><strong>Max Uses:</strong> Limit how many times a code can be used (leave empty for unlimited)</li>
                  <li><strong>Expiry Date:</strong> Code becomes invalid after this date</li>
                  <li><strong>Active/Disabled:</strong> Toggle codes on/off without deleting them</li>
                  <li>Customers enter codes at checkout to get instant discounts!</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
