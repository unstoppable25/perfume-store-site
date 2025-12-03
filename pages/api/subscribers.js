import { getAllSubscribers } from '../../lib/db'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  try {
    const subscribers = await getAllSubscribers()
    return res.status(200).json({ success: true, subscribers })
  } catch (err) {
    console.error('Get subscribers error:', err)
    return res.status(500).json({ success: false, message: 'Failed to fetch subscribers' })
  }
}
