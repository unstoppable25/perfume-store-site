import { put } from '@vercel/blob'

let cloudinary = null
let cloudinaryInitialized = false

async function initCloudinary() {
  if (cloudinaryInitialized) return
  cloudinaryInitialized = true

  try {
    const cloudinaryModule = await import('cloudinary')
    cloudinary = cloudinaryModule.v2

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    })
  } catch (err) {
    console.error('Cloudinary import failed:', err.message)
  }
}

function sanitizeFilename(filename) {
  return (filename || 'upload').replace(/\s+/g, '-').replace(/[^a-zA-Z0-9._-]/g, '-')
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}

export default async function handler(req, res) {
  await initCloudinary()

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end('Method Not Allowed')
  }

  const requireAdmin = (await import('../../lib/requireAdmin')).default
  if (!requireAdmin(req, res)) return

  const { filename, data } = req.body || {}
  if (!filename || !data) return res.status(400).json({ message: 'filename and data are required' })

  try {
    const mimeMatch = data.match(/^data:(.+);base64,/) || []
    const contentType = mimeMatch[1] || 'application/octet-stream'
    const matches = data.match(/^data:(.+);base64,(.*)$/)
    const base64 = matches ? matches[2] : data
    const buffer = Buffer.from(base64, 'base64')

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blobName = `${Date.now()}-${sanitizeFilename(filename)}`
      console.log('Uploading to Vercel Blob...', blobName)
      const blob = await put(blobName, buffer, {
        access: 'public',
        contentType,
      })
      console.log('Vercel Blob upload successful:', blob.url)
      return res.status(201).json({ url: blob.url })
    }

    const cloudinaryConfigured = cloudinary &&
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET

    console.log('Cloudinary module loaded:', !!cloudinary)
    console.log('Cloudinary configured:', cloudinaryConfigured)

    if (cloudinaryConfigured) {
      console.log('Attempting Cloudinary upload...')
      // create eager (stored) responsive variants to avoid on-the-fly transforms
      const widths = [320, 640, 960, 1280, 1600]
      const eager = widths.map(w => ({ width: w, crop: 'scale', fetch_format: 'auto', quality: 'auto' }))

      const result = await cloudinary.uploader.upload(data, {
        folder: 'scentlumus',
        public_id: sanitizeFilename(filename).split('.')[0],
        resource_type: 'auto',
        eager: eager.map(transformation => ({
          ...transformation,
          flags: 'lossy'
        })),
        eager_async: false
      })

      const optimizeUrl = url => url?.replace('/upload/', '/upload/f_auto,q_auto,fl_lossy/')
      const url = optimizeUrl(result.secure_url)
      const variants = (result.eager || []).map(e => optimizeUrl(e.secure_url)).filter(Boolean)
      console.log('Upload successful:', url)
      return res.status(201).json({ url, variants })
    }

    const fs = require('fs')
    const path = require('path')
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })

    const filePath = path.join(uploadsDir, sanitizeFilename(filename))
    fs.writeFileSync(filePath, buffer)

    const urlPath = `/uploads/${sanitizeFilename(filename)}`
    return res.status(201).json({ url: urlPath })
  } catch (err) {
    console.error('Upload error', err)
    return res.status(500).json({
      message: 'Upload failed',
      error: err.message,
      stack: err.stack,
      storageConfig: {
        blobConfigured: !!process.env.BLOB_READ_WRITE_TOKEN,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME ? 'SET' : 'NOT SET',
        apiKey: process.env.CLOUDINARY_API_KEY ? 'SET' : 'NOT SET',
        apiSecret: process.env.CLOUDINARY_API_SECRET ? 'SET' : 'NOT SET',
      },
    })
  }
}
