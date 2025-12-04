import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'

export default function MyOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState('')
  const [logo, setLogo] = useState(null)
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated
    const isAuthenticated = sessionStorage.getItem('user_authenticated')
    const userData = sessionStorage.getItem('user_data')
    
    if (isAuthenticated !== 'true') {
      router.push('/signin?returnUrl=/my-orders')
      return
    }

    if (userData) {
      const user = JSON.parse(userData)
      setUserEmail(user.email)
      fetchUserOrders(user.email)
    }

    const savedLogo = localStorage.getItem('scentlumus_logo')
    if (savedLogo) setLogo(savedLogo)
  }, [router])

  const fetchUserOrders = async (email) => {
    try {
      const res = await fetch('/api/orders')
      const data = await res.json()
      // Filter orders by user email
      const userOrders = data.filter(order => order.email === email)
      setOrders(userOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
    } catch (err) {
      console.error('Failed to fetch orders:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelOrder = async (orderId) => {
    const order = orders.find(o => o.id === orderId)
    
    // Check if order is already in processing or beyond
    if (order && ['Processing', 'Shipped', 'Delivered'].includes(order.status)) {
      alert('This order is already being processed and cannot be cancelled. Please contact us for assistance.')
      return
    }
    
    if (!confirm('Are you sure you want to cancel this order?')) {
      return
    }

    try {
      const res = await fetch('/api/orders/cancel', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      })

      const data = await res.json()

      if (data.success) {
        alert('Order cancelled successfully')
        setOrders(orders.filter(o => o.id !== orderId))
      } else {
        alert('Failed to cancel order: ' + data.message)
      }
    } catch (err) {
      console.error('Failed to cancel order:', err)
      alert('Failed to cancel order')
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem('user_authenticated')
    sessionStorage.removeItem('user_data')
    router.push('/signin')
  }

  return (
    <>
      <Head>
        <title>My Orders - ScentLumus</title>
      </Head>

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-3">
            {logo ? (
              <img src={logo} alt="ScentLumus" className="h-10" />
            ) : (
              <div className="text-2xl font-bold text-purple-600">ScentLumus</div>
            )}
          </Link>
          <nav className="hidden md:flex space-x-6">
            <Link href="/" className="text-gray-700 hover:text-purple-600">Home</Link>
            <Link href="/my-orders" className="text-purple-600 font-semibold">My Orders</Link>
            <Link href="/contact" className="text-gray-700 hover:text-purple-600">Contact</Link>
            </nav>
            <div className="flex gap-4 mt-4">
            <Link href="/cart" className="text-gray-700 hover:text-amber-900">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-600 hover:text-amber-900"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">My Orders</h1>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">No orders yet</h2>
              <p className="text-gray-500 mb-6">Start shopping to see your orders here</p>
              <Link href="/" className="inline-block bg-amber-700 text-white px-6 py-3 rounded-lg hover:bg-amber-800">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">Order #{order.id}</h3>
                      <p className="text-sm text-gray-500">
                        Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      {order.updatedAt && order.updatedAt !== order.createdAt && (
                        <p className="text-xs text-gray-400">
                          Last updated: {new Date(order.updatedAt).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      )}
                    </div>
                    <div className="mt-4 md:mt-0 flex items-center space-x-4">
                      <span className="text-lg font-bold text-purple-600">
                        NGN {order.total?.toLocaleString() || '0'}
                      </span>
                      {order.status === 'Pending' && (
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 text-sm"
                        >
                          Cancel Order
                        </button>
                      )}
                      {['Processing', 'Shipped'].includes(order.status) && (
                        <div className="text-sm text-gray-600 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
                          <span className="block font-semibold">Need to make changes?</span>
                          <Link href="/contact" className="text-blue-600 hover:text-blue-800 underline">
                            Contact us
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Status Tracker */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-gray-700 mb-3">Order Status</h4>
                    <div className="flex items-center justify-between relative">
                      {/* Progress Line */}
                      <div className="absolute top-5 left-0 right-0 h-1 bg-gray-300" style={{ zIndex: 0 }}>
                        <div 
                          className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-500"
                          style={{
                            width: 
                              order.status === 'Pending' ? '0%' :
                              order.status === 'Processing' ? '33%' :
                              order.status === 'Shipped' ? '66%' :
                              order.status === 'Delivered' ? '100%' :
                              '0%'
                          }}
                        />
                      </div>
                      
                      {/* Status Steps */}
                      {['Pending', 'Processing', 'Shipped', 'Delivered'].map((status, idx) => {
                        const isActive = 
                          order.status === status ||
                          (order.status === 'Processing' && ['Pending'].includes(status)) ||
                          (order.status === 'Shipped' && ['Pending', 'Processing'].includes(status)) ||
                          (order.status === 'Delivered' && ['Pending', 'Processing', 'Shipped'].includes(status))
                        
                        const isCurrent = order.status === status
                        
                        return (
                          <div key={status} className="flex flex-col items-center relative" style={{ zIndex: 1 }}>
                            <div 
                              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                                isCurrent 
                                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 border-purple-600 scale-110' 
                                  : isActive 
                                    ? 'bg-purple-600 border-purple-600' 
                                    : 'bg-white border-gray-300'
                              }`}
                            >
                              {isActive ? (
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              ) : (
                                <div className={`w-3 h-3 rounded-full ${isCurrent ? 'bg-white' : 'bg-gray-300'}`} />
                              )}
                            </div>
                            <span className={`text-xs mt-2 font-medium ${isCurrent ? 'text-purple-600' : isActive ? 'text-gray-700' : 'text-gray-400'}`}>
                              {status}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                    
                    {order.status === 'Cancelled' && (
                      <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          <span className="text-sm font-semibold text-red-600">This order has been cancelled</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-gray-700 mb-2">Items:</h4>
                    <ul className="space-y-2">
                      {order.items?.map((item, idx) => (
                        <li key={idx} className="flex justify-between text-sm">
                          <span className="text-gray-600">{item.name} x {item.quantity}</span>
                          <span className="text-gray-800 font-medium">
                            NGN {(item.price * item.quantity).toLocaleString()}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="border-t mt-4 pt-4">
                    <h4 className="font-semibold text-gray-700 mb-2">Shipping Address:</h4>
                    <p className="text-sm text-gray-600">
                      {order.firstName} {order.lastName}<br />
                      {order.address}<br />
                      {order.city}, {order.state} {order.zipCode}<br />
                      {order.phone}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer with Social Media */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">ScentLumus</h3>
              <p className="text-gray-400">Your premier destination for luxury fragrances.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link href="/" className="text-gray-400 hover:text-white">Home</Link></li>
                <li><Link href="/about" className="text-gray-400 hover:text-white">About</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-white">Contact</Link></li>
                <li><Link href="/faq" className="text-gray-400 hover:text-white">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                <a href="https://www.instagram.com/scentlumus" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a href="https://twitter.com/scentlumus" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a href="https://www.facebook.com/scentlumus" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="https://www.tiktok.com/@scentlumus" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
            <p>&copy; 2025 ScentLumus. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  )
}
