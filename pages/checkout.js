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
  const [deliveryFee, setDeliveryFee] = useState(0)
  const [deliveryMessage, setDeliveryMessage] = useState('Loading...')
  const [deliveryMethod, setDeliveryMethod] = useState('delivery') // 'delivery' or 'pickup'
  const [selfPickupEnabled, setSelfPickupEnabled] = useState(false)
  const [promoCode, setPromoCode] = useState('')
  const [appliedPromo, setAppliedPromo] = useState(null)
  const [promoLoading, setPromoLoading] = useState(false)
  const [promoMessage, setPromoMessage] = useState('')
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

    // Fetch delivery settings to check if self-pickup is enabled
    const fetchDeliverySettings = async () => {
      try {
        const res = await fetch('/api/delivery-settings')
        const data = await res.json()
        console.log('Checkout - delivery settings response:', data)
        if (data.success && data.settings) {
          console.log('Self pickup enabled:', data.settings.selfPickupEnabled)
          console.log('Free threshold:', data.settings.freeThreshold)
          setSelfPickupEnabled(data.settings.selfPickupEnabled || false)
          // Set default delivery fee from settings
          if (deliveryMethod === 'delivery') {
            setDeliveryFee(data.settings.defaultFee || 2000)
            setDeliveryMessage('Standard delivery')
          }
        }
      } catch (err) {
        console.error('Failed to fetch delivery settings', err)
      }
    }
    fetchDeliverySettings()
  }, [router])

  // Update delivery fee when delivery method changes
  useEffect(() => {
    if (deliveryMethod === 'pickup') {
      setDeliveryFee(0)
      setDeliveryMessage('Self Pickup - FREE')
    } else if (formData.state || formData.city) {
      fetchDeliveryFee(formData.state, formData.city)
    }
  }, [deliveryMethod])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })

    // Recalculate delivery fee when state or city changes (only if delivery method is delivery)
    if ((name === 'state' || name === 'city') && deliveryMethod === 'delivery') {
      const newFormData = { ...formData, [name]: value }
      fetchDeliveryFee(newFormData.state, newFormData.city)
    }
  }

  // Fetch delivery fee based on location and cart total
  const fetchDeliveryFee = async (state, city) => {
    if (deliveryMethod === 'pickup') {
      setDeliveryFee(0)
      setDeliveryMessage('Self Pickup - FREE')
      return
    }

    try {
      const res = await fetch('/api/delivery-fee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state, city, cartTotal: getCartTotal() })
      })
      const data = await res.json()
      if (data.success) {
        setDeliveryFee(data.fee)
        setDeliveryMessage(data.message)
      }
    } catch (err) {
      console.error('Failed to fetch delivery fee', err)
    }
  }

  // Apply promo code
  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      setPromoMessage('Please enter a promo code')
      return
    }

    setPromoLoading(true)
    setPromoMessage('')

    try {
      const res = await fetch('/api/validate-promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode, cartTotal: getCartTotal() })
      })
      const data = await res.json()

      if (data.success) {
        setAppliedPromo(data.promo)
        setPromoMessage(data.message)
      } else {
        setPromoMessage(data.message)
        setAppliedPromo(null)
      }
    } catch (err) {
      console.error('Failed to apply promo', err)
      setPromoMessage('Failed to apply promo code')
      setAppliedPromo(null)
    } finally {
      setPromoLoading(false)
    }
  }

  const handleRemovePromo = () => {
    setAppliedPromo(null)
    setPromoCode('')
    setPromoMessage('')
  }

  // Calculate final total with promo discount
  const getDiscountedTotal = () => {
    const subtotal = getCartTotal()
    const discount = appliedPromo ? appliedPromo.discountAmount : 0
    return subtotal - discount + deliveryFee
  }

  // Update delivery fee when cart total changes
  useEffect(() => {
    if ((formData.state || formData.city) && deliveryMethod === 'delivery') {
      fetchDeliveryFee(formData.state, formData.city)
    }
  }, [getCartTotal()])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (cart.length === 0) {
      alert('Your cart is empty!')
      return
    }

    setLoading(true)

    try {
      const finalTotal = getDiscountedTotal()
      
      // If total is ₦0, create order without payment
      if (finalTotal === 0) {
        const orderData = {
          customer: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone
          },
          shipping: deliveryMethod === 'pickup' ? {
            address: 'Self Pickup',
            city: 'Self Pickup',
            state: 'Self Pickup',
            zipCode: ''
          } : {
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode
          },
          items: cart.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity
          })),
          total: 0,
          deliveryFee,
          promoCode: appliedPromo?.code || null,
          promoDiscount: appliedPromo?.discountAmount || 0,
          deliveryMethod,
          status: 'Pending',
          paymentMethod: 'Free Order (100% Discount)',
          paymentReference: 'FREE_' + Date.now()
        }

        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData)
        })

        const data = await res.json()
        if (data.success) {
          clearCart()
          alert('🎉 Order placed successfully! Total: ₦0 (100% discount applied)')
          router.push('/profile')
        } else {
          alert('Failed to place order. Please try again.')
        }
        setLoading(false)
        return
      }
      
      // Handle Cash on Delivery
      if (formData.paymentMethod === 'cash_on_delivery') {
        // Create order directly without payment
        const orderData = {
          customer: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone
          },
          shipping: deliveryMethod === 'pickup' ? {
            address: 'Self Pickup',
            city: 'Self Pickup',
            state: 'Self Pickup',
            zipCode: ''
          } : {
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode
          },
          items: cart.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity
          })),
          total: getDiscountedTotal(),
          deliveryFee,
          promoCode: appliedPromo?.code || null,
          promoDiscount: appliedPromo?.discountAmount || 0,
          deliveryMethod,
          status: 'Pending',
          paymentMethod: 'Cash on Delivery',
          paymentReference: 'COD_' + Date.now()
        }

        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData)
        })

        const data = await res.json()
        if (data.success) {
          clearCart()
          alert('Order placed successfully! We will contact you to confirm delivery.')
          router.push('/profile')
        } else {
          alert('Failed to place order. Please try again.')
        }
        setLoading(false)
        return
      }

      // Use Paystack for payment
      if (formData.paymentMethod === 'paystack') {
        // Check if Paystack is available
        if (!window.PaystackPop) {
          alert('Payment system is not available. Please refresh the page and try again.')
          setLoading(false)
          return
        }

        const total = getDiscountedTotal() // Use discounted total
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
              },
              ...(appliedPromo ? [{
                display_name: 'Promo Code',
                variable_name: 'promo_code',
                value: appliedPromo.code
              }] : [])
            ],
            customer: {
              firstName: formData.firstName,
              lastName: formData.lastName,
              email: formData.email,
              phone: formData.phone
            },
            shipping: {
              address: deliveryMethod === 'pickup' ? 'Self Pickup' : formData.address,
              city: deliveryMethod === 'pickup' ? 'Self Pickup' : formData.city,
              state: deliveryMethod === 'pickup' ? 'Self Pickup' : formData.state,
              zipCode: deliveryMethod === 'pickup' ? '' : formData.zipCode
            },
            deliveryMethod,
            promoCode: appliedPromo?.code || null,
            promoDiscount: appliedPromo?.discountAmount || 0,
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

              {/* Delivery Method */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Delivery Method</h2>
                <div className="space-y-3">
                  <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition"
                    style={{ borderColor: deliveryMethod === 'delivery' ? '#b45309' : '#d1d5db' }}>
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value="delivery"
                      checked={deliveryMethod === 'delivery'}
                      onChange={(e) => setDeliveryMethod(e.target.value)}
                      className="w-4 h-4 text-amber-600"
                    />
                    <div className="ml-3 flex-1">
                      <span className="block font-medium text-gray-900">🚚 Home Delivery</span>
                      <span className="block text-sm text-gray-500">We'll deliver to your address</span>
                    </div>
                    <span className="font-semibold text-amber-700">
                      {deliveryFee > 0 ? `₦${deliveryFee.toLocaleString('en-NG')}` : 'FREE'}
                    </span>
                  </label>

                  {selfPickupEnabled && (
                    <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition"
                      style={{ borderColor: deliveryMethod === 'pickup' ? '#b45309' : '#d1d5db' }}>
                      <input
                        type="radio"
                        name="deliveryMethod"
                        value="pickup"
                        checked={deliveryMethod === 'pickup'}
                        onChange={(e) => setDeliveryMethod(e.target.value)}
                        className="w-4 h-4 text-amber-600"
                      />
                      <div className="ml-3 flex-1">
                        <span className="block font-medium text-gray-900">📦 Self Pickup</span>
                        <span className="block text-sm text-gray-500">Pick up from our location</span>
                      </div>
                      <span className="font-semibold text-green-600">FREE</span>
                    </label>
                  )}
                </div>
              </div>

              {/* Shipping Address */}
              {deliveryMethod === 'delivery' && (
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
              )}

              {/* Promo Code */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg shadow p-6 border border-amber-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">🎉 Have a Promo Code?</h2>
                {!appliedPromo ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      placeholder="Enter promo code"
                      className="flex-1 border border-gray-300 rounded px-4 py-2 uppercase focus:outline-none focus:ring-2 focus:ring-amber-600"
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      disabled={promoLoading}
                      className="px-6 py-2 bg-amber-700 text-white rounded font-semibold hover:bg-amber-800 disabled:bg-gray-400"
                    >
                      {promoLoading ? 'Checking...' : 'Apply'}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-green-100 border-2 border-green-500 rounded-lg">
                    <div>
                      <p className="font-bold text-green-800 text-lg">{appliedPromo.code} Applied!</p>
                      <p className="text-green-700">You saved ₦{appliedPromo.discountAmount.toLocaleString('en-NG')}</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemovePromo}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Remove
                    </button>
                  </div>
                )}
                {promoMessage && (
                  <p className={`mt-2 text-sm ${promoMessage.includes('saved') || promoMessage.includes('Applied') ? 'text-green-600' : 'text-red-600'}`}>
                    {promoMessage}
                  </p>
                )}
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Method</h2>
                <div className="space-y-3">
                  <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition"
                    style={{ borderColor: formData.paymentMethod === 'paystack' ? '#b45309' : '#d1d5db' }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="paystack"
                      checked={formData.paymentMethod === 'paystack'}
                      onChange={handleChange}
                      className="w-4 h-4 text-amber-600"
                    />
                    <div className="ml-3 flex-1">
                      <div className="font-medium">💳 Pay with Card</div>
                      <div className="text-sm text-gray-500">Pay securely with Paystack</div>
                    </div>
                  </label>
                  <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition"
                    style={{ borderColor: formData.paymentMethod === 'cash_on_delivery' ? '#b45309' : '#d1d5db' }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash_on_delivery"
                      checked={formData.paymentMethod === 'cash_on_delivery'}
                      onChange={handleChange}
                      className="w-4 h-4 text-amber-600"
                    />
                    <div className="ml-3 flex-1">
                      <div className="font-medium">💵 Cash on Delivery</div>
                      <div className="text-sm text-gray-500">Pay when you receive your order</div>
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
                  {appliedPromo && (
                    <div className="flex justify-between text-green-600 font-medium">
                      <span>Promo Discount ({appliedPromo.code})</span>
                      <span>-₦{appliedPromo.discountAmount.toLocaleString('en-NG')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery</span>
                    <span className="flex flex-col items-end">
                      {deliveryFee === 0 ? (
                        <span className="text-green-600 font-semibold">FREE</span>
                      ) : (
                        <span>₦{deliveryFee.toLocaleString('en-NG')}</span>
                      )}
                      <span className="text-xs text-gray-500">{deliveryMessage}</span>
                    </span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between text-lg font-bold text-gray-900">
                      <span>Total</span>
                      <span>₦{getDiscountedTotal().toLocaleString('en-NG')}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-amber-700 text-white py-3 rounded-lg font-semibold hover:bg-amber-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : getDiscountedTotal() === 0 ? '🎉 Complete Free Order' : formData.paymentMethod === 'paystack' ? 'Pay Now' : 'Place Order'}
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
