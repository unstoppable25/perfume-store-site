
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useCart } from '../context/CartContext'
import Head from 'next/head'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

export async function getServerSideProps() {
  return { props: {} };
}

export default function Shop() {
  // All state declarations at the top
  const [wishlist, setWishlist] = useState([]);
  const [products, setProducts] = useState([]);
  const [user, setUser] = useState(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categorizedProducts, setCategorizedProducts] = useState({});
  const [categoryOrder, setCategoryOrder] = useState([]);

  // Helper to get userId (from user object or session)
  const getUserId = () => {
    if (user && user.id) return user.id;
    if (user && user.email) return user.email;
    return null;
  };

  // Load wishlist from API or localStorage (client only)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const userId = getUserId();
    if (userId) {
      fetch(`/api/wishlist?userId=${encodeURIComponent(userId)}`)
        .then(res => res.json())
        .then(data => setWishlist(Array.isArray(data.wishlist) ? data.wishlist : []));
    } else {
      const stored = window.localStorage.getItem('scentlumus_wishlist');
      if (stored) setWishlist(JSON.parse(stored));
    }
    // eslint-disable-next-line
  }, [user]);

  // Save wishlist to API or localStorage (client only)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const userId = getUserId();
    if (userId) {
      fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, wishlist }),
      });
    } else {
      window.localStorage.setItem('scentlumus_wishlist', JSON.stringify(wishlist));
    }
    // eslint-disable-next-line
  }, [wishlist, user]);

  // Toggle wishlist
  const toggleWishlist = (productId) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };
  const router = useRouter()
  const [products, setProducts] = useState([])
  const [user, setUser] = useState(null)
  const [addedToCart, setAddedToCart] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { addToCart, getCartCount } = useCart()

  // Group products by categories
  const [categorizedProducts, setCategorizedProducts] = useState({})
  const [categoryOrder, setCategoryOrder] = useState([])

  // Check if user is logged in (optional, client only)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const userAuth = window.sessionStorage.getItem('user_authenticated');
    const userData = window.sessionStorage.getItem('user_data');
    if (userAuth === 'true' && userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('user_authenticated')
    sessionStorage.removeItem('user_data')
    setUser(null)
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch products
        const productsRes = await fetch('/api/products')
        const productsData = await productsRes.json()
        
        // Fetch categories order
        const settingsRes = await fetch('/api/settings')
        const settingsData = await settingsRes.json()
        const categories = settingsData?.settings?.categories || []
        
        // Sort products by their order field
        const sortedProducts = (productsData || []).sort((a, b) => {
          const orderA = a.order !== undefined ? a.order : 999999
          const orderB = b.order !== undefined ? b.order : 999999
          return orderA - orderB
        })
        
        // Only show active products
        const filteredProducts = (sortedProducts || []).filter(p => p.active !== false)
        setProducts(filteredProducts)
        setCategoryOrder(categories)
        groupProductsByCategories(filteredProducts)
        
        // Update localStorage backup
        if (sortedProducts.length > 0) {
          localStorage.setItem('scentlumus_products_backup', JSON.stringify(sortedProducts))
        }
      } catch (err) {
        console.error('Failed to load data', err)
        // Only use backup if server is unreachable
        const backup = localStorage.getItem('scentlumus_products_backup')
        if (backup) {
          const parsedBackup = JSON.parse(backup)
          setProducts(parsedBackup)
          groupProductsByCategories(parsedBackup)
        }
      }
    }
    fetchData()
  }, [])

  const groupProductsByCategories = (productList) => {
    const grouped = {}
    productList.forEach(product => {
      if (product.categories && product.categories.length > 0) {
        product.categories.forEach(category => {
          if (!grouped[category]) {
            grouped[category] = []
          }
          grouped[category].push(product)
        })
      } else {
        // Products without categories go to "Uncategorized"
        if (!grouped['Uncategorized']) {
          grouped['Uncategorized'] = []
        }
        grouped['Uncategorized'].push(product)
      }
    })
    
    // Sort products within each category by their category-specific order
    Object.keys(grouped).forEach(category => {
      grouped[category].sort((a, b) => {
        const orderA = a.categoryOrder?.[category] !== undefined ? a.categoryOrder[category] : 999999
        const orderB = b.categoryOrder?.[category] !== undefined ? b.categoryOrder[category] : 999999
        return orderA - orderB
      })
    })
    
    setCategorizedProducts(grouped)
  }

  // Filter products based on search
  const getFilteredCategories = () => {
    if (!searchQuery.trim()) {
      return categorizedProducts
    }

    const query = searchQuery.toLowerCase()
    const filtered = {}

    Object.keys(categorizedProducts).forEach(category => {
      const matchingProducts = categorizedProducts[category].filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        category.toLowerCase().includes(query)
      )

      if (matchingProducts.length > 0) {
        filtered[category] = matchingProducts
      }
    })

    return filtered
  }

  const handleAddToCart = (product) => {
    addToCart(product)
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  return (
    <>
      <Head>
        <title>Shop — ScentLumus</title>
        <meta name="description" content="Shop luxury fragrances at ScentLumus" />
      </Head>
      
      <div className="min-h-screen bg-white">
        {/* Add to Cart Notification */}
        {addedToCart && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-8 py-4 rounded-lg shadow-2xl z-50 flex items-center space-x-2 animate-fade-in">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-semibold text-lg">Added to cart!</span>
          </div>
        )}

        {/* Simple Clean Header */}
        <header className="border-b bg-white sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div>
                <Link href="/" className="text-xl font-bold text-amber-900">
                  SCENTLUMUS
                </Link>
                <p className="text-xs text-gray-500">destination for luxury fragrances</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <Link href="/cart" className="relative">
                  <svg className="w-6 h-6 text-gray-700 hover:text-amber-900 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  {getCartCount() > 0 && (
                    <span className="absolute -top-2 -right-2 bg-amber-700 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {getCartCount()}
                    </span>
                  )}
                </Link>
                
                {/* Hamburger Menu Button */}
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="p-2 text-gray-700 hover:text-purple-600 transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Dropdown Menu */}
        {menuOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setMenuOpen(false)}>
            <div className="absolute top-0 right-0 bg-white w-64 h-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="p-4">
                <button
                  onClick={() => setMenuOpen(false)}
                  className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                
                <nav className="mt-12 space-y-4">
                  <Link href="/" className="block text-lg text-gray-700 hover:text-amber-900 transition">
                    Home
                  </Link>
                  <Link href="/about" className="block text-lg text-gray-700 hover:text-amber-900 transition">
                    About us
                  </Link>
                  <Link href="/contact" className="block text-lg text-gray-700 hover:text-amber-900 transition">
                    Contact us
                  </Link>
                  {user ? (
                    <>
                      <Link href="/profile" className="block text-lg text-gray-700 hover:text-amber-900 transition">
                        My Profile
                      </Link>
                      <Link href="/profile" className="block text-lg text-gray-700 hover:text-amber-900 transition">
                        My Orders
                      </Link>
                    </>
                  ) : (
                    <Link href="/signin" className="block text-lg text-gray-700 hover:text-amber-900 transition">
                      Login
                    </Link>
                  )}
                </nav>
              </div>
            </div>
          </div>
        )}

        {/* Breadcrumb */}
        <div className="border-b bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="text-sm text-gray-600">
              <Link href="/" className="hover:text-amber-900">Home</Link>
              <span className="mx-2">/</span>
              <span className="text-gray-900">Shop</span>
            </div>
          </div>
        </div>

        {/* Shop Header */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Shop</h1>
              <p className="text-sm text-gray-600">Showing all {products.length} results</p>
            </div>
            
            <div className="hidden sm:block">
              <select className="border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700">
                <option>Default sorting</option>
                <option>Sort by price: low to high</option>
                <option>Sort by price: high to low</option>
                <option>Sort by latest</option>
              </select>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative max-w-2xl">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search perfumes by name, description, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No products available yet.</p>
            </div>
          ) : (
            Object.keys(getFilteredCategories()).length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  {searchQuery ? 'No products found matching your search.' : 'No products available yet.'}
                </p>
              </div>
            ) : (
              <div className="space-y-12">
                {(() => {
                  const filtered = getFilteredCategories()
                  // Use category order from admin, fallback to sorted keys for uncategorized
                  const orderedCategories = categoryOrder.filter(cat => filtered[cat])
                  const remainingCategories = Object.keys(filtered).filter(cat => !categoryOrder.includes(cat))
                  return [...orderedCategories, ...remainingCategories.sort()]
                })().map((category) => (
                  <div key={category} className="category-section">
                    {/* Category Header with Underline */}
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-amber-700 inline-block">
                      {category}
                    </h2>
                    
                    {/* Horizontal Scrolling Product Row */}
                    <div className="relative">
                      <div className="overflow-x-auto pb-4" style={{ scrollbarWidth: 'thin' }}>
                        <div className="flex gap-6" style={{ scrollBehavior: 'smooth' }}>
                          {getFilteredCategories()[category].map((product) => (
                            <div key={product.id} className="flex-none w-64 group relative">
                              {/* Favorite button */}
                              <button
                                aria-label={wishlist.includes(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                                onClick={() => toggleWishlist(product.id)}
                                className="absolute top-2 right-2 z-10 bg-white/80 rounded-full p-1 hover:bg-amber-100"
                                style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill={wishlist.includes(product.id) ? 'currentColor' : 'none'}
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  className={wishlist.includes(product.id) ? 'w-6 h-6 text-amber-600' : 'w-6 h-6 text-gray-400'}
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
                                </svg>
                              </button>
                              <Link href={`/product/${product.id}`} className="block">
                                <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                                  <div className="bg-gray-100 rounded-t-lg overflow-hidden aspect-[4/3]">
                                    {product.image ? (
                                      <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full object-cover group-hover:scale-105 transition duration-300 rounded-lg"
                                        style={{ aspectRatio: '4/3', height: 'auto' }}
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                      </div>
                                    )}
                                  </div>
                                  <div className="p-3">
                                    <h3 className="text-base font-semibold text-gray-800 mb-1 truncate">
                                      {product.name}
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-2 line-clamp-2 h-10">
                                      {product.description}
                                    </p>
                                    <div className="mb-2">
                                      {product.oldPrice && parseFloat(product.oldPrice) > 0 && (
                                        <div className="text-xs text-gray-500 line-through mb-0.5">
                                          NGN {parseFloat(product.oldPrice).toLocaleString()}
                                        </div>
                                      )}
                                      <div className="text-lg font-bold text-amber-900">
                                        NGN {parseFloat(product.price).toLocaleString()}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </Link>
                              <div className="flex items-center justify-between mt-2">
                                <button
                                  onClick={() => handleAddToCart(product)}
                                  className="bg-amber-700 text-white px-3 py-1.5 rounded-md hover:bg-amber-800 transition text-sm font-medium whitespace-nowrap w-full"
                                >
                                  Add to Cart
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </section>

        {/* Footer with Social Media */}
        <footer className="bg-gray-900 text-white py-12 mt-16">
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
                  <li><Link href="/" className="text-gray-400 hover:text-white transition">Shop</Link></li>
                  <li><Link href="/about" className="text-gray-400 hover:text-white transition">About us</Link></li>
                  <li><Link href="/contact" className="text-gray-400 hover:text-white transition">Contact us</Link></li>
                  <li><Link href="/faq" className="text-gray-400 hover:text-white transition">FAQ</Link></li>
                  <li><Link href="/profile" className="text-gray-400 hover:text-white transition">My Orders</Link></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
                <div className="flex space-x-4">
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
