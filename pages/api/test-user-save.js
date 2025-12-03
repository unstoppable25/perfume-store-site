import { createClient } from '@vercel/kv'

export default async function handler(req, res) {
  try {
    console.log('=== TEST USER SAVE START ===')
    
    // Initialize KV directly (not using the cached one)
    const kv = createClient({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    })
    console.log('KV client created:', !!kv)

    // Create test user
    const testUser = {
      id: 'USER-TEST-' + Date.now(),
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      phone: '1234567890',
      password: 'testpass',
      createdAt: new Date().toISOString()
    }
    console.log('Test user created:', testUser.id)

    // Save to KV using hset
    console.log('Attempting hset...')
    await kv.hset('users', { [testUser.id]: JSON.stringify(testUser) })
    console.log('User saved to KV hash')

    // Retrieve all users from hash
    console.log('Attempting hgetall...')
    const allUsers = await kv.hgetall('users')
    console.log('Retrieved from KV:', allUsers ? Object.keys(allUsers).length + ' users' : 'null')

    if (allUsers) {
      console.log('User IDs in hash:', Object.keys(allUsers))
    }

    // Try to find our test user
    let foundUser = null
    if (allUsers && allUsers[testUser.id]) {
      foundUser = JSON.parse(allUsers[testUser.id])
      console.log('Found our test user:', foundUser.email)
    }

    console.log('=== TEST USER SAVE END ===')

    return res.status(200).json({
      success: true,
      testUser: testUser,
      allUsersCount: allUsers ? Object.keys(allUsers).length : 0,
      foundUser: foundUser,
      allUserIds: allUsers ? Object.keys(allUsers) : []
    })

  } catch (err) {
    console.error('Test error:', err.message, err.stack)
    return res.status(500).json({
      success: false,
      error: err.message,
      stack: err.stack
    })
  }
}
