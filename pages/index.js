import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { useCart } from '../context/CartContext'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

export default function Home() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const { getCartCount } = useCart()
  const cartCount = getCartCount()
  const [shopBgImage, setShopBgImage] = useState('')
  const [aboutBgImage, setAboutBgImage] = useState('')

  useEffect(() => {
    const userAuth = sessionStorage.getItem('user_authenticated')
    const userData = sessionStorage.getItem('user_data')
    
    if (userAuth === 'true' && userData) {
      setUser(JSON.parse(userData))
    }

    // Load background images from database
    const loadBackgroundImages = async () => {
      try {
        const res = await fetch('/api/settings')
        const data = await res.json()
        if (data.success && data.settings) {
          if (data.settings.shop_button_bg) {
            setShopBgImage(data.settings.shop_button_bg)
          }
          if (data.settings.about_button_bg) {
            setAboutBgImage(data.settings.about_button_bg)
          }
        }
      } catch (err) {
        console.error('Failed to load background images:', err)
      }
    }
    loadBackgroundImages()
  }, [])

  const handleLogout = () => {
    sessionStorage.removeItem('user_authenticated')
    sessionStorage.removeItem('user_data')
    setUser(null)
  }

  return (
    <>
      <Head>
        <title>ScentLumus — Luxury Fragrances</title>
        <meta name="description" content="Welcome to the house of ScentLumus" />
      </Head>
      
      <div className="min-h-screen flex flex-col">
        {/* Header with logo, login, cart */}
        <header className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div>
                <Link href="/" className="text-2xl font-bold text-amber-900">
                  SCENTLUMUS
                </Link>
                <p className="text-xs text-gray-500">destination for luxury fragrances</p>
              </div>
              
              <div className="flex items-center space-x-6">
                {user ? (
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-amber-900 transition"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="hidden sm:inline">Profile</span>
                  </Link>
                ) : (
                  <Link
                    href="/signin"
                    className="text-sm text-gray-600 hover:text-amber-900 transition"
                  >
                    Login
                  </Link>
                )}

                {/* Search Icon */}
                <button
                  onClick={() => router.push('/shop')}
                  className="text-gray-700 hover:text-amber-900 transition"
                  aria-label="Search"
                >
                  <MagnifyingGlassIcon className="w-6 h-6" />
                </button>

                <Link href="/cart" className="relative">
                  <svg className="w-6 h-6 text-gray-700 hover:text-amber-900 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
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

        {/* Hero Section - Full screen gradient */}
        <div className="flex-1 bg-gradient-to-r from-amber-700 to-amber-900 text-white flex items-center justify-center px-4 py-12">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-light mb-12 text-gray-900">
              <span className="font-serif italic font-semibold">ScentLumus</span>
              <span className="block mt-2 text-lg sm:text-xl text-gray-900 tracking-wide font-medium">
                destination for luxury fragrances
              </span>
            </h1>
            
            <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
              <Link
                href="/shop"
                className="relative inline-block rounded-lg text-2xl font-bold transition shadow-lg w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] flex items-center justify-center overflow-hidden group"
                style={{
                  backgroundImage: shopBgImage ? `url(${shopBgImage})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {/* Dim overlay */}
                <div className="absolute inset-0 bg-black opacity-60 group-hover:opacity-50 transition"></div>
                {/* Fallback color if no image */}
                {!shopBgImage && <div className="absolute inset-0 bg-amber-800"></div>}
                <span className="relative z-10 text-white">Shop</span>
              </Link>
              
              <Link
                href="/about"
                className="relative inline-block rounded-lg text-2xl font-bold transition shadow-lg w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] flex items-center justify-center overflow-hidden group"
                style={{
                  backgroundImage: aboutBgImage ? `url(${aboutBgImage})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {/* Dim overlay */}
                <div className="absolute inset-0 bg-black opacity-60 group-hover:opacity-50 transition"></div>
                {/* Fallback color if no image */}
                {!aboutBgImage && <div className="absolute inset-0 bg-amber-800"></div>}
                <span className="relative z-10 text-white">About us</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div>
                <h3 className="text-xl font-bold mb-4">SCENTLUMUS</h3>
                <p className="text-gray-400 text-sm">
                  Your premier destination for luxury fragrances.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/" className="text-gray-400 hover:text-white transition">Home</Link></li>
                  <li><Link href="/shop" className="text-gray-400 hover:text-white transition">Shop</Link></li>
                  <li><Link href="/about" className="text-gray-400 hover:text-white transition">About us</Link></li>
                  <li><Link href="/contact" className="text-gray-400 hover:text-white transition">Contact us</Link></li>
                  <li><Link href="/profile" className="text-gray-400 hover:text-white transition">My Orders</Link></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
                <div className="flex space-x-4">
                  <a href="https://wa.me/YOUR_PHONE_NUMBER" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition" title="WhatsApp">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                  </a>
                  <a href="https://www.instagram.com/scentlumus" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                  <a href="https://twitter.com/scentlumus" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </a>
                  <a href="https://www.facebook.com/scentlumus" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                  <a href="https://www.tiktok.com/@scentlumus" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
              <p>© {new Date().getFullYear()} SCENTLUMUS. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
