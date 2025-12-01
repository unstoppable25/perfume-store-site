import fs from 'fs'
import path from 'path'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end('Method Not Allowed')
  }

  const { filename, data } = req.body || {}
  if (!filename || !data) return res.status(400).json({ message: 'filename and data are required' })

  try {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })

    // data is expected to be a base64 data URL or plain base64 string
    const matches = data.match(/^data:(.+);base64,(.*)$/)
    const base64 = matches ? matches[2] : data

    const filePath = path.join(uploadsDir, filename)
    fs.writeFileSync(filePath, Buffer.from(base64, 'base64'))

    const urlPath = `/uploads/${filename}`
    return res.status(201).json({ url: urlPath })
  } catch (err) {
    console.error('Upload error', err)
    return res.status(500).json({ message: 'Upload failed' })
  }
}
