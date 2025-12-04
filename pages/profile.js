import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { useCart } from '../context/CartContext'

export default function Profile() {
  const router = useRouter()
  const { getCartCount } = useCart()
  const cartCount = getCartCount()
  const [user, setUser] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('orders') // Default to 'orders' tab
  const [editingUsername, setEditingUsername] = useState(false)
  const [username, setUsername] = useState('')

  useEffect(() => {
    const userAuth = sessionStorage.getItem('user_authenticated')
    const userData = sessionStorage.getItem('user_data')
    
    if (userAuth !== 'true' || !userData) {
      router.push('/signin?returnUrl=/profile')
      return
    }

    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)
    setUsername(parsedUser.username || parsedUser.firstName || 'User')
    fetchOrders(parsedUser.email)
  }, [router])

  const fetchOrders = async (email) => {
    try {
      const res = await fetch(`/api/orders?email=${email}`)
      if (res.ok) {
        const data = await res.json()
        setOrders(data.orders || [])
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem('user_authenticated')
    sessionStorage.removeItem('user_data')
    router.push('/')
  }

  const handleSaveUsername = () => {
    if (username.trim()) {
      const updatedUser = { ...user, username: username.trim() }
      setUser(updatedUser)
      sessionStorage.setItem('user_data', JSON.stringify(updatedUser))
      setEditingUsername(false)
      alert('Username updated successfully!')
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const statusColors = {
    Pending: 'bg-yellow-100 text-yellow-800',
    Processing: 'bg-blue-100 text-blue-800',
    Shipped: 'bg-purple-100 text-purple-800',
    Delivered: 'bg-green-100 text-green-800',
    Cancelled: 'bg-red-100 text-red-800'
  }

  return (
    <>
      <Head>
        <title>My Profile — ScentLumus</title>
      </Head>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <Link href="/" className="text-2xl font-bold text-amber-900">
                  SCENTLUMUS
                </Link>
                <p className="text-xs text-gray-500">destination for luxury fragrances</p>
              </div>
              <div className="flex items-center gap-4">
                <Link href="/" className="text-gray-700 hover:text-amber-900">Home</Link>
                <Link href="/shop" className="text-gray-700 hover:text-amber-900">Shop</Link>
                <Link href="/cart" className="relative text-gray-700 hover:text-amber-900">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-amber-700 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-amber-700 to-amber-900 rounded-lg shadow-lg p-8 mb-8 text-white">
            <div className="flex items-center gap-6">
              <div className="bg-white text-amber-900 rounded-full w-20 h-20 flex items-center justify-center text-3xl font-bold">
                {user.firstName?.[0]}{user.lastName?.[0]}
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  Hi, {username}
                </h1>
                <p className="text-amber-100">{user.email}</p>
                {user.phone && <p className="text-amber-100">{user.phone}</p>}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="border-b">
              <nav className="flex">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`px-6 py-4 font-semibold border-b-2 transition ${
                    activeTab === 'profile'
                      ? 'border-amber-700 text-amber-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Profile Information
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`px-6 py-4 font-semibold border-b-2 transition ${
                    activeTab === 'orders'
                      ? 'border-amber-700 text-amber-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  My Orders ({orders.length})
                </button>
              </nav>
            </div>

            <div className="p-8">
              {activeTab === 'profile' ? (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Personal Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                      {editingUsername ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            placeholder="Enter your username"
                          />
                          <button
                            onClick={handleSaveUsername}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setUsername(user.username || user.firstName || 'User')
                              setEditingUsername(false)
                            }}
                            className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900">
                            {username}
                          </div>
                          <button
                            onClick={() => setEditingUsername(true)}
                            className="px-4 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 font-medium"
                          >
                            Edit
                          </button>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                      <div className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900">
                        {user.firstName}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                      <div className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900">
                        {user.lastName}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <div className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900">
                        {user.email}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <div className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900">
                        {user.phone || 'Not provided'}
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Details</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600">Account Status</span>
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                          Active
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600">Total Orders</span>
                        <span className="font-semibold text-gray-900">{orders.length}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600">Member Since</span>
                        <span className="font-semibold text-gray-900">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Order History</h2>
                  
                  {loading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading orders...</p>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-12">
                      <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">No orders yet</h3>
                      <p className="text-gray-500 mb-6">Start shopping to see your orders here</p>
                      <Link href="/shop" className="inline-block bg-amber-700 text-white px-6 py-3 rounded-lg hover:bg-amber-800">
                        Start Shopping
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                Order #{order.id?.slice(0, 8)}
                              </h3>
                              <p className="text-sm text-gray-500">
                                Placed on {new Date(order.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                                {order.status || 'Pending'}
                              </span>
                              <p className="text-lg font-bold text-amber-900 mt-2">
                                ₦{parseFloat(order.total).toLocaleString('en-NG')}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2 mb-4">
                            {order.items?.map((item, idx) => (
                              <div key={idx} className="flex justify-between text-sm">
                                <span className="text-gray-700">
                                  {item.name} <span className="text-gray-500">x{item.quantity}</span>
                                </span>
                                <span className="text-gray-900 font-medium">
                                  ₦{(parseFloat(item.price) * item.quantity).toLocaleString('en-NG')}
                                </span>
                              </div>
                            ))}
                          </div>

                          <div className="flex gap-3 pt-4 border-t">
                            <Link
                              href={`/my-orders`}
                              className="flex-1 text-center bg-amber-700 text-white py-2 rounded-lg hover:bg-amber-800 transition text-sm font-medium"
                            >
                              View Details
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Logout Button at Bottom */}
          <div className="flex justify-center pb-8">
            <button
              onClick={handleLogout}
              className="bg-amber-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-amber-800 transition shadow-md"
            >
              Logout
            </button>
          </div>
        </main>
      </div>
    </>
  )
}
