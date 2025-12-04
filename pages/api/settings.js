import { getSettings, updateSettings } from '../../lib/db'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const settings = await getSettings()
      res.status(200).json({ success: true, settings })
    } catch (err) {
      console.error('Failed to get settings:', err)
      res.status(500).json({ success: false, message: 'Failed to get settings' })
    }
  } else if (req.method === 'POST') {
    try {
      const { key, value } = req.body
      await updateSettings(key, value)
      res.status(200).json({ success: true })
    } catch (err) {
      console.error('Failed to update settings:', err)
      res.status(500).json({ success: false, message: 'Failed to update settings' })
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}
