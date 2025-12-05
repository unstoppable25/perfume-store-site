import { useState } from 'react'
import Link from 'next/link'
import Head from 'next/head'
import { useRouter } from 'next/router'

export default function ForgotPassword() {
  const router = useRouter()
  const [step, setStep] = useState(1) // 1: email, 2: code & new password
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSendCode = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const res = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess('Reset code sent! Check your email.')
        setStep(2)
      } else {
        setError(data.message || 'Failed to send reset code')
      }
    } catch (err) {
      setError('Failed to send reset code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword })
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess('Password reset successfully! Redirecting to sign in...')
        setTimeout(() => {
          router.push('/signin')
        }, 2000)
      } else {
        setError(data.message || 'Failed to reset password')
      }
    } catch (err) {
      setError('Failed to reset password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Forgot Password — ScentLumus</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <Link href="/" className="text-4xl font-bold text-amber-900">
              ScentLumus
            </Link>
            <p className="text-gray-600 mt-2">Reset your password</p>
          </div>

          {/* Reset Password Form */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
              {step === 1 ? 'Forgot Password' : 'Reset Password'}
            </h1>

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

            {step === 1 ? (
              <form onSubmit={handleSendCode} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="your@email.com"
                    required
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    We'll send a 6-digit reset code to this email
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-amber-700 hover:bg-amber-800 text-white py-3 rounded-lg font-semibold transition duration-300 disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send Reset Code'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    id="code"
                    name="code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-transparent text-center text-2xl tracking-widest font-mono"
                    placeholder="000000"
                    maxLength="6"
                    required
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Enter the 6-digit code sent to {email}
                  </p>
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-800">
                      📧 <strong>Tip:</strong> Check your spam/junk folder if you don't see the email
                    </p>
                  </div>
                </div>

                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="••••••••"
                    required
                    minLength="6"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="••••••••"
                    required
                    minLength="6"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-amber-700 hover:bg-amber-800 text-white py-3 rounded-lg font-semibold transition duration-300 disabled:opacity-50"
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep(1)
                    setCode('')
                    setNewPassword('')
                    setConfirmPassword('')
                    setError('')
                    setSuccess('')
                  }}
                  className="w-full text-center text-sm text-gray-600 hover:text-gray-800 py-2"
                >
                  ← Back to email
                </button>
              </form>
            )}

            {/* Back to Sign In */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Remember your password?{' '}
                <Link href="/signin" className="text-amber-700 hover:text-amber-800 font-semibold">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
