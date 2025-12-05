import { useState } from 'react'
import Head from 'next/head'

export default function TestEmail() {
  const [email, setEmail] = useState('')
  const [type, setType] = useState('verification')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleTest = async (e) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      const res = await fetch('/api/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type })
      })

      const data = await res.json()
      setResult(data)
    } catch (err) {
      setResult({ success: false, message: 'Request failed' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Test Email - ScentLumus</title>
      </Head>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Test Email System</h1>

          <form onSubmit={handleTest} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              >
                <option value="verification">Email Verification</option>
                <option value="reset">Password Reset</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-700 text-white py-3 rounded-lg font-semibold hover:bg-amber-800 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Test Email'}
            </button>
          </form>

          {result && (
            <div className={`mt-6 p-4 rounded-lg ${
              result.success 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              <p className="font-semibold">
                {result.success ? '✓ Success!' : '✗ Failed'}
              </p>
              <p className="text-sm mt-1">{result.message}</p>
              {result.messageId && (
                <p className="text-xs mt-2">Message ID: {result.messageId}</p>
              )}
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm text-blue-900">
            <p className="font-semibold mb-2">📧 Note:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Test code will be: <strong>123456</strong></li>
              <li>Check your spam/junk folder</li>
              <li>Email from: onboarding@resend.dev</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}
