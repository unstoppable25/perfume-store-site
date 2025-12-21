import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

export default function ProductDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProduct();
      fetchReviews();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/products?id=${id}`);
      if (res.ok) {
        const data = await res.json();
        setProduct(data.product || data);
      }
    } catch (err) {
      console.error('Failed to fetch product:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews?productId=${id}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
      }
    } catch (err) {
      setReviews([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating || !comment.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: id, rating, comment }),
      });
      if (res.ok) {
        setComment('');
        setRating(0);
        fetchReviews();
      }
    } catch (err) {
      // handle error
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
        ).toFixed(1)
      : null;

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!product) {
    return <div className="min-h-screen flex items-center justify-center">Product not found.</div>;
  }

  return (
    <>
      <Head>
        <title>{product.name} — ScentLumus</title>
      </Head>
      <div className="min-h-screen bg-white">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Link href="/shop" className="text-amber-700 hover:underline">&larr; Back to Shop</Link>
          <div className="mt-6 flex flex-col md:flex-row gap-8">
            <img src={product.image} alt={product.name} className="w-full md:w-80 h-80 object-cover rounded-lg border" />
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <p className="text-lg text-gray-700 mb-4">{product.description}</p>
              <div className="mb-2">
                <span className="font-semibold">Price:</span> ₦{product.price}
              </div>
              {averageRating && (
                <div className="mb-2 flex items-center gap-2">
                  <span className="font-semibold">Average Rating:</span>
                  <span className="text-yellow-500">{'★'.repeat(Math.round(averageRating))}{'☆'.repeat(5 - Math.round(averageRating))}</span>
                  <span className="text-gray-600 text-sm">({averageRating} / 5, {reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
                </div>
              )}
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mt-10">
            <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
            {reviews.length === 0 ? (
              <p className="text-gray-500 mb-4">No reviews yet. Be the first to review this product!</p>
            ) : (
              <ul className="space-y-4 mb-6">
                {reviews.map((review, idx) => (
                  <li key={idx} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-yellow-500">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                      <span className="text-gray-600 text-xs">{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-gray-800">{review.comment}</p>
                  </li>
                ))}
              </ul>
            )}
            <form onSubmit={handleSubmit} className="bg-white border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2">Leave a Review</h3>
              <div className="flex items-center gap-2 mb-2">
                <label className="font-medium">Rating:</label>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    className={
                      'text-2xl ' + (rating >= star ? 'text-yellow-500' : 'text-gray-300')
                    }
                    onClick={() => setRating(star)}
                  >
                    ★
                  </button>
                ))}
              </div>
              <textarea
                className="w-full border rounded-lg p-2 mb-2"
                rows={3}
                placeholder="Write your review..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
              />
              <button
                type="submit"
                className="bg-amber-700 text-white px-4 py-2 rounded hover:bg-amber-800 transition"
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
