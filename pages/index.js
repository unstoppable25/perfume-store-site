import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useCart } from '../context/CartContext'
import Head from 'next/head'
import Link from 'next/link'

export default function Home() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [subscribe, setSubscribe] = useState('')
  const [products, setProducts] = useState([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const { addToCart, getCartCount } = useCart()

  // Check authentication
  useEffect(() => {
    const userAuth = sessionStorage.getItem('user_authenticated')
    const userData = sessionStorage.getItem('user_data')
    
    if (userAuth === 'true' || userAuth === 'guest') {
      setIsAuthenticated(true)
      if (userData) {
        setUser(JSON.parse(userData))
      }
    } else {
      // Redirect to signin
      router.push('/signin')
    }
  }, [router])

  const handleLogout = () => {
    sessionStorage.removeItem('user_authenticated')
    sessionStorage.removeItem('user_data')
    router.push('/signin')
  }

  const handleSubscribe = async (e) => {
    e.preventDefault()
    setSubscribe('Loading...')
    try {
      const res = await fetch('/api/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
      const data = await res.json()
      setSubscribe(data.message || 'Subscribed!')
      setEmail('')
      setTimeout(() => setSubscribe(''), 3000)
    } catch (err) {
      setSubscribe('Error. Try again.')
    }
  }

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products')
        const data = await res.json()
        if (data && data.length > 0) {
          setProducts(data)
        } else {
          // Fallback to localStorage if server has no products
          const backup = localStorage.getItem('scentlumus_products_backup')
          if (backup) {
            setProducts(JSON.parse(backup))
          }
        }
      } catch (err) {
        console.error('Failed to load products', err)
        // Fallback to localStorage if API fails
        const backup = localStorage.getItem('scentlumus_products_backup')
        if (backup) {
          setProducts(JSON.parse(backup))
        }
      }
    }
    fetchProducts()
  }, [])

  return (
    <>
      <Head>
        <title>ScentLumus — Handcrafted Perfumes</title>
        <meta name="description" content="Discover luxury handcrafted perfumes by ScentLumus" />
      </Head>
      <main className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
        <header className="max-w-5xl mx-auto p-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-amber-900">ScentLumus</h1>
          <nav className="flex items-center space-x-6">
            <Link href="/" className="text-sm text-gray-700 hover:text-amber-700">Home</Link>
            <Link href="/about" className="text-sm text-gray-700 hover:text-amber-700">About</Link>
            <Link href="/contact" className="text-sm text-gray-700 hover:text-amber-700">Contact</Link>
            <Link href="/faq" className="text-sm text-gray-700 hover:text-amber-700">FAQ</Link>
            <Link href="/my-orders" className="text-sm text-gray-700 hover:text-amber-700">My Orders</Link>
            <Link href="/cart" className="relative">
              <svg className="w-6 h-6 text-gray-700 hover:text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {getCartCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-700 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {getCartCount()}
                </span>
              )}
            </Link>
            {user && (
              <>
                <span className="text-sm text-gray-700">Hi, {user.firstName}</span>
                <button onClick={handleLogout} className="text-sm text-red-600 hover:text-red-700">
                  Logout
                </button>
              </>
            )}
          </nav>
        </header>

        <section className="max-w-5xl mx-auto p-6 text-center">
          <h2 className="text-5xl font-bold mb-4 text-amber-900">Beautiful scents crafted with care</h2>
          <p className="text-gray-600 mb-6 text-lg">Discover luxury handcrafted perfumes. Join our newsletter for launch updates and exclusive offers.</p>
          <form onSubmit={handleSubscribe} className="flex justify-center gap-2">
            <input 
              type="email"
              placeholder="Your email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-amber-300 p-3 rounded-l-md w-72 focus:outline-none focus:ring-2 focus:ring-amber-600" 
              required
            />
            <button type="submit" className="bg-amber-700 text-white px-6 rounded-r-md hover:bg-amber-800">Notify me</button>
          </form>
          {subscribe && <p className="mt-2 text-sm text-green-600">{subscribe}</p>}
        </section>

        <section className="max-w-5xl mx-auto p-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {products.length === 0 ? (
            <p className="text-gray-500">No products yet. Add some in the Admin dashboard.</p>
          ) : (
            products.map((p) => (
              <article key={p.id} className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition">
                {p.image ? (
                  <img src={p.image} alt={p.name} className="h-48 w-full object-cover rounded mb-4" />
                ) : (
                  <div className="h-48 bg-gradient-to-br from-amber-100 to-amber-50 rounded mb-4 flex items-center justify-center text-gray-400 font-semibold">{p.name}</div>
                )}
                <h3 className="font-semibold text-amber-900">{p.name}</h3>
                <p className="text-sm text-gray-600">{p.description}</p>
                <p className="mt-2 font-bold text-amber-700">₦{parseFloat(p.price).toLocaleString('en-NG')}</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => {
                      addToCart(p)
                      alert('Added to cart!')
                    }}
                    className="w-full bg-amber-700 text-white py-2 rounded hover:bg-amber-800"
                  >
                    Add to Cart
                  </button>
                  <button
                    className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
                    onClick={() => {
                      addToCart(p)
                      window.location.href = '/cart'
                    }}
                  >
                    Buy Now
                  </button>
                </div>
              </article>
            ))
          )}
        </section>

        {/* Footer with Social Media */}
        <footer className="mt-12 border-t bg-gray-50 py-8">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8 mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-3">ScentLumus</h3>
                <p className="text-gray-600 text-sm">Your premier destination for luxury fragrances.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Quick Links</h3>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/about" className="text-gray-600 hover:text-purple-600">About</Link></li>
                  <li><Link href="/contact" className="text-gray-600 hover:text-purple-600">Contact</Link></li>
                  <li><Link href="/faq" className="text-gray-600 hover:text-purple-600">FAQ</Link></li>
                  <li><Link href="/my-orders" className="text-gray-600 hover:text-purple-600">My Orders</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Follow Us</h3>
                <div className="flex space-x-4">
                  <a href="https://www.instagram.com/scentlumus" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-purple-600 transition">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                  <a href="https://twitter.com/scentlumus" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-purple-600 transition">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </a>
                  <a href="https://www.facebook.com/scentlumus" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-purple-600 transition">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                  <a href="https://www.tiktok.com/@scentlumus" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-purple-600 transition">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
            <div className="border-t pt-6 text-center text-sm text-gray-500">
              © {new Date().getFullYear()} ScentLumus — All rights reserved. | <Link href="/about" className="text-purple-600 hover:underline">Privacy</Link> | <Link href="/about" className="text-purple-600 hover:underline">Terms</Link>
            </div>
          </div>
        </footer>
      </main>
    </>
  )
}
