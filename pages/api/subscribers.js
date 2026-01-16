import { getAllSubscribers, deleteSubscriber } from '../../lib/db'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const subscribers = await getAllSubscribers()
      return res.status(200).json({ success: true, subscribers })
    } catch (err) {
      console.error('Get subscribers error:', err)
      return res.status(500).json({ success: false, message: 'Failed to fetch subscribers' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.body
      if (!id) {
        return res.status(400).json({ success: false, message: 'Subscriber ID is required' })
      }
      
      await deleteSubscriber(id)
      return res.status(200).json({ success: true, message: 'Subscriber deleted successfully' })
    } catch (err) {
      console.error('Delete subscriber error:', err)
      return res.status(500).json({ success: false, message: 'Failed to delete subscriber' })
    }
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' })
}
