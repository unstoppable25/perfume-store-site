let cloudinary = null

try {
  const cloudinaryModule = await import('cloudinary')
  cloudinary = cloudinaryModule.v2
  
  // Configure Cloudinary (uses env vars)
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })
} catch (err) {
  console.error('Cloudinary import failed:', err.message)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end('Method Not Allowed')
  }

  const { filename, data } = req.body || {}
  if (!filename || !data) return res.status(400).json({ message: 'filename and data are required' })

  try {
    // Check if Cloudinary is configured and loaded
    const cloudinaryConfigured = cloudinary && 
                                  process.env.CLOUDINARY_CLOUD_NAME && 
                                  process.env.CLOUDINARY_API_KEY && 
                                  process.env.CLOUDINARY_API_SECRET

    console.log('Cloudinary module loaded:', !!cloudinary)
    console.log('Cloudinary configured:', cloudinaryConfigured)
    console.log('Cloud name:', process.env.CLOUDINARY_CLOUD_NAME)

    if (cloudinaryConfigured) {
      // Upload to Cloudinary
      console.log('Attempting Cloudinary upload...')
      const result = await cloudinary.uploader.upload(data, {
        folder: 'scentlumus', // organize uploads in a folder
        public_id: filename.split('.')[0], // use filename without extension
        resource_type: 'auto', // auto-detect image/video/raw
      })
      
      console.log('Upload successful:', result.secure_url)
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
    return res.status(500).json({ 
      message: 'Upload failed', 
      error: err.message,
      stack: err.stack,
      cloudinaryConfig: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME ? 'SET' : 'NOT SET',
        apiKey: process.env.CLOUDINARY_API_KEY ? 'SET' : 'NOT SET',
        apiSecret: process.env.CLOUDINARY_API_SECRET ? 'SET' : 'NOT SET'
      }
    })
  }
}
