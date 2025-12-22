import { createClient } from '@vercel/kv';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const REVIEWS_FILE = path.join(DATA_DIR, 'reviews.json');

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(REVIEWS_FILE)) {
    fs.writeFileSync(REVIEWS_FILE, '[]');
  }
}

async function getKV() {
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    return createClient({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    });
  }
  return null;
}

async function readReviews() {
  const kv = await getKV();
  if (kv) {
    const reviews = await kv.get('reviews');
    return Array.isArray(reviews) ? reviews : [];
  } else {
    ensureDataFile();
    const raw = fs.readFileSync(REVIEWS_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  }
}

async function writeReviews(reviews) {
  const kv = await getKV();
  if (kv) {
    await kv.set('reviews', reviews);
  } else {
    ensureDataFile();
    fs.writeFileSync(REVIEWS_FILE, JSON.stringify(reviews, null, 2));
  }
}

export default async function handler(req, res) {
  console.log('API /api/reviews received:', req.method, req.url);
    console.log('API /api/reviews TOP LOG:', {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body
    });
  if (req.method !== 'GET') {
    let body = '';
    try {
      body = JSON.stringify(req.body);
    } catch (e) {
      body = 'unreadable';
    }
    console.log('Request body:', body);
  }
  if (req.method === 'GET') {
    const { productId } = req.query;
    const reviews = await readReviews();
    const filtered = productId ? reviews.filter(r => String(r.productId) === String(productId)) : reviews;
    return res.status(200).json({ reviews: filtered });
  }
  if (req.method === 'POST') {
    const { productId, rating, comment } = req.body;
    if (!productId || !rating || !comment) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const reviews = await readReviews();
    const newReview = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2),
      productId,
      rating: Math.max(1, Math.min(5, parseInt(rating, 10))),
      comment: comment.trim(),
      createdAt: new Date().toISOString(),
      hidden: false,
      featured: false,
      response: '',
    };
    reviews.push(newReview);
    await writeReviews(reviews);
    return res.status(201).json({ review: newReview });
  }
  if (req.method === 'PUT') {
    // Edit a review by id
    const { id, rating, comment, hidden, featured, response } = req.body;
    if (!id) return res.status(400).json({ message: 'Missing review id' });
    const reviews = await readReviews();
    const idx = reviews.findIndex(r => r.id === id);
    if (idx === -1) return res.status(404).json({ message: 'Review not found' });
    if (rating !== undefined) reviews[idx].rating = Math.max(1, Math.min(5, parseInt(rating, 10)));
    if (comment !== undefined) reviews[idx].comment = comment.trim();
    if (hidden !== undefined) reviews[idx].hidden = !!hidden;
    if (featured !== undefined) reviews[idx].featured = !!featured;
    if (response !== undefined) reviews[idx].response = response;
    await writeReviews(reviews);
    return res.status(200).json({ review: reviews[idx] });
  }
  if (req.method === 'DELETE') {
    // Delete a review by id
    const { id } = req.body;
    if (!id) return res.status(400).json({ message: 'Missing review id' });
    const reviews = await readReviews();
    const idx = reviews.findIndex(r => r.id === id);
    if (idx === -1) return res.status(404).json({ message: 'Review not found' });
    const deleted = reviews.splice(idx, 1);
    await writeReviews(reviews);
    return res.status(200).json({ deleted: deleted[0] });
  }
  res.status(405).json({
    message: `Method not allowed: ${req.method}`,
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body
  });
}
