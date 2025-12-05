import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'

export default function OrderDetails() {
  const router = useRouter()
  const { id } = router.query
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const userAuth = sessionStorage.getItem('user_authenticated')
    const userData = sessionStorage.getItem('user_data')
    
    if (userAuth !== 'true' || !userData) {
      router.push('/signin?returnUrl=/profile')
      return
    }

    setUser(JSON.parse(userData))

    if (id) {
      fetchOrderDetails()
    }
  }, [id, router])

  const fetchOrderDetails = async () => {
    try {
      const res = await fetch(`/api/orders/${id}`)
      if (res.ok) {
        const data = await res.json()
        setOrder(data.order)
      } else {
        alert('Order not found')
        router.push('/profile')
      }
    } catch (err) {
      console.error('Failed to fetch order:', err)
      alert('Failed to load order details')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-700 mb-4">Order not found</h1>
          <Link href="/profile" className="text-amber-700 hover:underline">
            Return to profile
          </Link>
        </div>
      </div>
    )
  }

  const statusColors = {
    Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Processing: 'bg-blue-100 text-blue-800 border-blue-200',
    Shipped: 'bg-purple-100 text-purple-800 border-purple-200',
    Delivered: 'bg-green-100 text-green-800 border-green-200',
    Cancelled: 'bg-red-100 text-red-800 border-red-200'
  }

  const statusIcons = {
    Pending: '⏳',
    Processing: '📦',
    Shipped: '🚚',
    Delivered: '✅',
    Cancelled: '❌'
  }

  return (
    <>
      <Head>
        <title>Order Details — ScentLumus</title>
      </Head>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-2xl font-bold text-amber-900">
                SCENTLUMUS
              </Link>
              <Link href="/profile" className="text-gray-700 hover:text-amber-900 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Profile
              </Link>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Order Header */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Order #{order.id?.slice(0, 12)}
                </h1>
                <p className="text-gray-600">
                  Placed on {new Date(order.createdAt).toLocaleString('en-US', {
                    dateStyle: 'long',
                    timeStyle: 'short'
                  })}
                </p>
              </div>
              <div className="text-right">
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-lg font-semibold border-2 ${statusColors[order.status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                  <span className="text-2xl">{statusIcons[order.status] || '📋'}</span>
                  {order.status || 'Pending'}
                </span>
              </div>
            </div>

            {/* Order Progress */}
            <div className="border-t pt-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className={`flex flex-col items-center ${['Pending', 'Processing', 'Shipped', 'Delivered'].includes(order.status) ? 'text-amber-700' : 'text-gray-400'}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${['Pending', 'Processing', 'Shipped', 'Delivered'].includes(order.status) ? 'bg-amber-700 text-white' : 'bg-gray-300 text-gray-600'}`}>
                        ✓
                      </div>
                      <span className="text-xs mt-2 font-medium">Ordered</span>
                    </div>
                    <div className={`flex-1 h-1 ${['Processing', 'Shipped', 'Delivered'].includes(order.status) ? 'bg-amber-700' : 'bg-gray-300'}`}></div>
                    <div className={`flex flex-col items-center ${['Processing', 'Shipped', 'Delivered'].includes(order.status) ? 'text-amber-700' : 'text-gray-400'}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${['Processing', 'Shipped', 'Delivered'].includes(order.status) ? 'bg-amber-700 text-white' : 'bg-gray-300 text-gray-600'}`}>
                        {['Processing', 'Shipped', 'Delivered'].includes(order.status) ? '✓' : '2'}
                      </div>
                      <span className="text-xs mt-2 font-medium">Processing</span>
                    </div>
                    <div className={`flex-1 h-1 ${['Shipped', 'Delivered'].includes(order.status) ? 'bg-amber-700' : 'bg-gray-300'}`}></div>
                    <div className={`flex flex-col items-center ${['Shipped', 'Delivered'].includes(order.status) ? 'text-amber-700' : 'text-gray-400'}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${['Shipped', 'Delivered'].includes(order.status) ? 'bg-amber-700 text-white' : 'bg-gray-300 text-gray-600'}`}>
                        {['Shipped', 'Delivered'].includes(order.status) ? '✓' : '3'}
                      </div>
                      <span className="text-xs mt-2 font-medium">Shipped</span>
                    </div>
                    <div className={`flex-1 h-1 ${order.status === 'Delivered' ? 'bg-amber-700' : 'bg-gray-300'}`}></div>
                    <div className={`flex flex-col items-center ${order.status === 'Delivered' ? 'text-amber-700' : 'text-gray-400'}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${order.status === 'Delivered' ? 'bg-amber-700 text-white' : 'bg-gray-300 text-gray-600'}`}>
                        {order.status === 'Delivered' ? '✓' : '4'}
                      </div>
                      <span className="text-xs mt-2 font-medium">Delivered</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Order Items */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Order Items</h2>
                <div className="space-y-4">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex gap-4 pb-4 border-b last:border-0">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-amber-50 rounded-lg flex items-center justify-center text-gray-400 text-xs font-semibold">
                          {item.name?.slice(0, 3)}
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                        <p className="text-sm text-gray-500 mb-2">Quantity: {item.quantity}</p>
                        <div className="flex items-center gap-3">
                          <p className="text-sm text-gray-600">
                            ₦{parseFloat(item.price).toLocaleString('en-NG')} each
                          </p>
                          <p className="text-lg font-bold text-amber-900">
                            ₦{(parseFloat(item.price) * item.quantity).toLocaleString('en-NG')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Shipping Address</h2>
                <div className="text-gray-700 space-y-1">
                  <p className="font-semibold">{order.customer?.firstName} {order.customer?.lastName}</p>
                  <p>{order.shipping?.address}</p>
                  <p>{order.shipping?.city}, {order.shipping?.state} {order.shipping?.zipCode}</p>
                  <p className="pt-2 text-sm">
                    <span className="font-medium">Phone:</span> {order.customer?.phone}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Email:</span> {order.customer?.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-6 sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>₦{(parseFloat(order.total) - 2000).toLocaleString('en-NG')}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>₦2,000</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-xl font-bold text-gray-900">
                      <span>Total</span>
                      <span className="text-amber-900">₦{parseFloat(order.total).toLocaleString('en-NG')}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="border-t pt-4 mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Payment Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Method:</span>
                      <span className="font-medium capitalize">{order.paymentMethod || 'Card Payment'}</span>
                    </div>
                    {order.paymentReference && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Reference:</span>
                        <span className="font-mono text-xs">{order.paymentReference}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-medium text-green-600">Paid</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <Link
                    href="/shop"
                    className="block w-full text-center bg-amber-700 text-white py-3 rounded-lg hover:bg-amber-800 font-semibold transition"
                  >
                    Continue Shopping
                  </Link>
                  <Link
                    href="/contact"
                    className="block w-full text-center border-2 border-amber-700 text-amber-700 py-3 rounded-lg hover:bg-amber-50 font-semibold transition"
                  >
                    Contact Support
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
