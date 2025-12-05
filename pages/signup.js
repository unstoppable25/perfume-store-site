import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Head from 'next/head'

export default function SignUp() {
  const router = useRouter()
  const [step, setStep] = useState(1) // 1: form, 2: email verification
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  const [verificationCode, setVerificationCode] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      // First, check if email already exists
      const checkRes = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      })

      const checkData = await checkRes.json()

      if (checkData.exists) {
        setError('Email already registered. Please sign in.')
        setLoading(false)
        return
      }

      // Send verification email (don't create account yet)
      const verifyRes = await fetch('/api/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      })

      if (verifyRes.ok) {
        setSuccess('Verification code sent! Check your email.')
        setStep(2) // Move to verification step
      } else {
        setError('Failed to send verification code. Please try again.')
      }
    } catch (err) {
      setError('Failed to sign up. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      // First verify the code
      const verifyRes = await fetch('/api/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          code: verificationCode
        })
      })

      const verifyData = await verifyRes.json()

      if (!verifyRes.ok) {
        setError(verifyData.message || 'Invalid verification code')
        setLoading(false)
        return
      }

      // Code is valid, NOW create the account
      const signupRes = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password
        })
      })

      const signupData = await signupRes.json()

      if (signupRes.ok) {
        // Account created successfully, log them in
        sessionStorage.setItem('user_authenticated', 'true')
        sessionStorage.setItem('user_data', JSON.stringify(signupData.user))
        setSuccess('Email verified! Account created. Redirecting...')
        setTimeout(() => router.push('/'), 1500)
      } else {
        setError(signupData.message || 'Failed to create account')
      }
    } catch (err) {
      setError('Verification failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const res = await fetch('/api/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      })

      if (res.ok) {
        setSuccess('New verification code sent!')
      } else {
        setError('Failed to resend code')
      }
    } catch (err) {
      setError('Failed to resend code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Sign Up — ScentLumus</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center px-4 py-8">
        <div className="max-w-md w-full">
          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <Link href="/" className="text-4xl font-bold text-amber-900">
              ScentLumus
            </Link>
            <p className="text-gray-600 mt-2">Create your account</p>
          </div>

          {/* Sign Up Form */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            {step === 1 ? (
              <>
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Sign Up</h1>

                {error && (
                  <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-lg text-sm">
                    {success}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="John"
                      />
                    </div>

                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="+234 123 456 7890"
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="At least 6 characters"
                    />
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Re-enter your password"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-amber-700 hover:bg-amber-800 text-white py-3 rounded-lg font-semibold transition duration-300 disabled:opacity-50"
                  >
                    {loading ? 'Creating Account...' : 'Sign Up'}
                  </button>
                </form>

                {/* Sign In Link */}
                <div className="mt-6 text-center">
                  <p className="text-gray-600">
                    Already have an account?{' '}
                    <Link href="/signin" className="text-amber-700 hover:text-amber-800 font-semibold">
                      Sign In
                    </Link>
                  </p>
                </div>

                {/* Divider */}
                <div className="mt-6 mb-6 flex items-center">
                  <div className="flex-1 border-t border-gray-300"></div>
                  <span className="px-4 text-sm text-gray-500">OR</span>
                  <div className="flex-1 border-t border-gray-300"></div>
                </div>

                {/* Guest Checkout */}
                <Link
                  href="/"
                  onClick={(e) => {
                    e.preventDefault()
                    sessionStorage.setItem('user_authenticated', 'guest')
                        sessionStorage.setItem('user_data', JSON.stringify({ firstName: 'Guest', email: 'guest@guest.com' }))
                    window.location.href = '/'
                  }}
                  className="block w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold transition duration-300"
                >
                  Continue as Guest
                </Link>
              </>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
                    <svg className="w-8 h-8 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-800 mb-2">Verify Your Email</h1>
                  <p className="text-gray-600 text-sm">
                    We sent a 6-digit code to <span className="font-semibold">{formData.email}</span>
                  </p>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-lg text-sm">
                    {success}
                  </div>
                )}

                <form onSubmit={handleVerifyCode} className="space-y-6">
                  <div>
                    <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2 text-center">
                      Enter Verification Code
                    </label>
                    <input
                      type="text"
                      id="code"
                      value={verificationCode}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                        setVerificationCode(value)
                      }}
                      maxLength="6"
                      required
                      className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-center text-3xl tracking-[1em] font-mono font-semibold"
                      placeholder="000000"
                      autoFocus
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || verificationCode.length !== 6}
                    className="w-full bg-amber-700 hover:bg-amber-800 text-white py-3 rounded-lg font-semibold transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Verifying...' : 'Verify Email'}
                  </button>
                </form>

                <div className="mt-6 flex items-center justify-between text-sm">
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={loading}
                    className="text-amber-700 hover:text-amber-800 font-semibold disabled:opacity-50"
                  >
                    Resend Code
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1)
                      setVerificationCode('')
                      setError('')
                      setSuccess('')
                    }}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    ← Back
                  </button>
                </div>

                <div className="mt-6 p-4 bg-amber-50 rounded-lg">
                  <p className="text-xs text-gray-600 text-center">
                    Code expires in 10 minutes. Check your spam folder if you don't see it.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
