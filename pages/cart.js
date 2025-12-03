import { useCart } from '../context/CartContext'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, getCartTotal, getCartCount } = useCart()
  const router = useRouter()

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Your cart is empty!')
      return
    }
    router.push('/checkout')
  }

  return (
    <>
      <Head>
        <title>Shopping Cart — ScentLumus</title>
      </Head>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-2xl font-bold text-amber-900">
                ScentLumus
              </Link>
              <Link href="/" className="text-gray-600 hover:text-amber-900">
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

          {cart.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">Your cart is empty</h2>
              <p className="text-gray-500 mb-6">Add some beautiful perfumes to get started!</p>
              <Link href="/" className="inline-block bg-amber-700 text-white px-6 py-3 rounded-lg hover:bg-amber-800">
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex gap-6">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-24 h-24 object-cover rounded"
                        />
                      ) : (
                        <div className="w-24 h-24 bg-gradient-to-br from-amber-100 to-amber-50 rounded flex items-center justify-center text-gray-400 text-xs font-semibold">
                          {item.name}
                        </div>
                      )}

                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                            <p className="text-sm text-gray-600">{item.description}</p>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-600 hover:text-red-800 ml-4"
                            title="Remove from cart"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8 rounded border border-gray-300 hover:bg-gray-100 flex items-center justify-center"
                              disabled={item.quantity <= 1}
                            >
                              <span className="text-lg">−</span>
                            </button>
                            <span className="w-12 text-center font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 rounded border border-gray-300 hover:bg-gray-100 flex items-center justify-center"
                            >
                              <span className="text-lg">+</span>
                            </button>
                          </div>

                          <div className="text-right">
                            <p className="text-sm text-gray-500">₦{parseFloat(item.price).toLocaleString('en-NG')} each</p>
                            <p className="text-lg font-bold text-amber-900">
                              ₦{(parseFloat(item.price) * item.quantity).toLocaleString('en-NG')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow p-6 sticky top-4">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-gray-600">
                      <span>Items ({getCartCount()})</span>
                      <span>₦{getCartTotal().toLocaleString('en-NG')}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping</span>
                      <span>Calculated at checkout</span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between text-lg font-bold text-gray-900">
                        <span>Total</span>
                        <span>₦{getCartTotal().toLocaleString('en-NG')}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    className="w-full bg-amber-700 text-white py-3 rounded-lg font-semibold hover:bg-amber-800 mb-3"
                  >
                    Proceed to Checkout
                  </button>

                  <Link
                    href="/"
                    className="block w-full text-center border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  )
}
