/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Increase API body size limit for image uploads
    },
  },
}

module.exports = nextConfig
