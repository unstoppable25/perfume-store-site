import { getAllMessages, deleteMessage } from '../../lib/db'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const messages = await getAllMessages()
      return res.status(200).json({ success: true, messages })
    } catch (err) {
      console.error('Get messages error:', err)
      return res.status(500).json({ success: false, message: 'Failed to fetch messages' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.body
      if (!id) {
        return res.status(400).json({ success: false, message: 'Message ID is required' })
      }
      
      await deleteMessage(id)
      return res.status(200).json({ success: true, message: 'Message deleted successfully' })
    } catch (err) {
      console.error('Delete message error:', err)
      return res.status(500).json({ success: false, message: 'Failed to delete message' })
    }
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' })
}
