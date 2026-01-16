import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function SecureGate() {
  const [securityId, setSecurityId] = useState('')
  const [error, setError] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [lockedUntil, setLockedUntil] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('admin_gate_passed')
    if (isAuthenticated === 'true') {
      router.push('/admin')
      return
    }

    const lockoutData = localStorage.getItem('admin_lockout')
    if (lockoutData) {
      try {
        const parsed = JSON.parse(lockoutData)
        const now = Date.now()
        
        if (now < parsed.until) {
          setLockedUntil(parsed.until)
          setAttempts(parsed.count)
        } else {
          localStorage.removeItem('admin_lockout')
        }
      } catch (err) {
        localStorage.removeItem('admin_lockout')
      }
    }
  }, [router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (lockedUntil && Date.now() < lockedUntil) {
      const remainingMinutes = Math.ceil((lockedUntil - Date.now()) / 60000)
      setError('Too many failed attempts. Locked out for ' + remainingMinutes + ' more minute(s).')
      return
    }

    try {
      const res = await fetch('/api/verify-gate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ securityId })
      })

      const data = await res.json()

      if (data.success) {
        // Generate session token with expiration (24 hours)
        const token = 'admin_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
        const expiresAt = Date.now() + (24 * 60 * 60 * 1000) // 24 hours

        localStorage.removeItem('admin_lockout')
        localStorage.setItem('admin_gate_passed', 'true')
        localStorage.setItem('admin_api_key', token)
        localStorage.setItem('admin_token_data', JSON.stringify({
          token,
          expiresAt,
          createdAt: Date.now()
        }))

        console.log('[SECURITY] Admin session created, expires at:', new Date(expiresAt).toISOString())
        router.push('/admin')
      } else {
        const newAttempts = attempts + 1
        setAttempts(newAttempts)
        
        if (newAttempts >= 10) {
          const lockoutUntil = Date.now() + (30 * 60 * 1000)
          localStorage.setItem('admin_lockout', JSON.stringify({
            until: lockoutUntil,
            count: newAttempts
          }))
          setLockedUntil(lockoutUntil)
          setError('Maximum attempts exceeded. Locked out for 30 minutes.')
        } else {
          setError('Invalid Security ID. ' + (10 - newAttempts) + ' attempt(s) remaining.')
        }
        
        setSecurityId('')
      }
    } catch (err) {
      setError('Security verification failed. Please try again.')
    }
  }

  return (
    <>
      <Head>
        <title>Secure Access</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-amber-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Security Gate</h1>
            <p className="text-gray-400 text-sm">Enter your Security ID to proceed</p>
          </div>

          {lockedUntil && Date.now() < lockedUntil ? (
            <div className="bg-red-900 bg-opacity-50 border border-red-700 rounded p-4 text-center">
              <svg className="w-12 h-12 text-red-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-red-400 font-semibold mb-2">Access Locked</p>
              <p className="text-red-300 text-sm">
                Too many failed attempts. Please wait {Math.ceil((lockedUntil - Date.now()) / 60000)} minute(s).
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <input
                  type="password"
                  placeholder="Security ID"
                  value={securityId}
                  onChange={(e) => setSecurityId(e.target.value)}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                  required
                  autoFocus
                />
              </div>

              {error && (
                <div className="bg-red-900 bg-opacity-30 border border-red-700 rounded p-3 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-amber-600 text-white py-3 rounded font-semibold hover:bg-amber-700 transition-colors"
              >
                Verify Access
              </button>

              {attempts > 0 && attempts < 10 && (
                <p className="text-center text-gray-500 text-xs">
                  {attempts} / 10 attempts used
                </p>
              )}
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-gray-700 text-center">
            <p className="text-gray-500 text-xs">
              Unauthorized access attempts are logged and monitored.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
