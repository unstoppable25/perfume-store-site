import { createClient } from '@vercel/kv';

export default async function handler(req, res) {
  // Require user to be authenticated
  const userId = req.query.userId || req.body?.userId;
  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  const kv = createClient({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
  });
  const key = `wishlist:${userId}`;

  if (req.method === 'GET') {
    const wishlist = await kv.get(key);
    return res.status(200).json({ wishlist: Array.isArray(wishlist) ? wishlist : [] });
  }

  if (req.method === 'POST') {
    const { wishlist } = req.body;
    if (!Array.isArray(wishlist)) {
      return res.status(400).json({ message: 'Invalid wishlist' });
    }
    await kv.set(key, wishlist);
    return res.status(200).json({ wishlist });
  }

  res.status(405).json({ message: 'Method not allowed' });
}
