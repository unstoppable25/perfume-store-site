import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const REVIEWS_FILE = path.join(DATA_DIR, 'reviews.json');

async function ensureReviewsFile() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.access(REVIEWS_FILE);
  } catch {
    await fs.writeFile(REVIEWS_FILE, '[]');
  }
}

async function readReviews() {
  await ensureReviewsFile();
  const raw = await fs.readFile(REVIEWS_FILE, 'utf8');
  return JSON.parse(raw || '[]');
}

async function writeReviews(reviews) {
  await ensureReviewsFile();
  await fs.writeFile(REVIEWS_FILE, JSON.stringify(reviews, null, 2));
}

export default async function handler(req, res) {
  console.log('API /api/reviews called with method:', req.method);
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
      productId,
      rating: Math.max(1, Math.min(5, parseInt(rating, 10))),
      comment: comment.trim(),
      createdAt: new Date().toISOString(),
    };
    reviews.push(newReview);
    await writeReviews(reviews);
    return res.status(201).json({ review: newReview });
  }
  res.status(405).json({ message: 'Method not allowed' });
}
