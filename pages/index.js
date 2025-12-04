import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'

export default function Home() {
  const router = useRouter()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const userAuth = sessionStorage.getItem('user_authenticated')
    const userData = sessionStorage.getItem('user_data')
    
    if (userAuth === 'true' && userData) {
      setUser(JSON.parse(userData))
    }
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
      
      <div className="min-h-screen bg-gradient-to-r from-purple-600 to-pink-600 text-white flex flex-col">
        {/* Simple Header - Just logo */}
        <header className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl font-bold">SCENTLUMUS</h1>
          </div>
        </header>

        {/* Hero Section - Centered content */}
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-16">
              WELCOME TO THE HOUSE OF SCENTLUMUS
            </h2>
            
            <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
              <Link 
                href="/shop" 
                className="inline-block bg-white text-purple-600 px-20 py-6 rounded-md text-2xl font-bold hover:bg-gray-100 transition shadow-lg min-w-[200px]"
              >
                Shop
              </Link>
              
              <Link 
                href="/about" 
                className="inline-block bg-transparent border-4 border-white text-white px-20 py-6 rounded-md text-2xl font-bold hover:bg-white hover:text-purple-600 transition shadow-lg min-w-[200px]"
              >
                About us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
