
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';


function ProductDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [submitError, setSubmitError] = useState("");
  const [user, setUser] = useState(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchProduct();
    fetchReviews();
    fetchAllProducts();

    // Load user authentication
    if (typeof window !== 'undefined') {
      const userAuth = window.sessionStorage.getItem('user_authenticated');
      const userData = window.sessionStorage.getItem('user_data');
      if (userAuth === 'true' && userData) {
        setUser(JSON.parse(userData));
      }
    }
    // eslint-disable-next-line
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

  useEffect(() => {
    if (product && allProducts.length > 0) {
      let related = [];
      if (product.categories && product.categories.length > 0) {
        related = allProducts.filter(
          p =>
            p.id !== product.id &&
            p.categories &&
            p.categories.some(cat => product.categories.includes(cat))
        );
      } else {
        related = allProducts.filter(p => p.id !== product.id);
      }
      related = related.sort(() => 0.5 - Math.random()).slice(0, 4);
      setRelatedProducts(related);
    }
  }, [product, allProducts]);

  const fetchAllProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setAllProducts(data.products || data);
      }
    } catch (err) {
      setAllProducts([]);
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
    setSubmitError("");

    // Check if user is logged in
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }

    if (!rating || !comment.trim()) return;
    setSubmitting(true);

    console.log('Submitting review with POST to /api/reviews', {
      productId: String(id),
      rating,
      comment,
      userId: user.id,
      userName: user.name || user.email
    });

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: String(id),
          rating,
          comment,
          userId: user.id,
          userName: user.name || user.email
        }),
      });
      if (res.ok) {
        setComment('');
        setRating(0);
        fetchReviews();
      } else {
        const errorText = await res.text();
        setSubmitError(`Error: ${res.status} - ${errorText}`);
      }
    } catch (err) {
      setSubmitError("Network error: " + err.message);
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
            <div className="flex items-center justify-center w-full md:w-96 bg-gray-100 rounded-lg border aspect-[4/3] max-h-[480px]">
              <img
                src={product.image}
                alt={product.name}
                className="object-contain w-full h-full max-h-[480px] rounded-lg"
                style={{ background: 'white' }}
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              {product.status && product.status !== 'available' && (
                <div className={`text-sm font-semibold mb-2 px-3 py-1 rounded-full inline-block ${
                  product.status === 'sold_out' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {product.status === 'sold_out' ? 'Sold Out' : 'Pre-Sale'}
                </div>
              )}
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
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-500">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                        <span className="text-gray-600 text-xs">{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                      <span className="text-gray-700 font-medium text-sm">{review.userName}</span>
                    </div>
                    <p className="text-gray-800">{review.comment}</p>
                  </li>
                ))}
              </ul>
            )}
            {user ? (
              <form onSubmit={handleSubmit} className="bg-white border rounded-lg p-4">
                {submitError && (
                  <div style={{ color: 'red', marginBottom: '8px' }}>{submitError}</div>
                )}
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
            ) : (
              <div className="bg-white border rounded-lg p-4">
                {showLoginPrompt && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <p className="text-yellow-800 font-medium mb-2">Login Required</p>
                    <p className="text-yellow-700 text-sm mb-3">You need to be logged in to leave a review. Please sign in or create an account.</p>
                    <div className="flex gap-2">
                      <Link
                        href={`/auth/signin?redirect=${encodeURIComponent(`/product/${id}`)}`}
                        className="bg-amber-700 text-white px-4 py-2 rounded hover:bg-amber-800 transition text-sm"
                      >
                        Sign In
                      </Link>
                      <Link
                        href={`/auth/signup?redirect=${encodeURIComponent(`/product/${id}`)}`}
                        className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800 transition text-sm"
                      >
                        Sign Up
                      </Link>
                      <button
                        onClick={() => setShowLoginPrompt(false)}
                        className="text-gray-600 hover:text-gray-800 text-sm underline"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
                <div className="text-center py-4">
                  <p className="text-gray-600 mb-3">Want to share your thoughts about this product?</p>
                  <Link
                    href={`/auth/signin?redirect=${encodeURIComponent(`/product/${id}`)}`}
                    className="bg-amber-700 text-white px-6 py-2 rounded hover:bg-amber-800 transition inline-block"
                  >
                    Sign In to Leave a Review
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Related/Recommended Products Section */}
          {relatedProducts && relatedProducts.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6">Related Products</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {relatedProducts.map((rel) => (
                  <Link key={rel.id} href={`/product/${rel.id}`} className="block border rounded-lg p-4 hover:shadow-lg transition">
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                        {rel.image ? (
                          <img src={rel.image} alt={rel.name} className="object-contain w-full h-full" />
                        ) : (
                          <span className="text-gray-400">No Image</span>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-1">{rel.name}</h3>
                        <p className="text-gray-600 text-sm mb-1 line-clamp-2">{rel.description}</p>
                        <div className="font-bold text-amber-700">₦{rel.price}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}

export default ProductDetails;
