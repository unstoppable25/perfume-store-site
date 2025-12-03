import { createClient } from '@vercel/kv'

export default async function handler(req, res) {
  const results = {
    step1_env: {},
    step2_client: {},
    step3_set: {},
    step4_get: {},
    step5_hset: {},
    step6_hgetall: {},
  }

  try {
    // Step 1: Check environment variables
    results.step1_env = {
      hasKVUrl: !!process.env.KV_REST_API_URL,
      hasKVToken: !!process.env.KV_REST_API_TOKEN,
      url: process.env.KV_REST_API_URL,
    }

    // Step 2: Create client
    const kv = createClient({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    })
    results.step2_client = {
      success: !!kv,
      type: typeof kv,
    }

    // Step 3: Test simple SET operation
    try {
      await kv.set('test:simple', 'Hello KV')
      results.step3_set.success = true
    } catch (err) {
      results.step3_set.error = err.message
      results.step3_set.success = false
    }

    // Step 4: Test simple GET operation
    try {
      const value = await kv.get('test:simple')
      results.step4_get = {
        success: true,
        value: value,
      }
    } catch (err) {
      results.step4_get.error = err.message
      results.step4_get.success = false
    }

    // Step 5: Test HSET operation (hash set - what we use for users)
    try {
      await kv.hset('test:hash', { field1: 'value1', field2: 'value2' })
      results.step5_hset.success = true
    } catch (err) {
      results.step5_hset.error = err.message
      results.step5_hset.success = false
    }

    // Step 6: Test HGETALL operation (hash get all)
    try {
      const hash = await kv.hgetall('test:hash')
      results.step6_hgetall = {
        success: true,
        value: hash,
      }
    } catch (err) {
      results.step6_hgetall.error = err.message
      results.step6_hgetall.success = false
    }

    // Clean up test data
    try {
      await kv.del('test:simple')
      await kv.del('test:hash')
    } catch (err) {
      // Ignore cleanup errors
    }

    return res.status(200).json({
      success: true,
      message: 'KV test completed',
      results,
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'KV test failed',
      error: err.message,
      stack: err.stack,
      results,
    })
  }
}
