import { getSettings, updateSettings } from '../../lib/db'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const settings = await getSettings()
      console.log('GET /api/settings - Retrieved settings:', settings)
      res.status(200).json({ success: true, settings })
    } catch (err) {
      console.error('Failed to get settings:', err)
      res.status(500).json({ success: false, message: 'Failed to get settings', error: err.message })
    }
  } else if (req.method === 'POST') {
    try {
      const { key, value } = req.body
      console.log('POST /api/settings - Saving:', { key, value: value?.substring(0, 50) + '...' })
      const updatedSettings = await updateSettings(key, value)
      console.log('POST /api/settings - Settings saved successfully')
      res.status(200).json({ success: true, settings: updatedSettings })
    } catch (err) {
      console.error('Failed to update settings:', err)
      res.status(500).json({ success: false, message: 'Failed to update settings', error: err.message })
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}
