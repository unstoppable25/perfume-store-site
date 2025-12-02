import { useState, useEffect } from 'react'
import Head from 'next/head'

export default function Home() {
  const [email, setEmail] = useState('')
  const [subscribe, setSubscribe] = useState('')
  const [products, setProducts] = useState([])

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
          <nav className="space-x-6">
            <a href="/" className="text-sm text-gray-700 hover:text-amber-700">Home</a>
            <a href="#" className="text-sm text-gray-700 hover:text-amber-700">About</a>
            <a href="#" className="text-sm text-gray-700 hover:text-amber-700">Contact</a>
            <a href="/admin" className="text-sm text-gray-700 hover:text-amber-700">Admin</a>
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
                  <button className="w-full bg-amber-700 text-white py-2 rounded hover:bg-amber-800">Add to Cart</button>
                  <button
                    className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
                    onClick={async () => {
                      try {
                        const res = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ product: p }) })
                        const data = await res.json()
                        if (data.url) window.location.href = data.url
                      } catch (err) {
                        console.error('Checkout failed', err)
                        alert('Checkout failed')
                      }
                    }}
                  >Buy</button>
                </div>
              </article>
            ))
          )}
        </section>

        <footer className="mt-12 border-t py-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} ScentLumus — All rights reserved. | <a href="#" className="text-amber-700">Privacy</a> | <a href="#" className="text-amber-700">Terms</a>
        </footer>
      </main>
    </>
  )
}
