export function getOptimizedImageUrl(url) {
  if (!url || typeof url !== 'string') return url
  if (!url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url
  if (url.includes('/upload/f_auto,q_auto,fl_lossy/')) return url
  return url.replace('/upload/', '/upload/f_auto,q_auto,fl_lossy/')
}
