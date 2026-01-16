import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useCart } from '../context/CartContext'

export default function About() {
  const [logo, setLogo] = useState(null)
  const [aboutContent, setAboutContent] = useState('')
  const { getCartCount } = useCart()
  const cartCount = getCartCount()

  useEffect(() => {
    const savedLogo = localStorage.getItem('scentlumus_logo')
    if (savedLogo) setLogo(savedLogo)

    // Fetch about content from settings
    const fetchAboutContent = async () => {
      try {
        const res = await fetch('/api/settings')
        const data = await res.json()
        if (data.success && data.settings?.about_content) {
          setAboutContent(data.settings.about_content)
        }
      } catch (err) {
        console.error('Failed to fetch about content:', err)
      }
    }
    fetchAboutContent()
  }, [])

  return (
    <>
      <Head>
        <title>About Us - ScentLumus</title>
        <meta name="description" content="Learn about ScentLumus - Your premier destination for luxury fragrances" />
        <link rel="canonical" href="https://scentlumus.com/about" />
      </Head>

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <Link href="/" className="flex items-center space-x-3">
                {logo ? (
                  <img src={logo} alt="ScentLumus" className="h-10" />
                ) : (
                  <div className="text-2xl font-bold text-amber-900">SCENTLUMUS</div>
                )}
              </Link>
              <p className="text-xs text-gray-500 mt-1">destination for luxury fragrances</p>
            </div>
            <nav className="hidden md:flex space-x-6">
              <Link href="/" className="text-gray-700 hover:text-amber-900">Home</Link>
              <Link href="/about" className="text-amber-700 font-semibold">About</Link>
              <Link href="/contact" className="text-gray-700 hover:text-amber-900">Contact</Link>
              <Link href="/faq" className="text-gray-700 hover:text-amber-900">FAQ</Link>
            </nav>
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
      </header>

      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-amber-700 to-amber-900 text-white py-20">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold mb-4">About ScentLumus</h1>
            <p className="text-xl text-amber-100">Illuminating Your World with Exquisite Fragrances</p>
          </div>
        </section>

        {/* About Content */}
        <section className="max-w-6xl mx-auto px-4 py-16">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">About ScentLumus</h2>
            {aboutContent ? (
              <div className="prose prose-lg max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: aboutContent.replace(/\n/g, '<br>') }} />
            ) : (
              <div className="text-gray-500 italic">
                About content is being loaded... If you're an admin, you can add content in the Content Management section.
              </div>
            )}
          </div>
        </section>

        {/* Our Values */}
        <section className="bg-white py-16">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Our Values</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Authenticity</h3>
                <p className="text-gray-600">
                  We guarantee 100% authentic products. Every perfume is sourced directly from authorized distributors and verified for quality.
                </p>
              </div>

              <div className="text-center p-6">
                <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Customer Care</h3>
                <p className="text-gray-600">
                  Your satisfaction is our priority. We provide exceptional customer service and support throughout your shopping experience.
                </p>
              </div>

              <div className="text-center p-6">
                <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Fast Delivery</h3>
                <p className="text-gray-600">
                  Quick and secure shipping to your doorstep. We handle every order with care to ensure safe and timely delivery.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Why Choose ScentLumus?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex items-start space-x-4">
              <div className="bg-amber-700 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Wide Selection</h3>
                <p className="text-gray-600">From classic scents to modern fragrances, we offer an extensive collection for every preference and occasion.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Competitive Prices</h3>
                <p className="text-gray-600">Luxury fragrances at affordable prices. We believe everyone deserves access to quality perfumes.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Expert Guidance</h3>
                <p className="text-gray-600">Need help choosing? Our team is always ready to assist you in finding your perfect scent.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Secure Shopping</h3>
                <p className="text-gray-600">Shop with confidence. Your privacy and security are protected with every transaction.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-gradient-to-r from-amber-700 to-amber-900 text-white py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Find Your Signature Scent?</h2>
            <p className="text-xl text-amber-100 mb-8">
              Explore our curated collection of luxury fragrances
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/" className="bg-white text-amber-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
                Shop Now
              </Link>
              <Link href="/contact" className="bg-amber-800 text-white px-8 py-3 rounded-lg font-semibold hover:bg-amber-900 transition">
                Contact Us
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">ScentLumus</h3>
              <p className="text-gray-400">Illuminating your world with exquisite fragrances since 2025.</p>
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
              <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
              <p className="text-gray-400 mb-4">Subscribe for exclusive offers and updates</p>
              <form className="flex" onSubmit={(e) => {
                e.preventDefault()
                const email = e.target.email.value
                if (email) {
                  fetch('/api/subscribe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                  }).then(() => {
                    alert('Thank you for subscribing!')
                    e.target.reset()
                  })
                }
              }}>
                <input
                  type="email"
                  name="email"
                  placeholder="Your email"
                  className="flex-1 px-4 py-2 rounded-l-lg text-gray-800"
                  required
                />
                <button type="submit" className="bg-amber-700 px-6 py-2 rounded-r-lg hover:bg-amber-800">
                  Subscribe
                </button>
              </form>
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
