import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [products, setProducts] = useState([]);
  const [user, setUser] = useState(null);

  // Helper to get userId
  const getUserId = () => {
    if (user && user.id) return user.id;
    if (user && user.email) return user.email;
    return null;
  };

  // Load user from sessionStorage (client only)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const userAuth = window.sessionStorage.getItem('user_authenticated');
    const userData = window.sessionStorage.getItem('user_data');
    if (userAuth === 'true' && userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Load wishlist from API or localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const userId = getUserId();
    if (userId) {
      fetch(`/api/wishlist?userId=${encodeURIComponent(userId)}`)
        .then(res => res.json())
        .then(data => setWishlist(Array.isArray(data.wishlist) ? data.wishlist : []));
    } else {
      const stored = window.localStorage.getItem('scentlumus_wishlist');
      if (stored) setWishlist(JSON.parse(stored));
    }
    // eslint-disable-next-line
  }, [user]);

  // Fetch product details for wishlist
  useEffect(() => {
    if (!wishlist.length) {
      setProducts([]);
      return;
    }
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        const all = data.products || data;
        setProducts(all.filter(p => wishlist.includes(p.id)));
      });
  }, [wishlist]);

  // Remove from wishlist
  const removeFromWishlist = (productId) => {
    const userId = getUserId();
    const newWishlist = wishlist.filter(id => id !== productId);
    setWishlist(newWishlist);
    if (userId) {
      fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, wishlist: newWishlist }),
      });
    } else if (typeof window !== 'undefined') {
      window.localStorage.setItem('scentlumus_wishlist', JSON.stringify(newWishlist));
    }
  };

  return (
    <div className="min-h-screen bg-white py-8 px-4 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">My Wishlist</h1>
      {products.length === 0 ? (
        <p className="text-gray-500">Your wishlist is empty.</p>
      ) : (
        <ul className="space-y-6">
          {products.map(product => (
            <li key={product.id} className="flex items-center gap-6 border rounded-lg p-4 bg-gray-50">
              <Link href={`/product/${product.id}`} className="block w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="object-contain w-full h-full" />
                ) : (
                  <span className="text-gray-400">No Image</span>
                )}
              </Link>
              <div className="flex-1">
                <Link href={`/product/${product.id}`} className="text-lg font-semibold hover:underline">
                  {product.name}
                </Link>
                <p className="text-gray-600 text-sm mb-1 line-clamp-2">{product.description}</p>
                <div className="font-bold text-amber-700">₦{product.price}</div>
              </div>
              <button
                onClick={() => removeFromWishlist(product.id)}
                className="ml-4 px-3 py-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
