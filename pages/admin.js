  // Parent/Child Category CRUD Handlers
  const handleAddParent = async () => {
    const name = newParent.trim();
    if (!name || categories.some(p => p.name === name)) return;
    const updated = [...categories, { name, children: [] }];
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

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

function Admin() {
  // ...move all your existing code here (all hooks, handlers, logic, and return statement)...
  // Parent/Child Category CRUD Handlers
  const handleAddParent = async () => {
    const name = newParent.trim();
    if (!name || categories.some(p => p.name === name)) return;
    const updated = [...categories, { name, children: [] }];
  };
  // ...existing code...
}

export default Admin;
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
    );
  }

  // Main admin page return
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
        </div>
      </main>
    </>
  );
}
