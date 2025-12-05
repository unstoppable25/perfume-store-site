import { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import Script from 'next/script'

export default function Checkout() {
  const { cart, getCartTotal, clearCart } = useCart()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [paystackLoaded, setPaystackLoaded] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    paymentMethod: 'paystack'
  })

  // Check authentication and pre-fill form
  useEffect(() => {
    const userAuth = sessionStorage.getItem('user_authenticated')
    const userData = sessionStorage.getItem('user_data')
    
    if (userAuth !== 'true' && userAuth !== 'guest') {
      router.push('/signin?returnUrl=/checkout')
      return
    }

    // Pre-fill user data if available (not for guest)
    if (userData && userAuth === 'true') {
      const user = JSON.parse(userData)
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || ''
      }))
    }
  }, [router])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (cart.length === 0) {
      alert('Your cart is empty!')
      return
    }

    // Check if cash on delivery is selected
    if (formData.paymentMethod === 'cash_on_delivery') {
      alert('Cash on Delivery is currently unavailable. Please stay in touch for updates!')
      return
    }

    setLoading(true)

    try {
      // Use Paystack for payment
      if (formData.paymentMethod === 'paystack') {
        // Check if Paystack is available
        if (!window.PaystackPop) {
          alert('Payment system is not available. Please refresh the page and try again.')
          setLoading(false)
          return
        }

        const total = getCartTotal() + 2000 // Add shipping
        const amount = total * 100 // Convert to kobo

        const handler = window.PaystackPop.setup({
          key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_live_e025809d9568d6685a0f279c0903ca7d83c50685',
          email: formData.email,
          amount: amount,
          currency: 'NGN',
          ref: 'ORDER_' + Math.floor(Math.random() * 1000000000) + Date.now(),
          metadata: {
            custom_fields: [
              {
                display_name: 'Customer Name',
                variable_name: 'customer_name',
                value: `${formData.firstName} ${formData.lastName}`
              },
              {
                display_name: 'Phone',
                variable_name: 'phone',
                value: formData.phone
              }
            ],
            customer: {
              firstName: formData.firstName,
              lastName: formData.lastName,
              email: formData.email,
              phone: formData.phone
            },
            shipping: {
              address: formData.address,
              city: formData.city,
              state: formData.state,
              zipCode: formData.zipCode
            },
            cart: cart.map(item => ({
              id: item.id,
              name: item.name,
              price: item.price,
              quantity: item.quantity
            }))
          },
          callback: function(response) {
            // Payment successful
            verifyPayment(response.reference)
          },
          onClose: function() {
            setLoading(false)
            alert('Payment cancelled')
          }
        })

        handler.openIframe()
      }
    } catch (err) {
      console.error('Checkout error:', err)
      alert('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const verifyPayment = async (reference) => {
    try {
      const res = await fetch(`/api/verify-payment?reference=${reference}`)
      const data = await res.json()

      if (data.success) {
        clearCart()
        router.push(`/order-confirmation?reference=${reference}`)
      } else {
        alert('Payment verification failed. Please contact support.')
        setLoading(false)
      }
    } catch (err) {
      console.error('Verification error:', err)
      alert('Payment verification failed. Please contact support.')
      setLoading(false)
    }
  }

  if (cart.length === 0) {
    return (
      <>
        <Head>
          <title>Checkout — ScentLumus</title>
        </Head>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-700 mb-4">Your cart is empty</h1>
            <Link href="/" className="text-amber-700 hover:underline">
              Return to shop
            </Link>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Checkout — ScentLumus</title>
      </Head>
      <Script 
        src="https://js.paystack.co/v1/inline.js" 
        onLoad={() => {
          console.log('Paystack script loaded')
          setPaystackLoaded(true)
        }}
        onError={(e) => {
          console.error('Paystack script failed to load:', e)
          setPaystackLoaded(false)
        }}
        strategy="lazyOnload"
      />
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <Link href="/" className="text-2xl font-bold text-amber-900">
              ScentLumus
            </Link>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Information */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-600"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Shipping Address</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-600"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-600"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State *
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-600"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Zip Code *
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-600"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Method</h2>
                <div className="space-y-3">
                  <label className="flex items-center p-4 border-2 border-amber-600 rounded cursor-pointer bg-amber-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="paystack"
                      checked={formData.paymentMethod === 'paystack'}
                      onChange={handleChange}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-medium">Pay with Card</div>
                      <div className="text-sm text-gray-500">Pay securely with Paystack (Recommended)</div>
                    </div>
                  </label>
                  <label className="flex items-center p-4 border rounded cursor-pointer hover:bg-gray-50 opacity-60">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank_transfer"
                      checked={formData.paymentMethod === 'bank_transfer'}
                      onChange={handleChange}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-medium">Bank Transfer</div>
                      <div className="text-sm text-gray-500">Currently unavailable - Stay in touch!</div>
                    </div>
                  </label>
                  <label className="flex items-center p-4 border rounded cursor-pointer hover:bg-gray-50 opacity-60">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash_on_delivery"
                      checked={formData.paymentMethod === 'cash_on_delivery'}
                      onChange={handleChange}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-medium">Cash on Delivery</div>
                      <div className="text-sm text-gray-500">Currently unavailable - Stay in touch!</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6 sticky top-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-3 pb-3 border-b">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                      ) : (
                        <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-50 rounded flex items-center justify-center text-xs">
                          {item.name.slice(0, 3)}
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        <p className="text-sm font-bold text-amber-900">
                          ₦{(parseFloat(item.price) * item.quantity).toLocaleString('en-NG')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>₦{getCartTotal().toLocaleString('en-NG')}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>₦2,000</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between text-lg font-bold text-gray-900">
                      <span>Total</span>
                      <span>₦{(getCartTotal() + 2000).toLocaleString('en-NG')}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-amber-700 text-white py-3 rounded-lg font-semibold hover:bg-amber-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : formData.paymentMethod === 'paystack' ? 'Pay Now' : 'Place Order'}
                </button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  By placing your order, you agree to our terms and conditions
                </p>
              </div>
            </div>
          </form>
        </main>
      </div>
    </>
  )
}
