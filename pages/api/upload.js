import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary (uses env vars)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end('Method Not Allowed')
  }

  const { filename, data } = req.body || {}
  if (!filename || !data) return res.status(400).json({ message: 'filename and data are required' })

  try {
    // Check if Cloudinary is configured
    const cloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && 
                                  process.env.CLOUDINARY_API_KEY && 
                                  process.env.CLOUDINARY_API_SECRET

    if (cloudinaryConfigured) {
      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(data, {
        folder: 'scentlumus', // organize uploads in a folder
        public_id: filename.split('.')[0], // use filename without extension
        resource_type: 'auto', // auto-detect image/video/raw
      })
      
      return res.status(201).json({ url: result.secure_url })
    } else {
      // Fallback to local filesystem (for local dev)
      const fs = require('fs')
      const path = require('path')
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })

      const matches = data.match(/^data:(.+);base64,(.*)$/)
      const base64 = matches ? matches[2] : data

      const filePath = path.join(uploadsDir, filename)
      fs.writeFileSync(filePath, Buffer.from(base64, 'base64'))

      const urlPath = `/uploads/${filename}`
      return res.status(201).json({ url: urlPath })
    }
  } catch (err) {
    console.error('Upload error', err)
    return res.status(500).json({ message: 'Upload failed', error: err.message })
  }
}
