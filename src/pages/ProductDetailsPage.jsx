import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  ArrowLeft,
  Star,
  Plus,
  Heart,
  ShieldCheck,
  Truck,
  MessageSquarePlus
} from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { useShop } from '../context/ShopContext';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const {
    addToCart,
    wishlist,
    toggleWishlist,
    formatPrice,
    user,
    setActiveModal,
    fetchProducts
  } = useShop();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    setLoading(true);
    axiosClient
      .get(`/products/${id}`)
      .then(({ data }) => setProduct(data.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  const formik = useFormik({
    initialValues: { rating: 5, comment: '' },
    validationSchema: Yup.object({
      rating: Yup.number().min(1).max(5).required(),
      comment: Yup.string()
        .min(5, 'Write at least 5 characters')
        .required('Review comment is required')
    }),
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      setReviewError('');
      try {
        const { data } = await axiosClient.post(`/products/${id}/reviews`, values);
        setProduct(data.data);
        fetchProducts();
        resetForm();
      } catch (err) {
        setReviewError(err.response?.data?.message || 'Could not submit review');
      } finally {
        setSubmitting(false);
      }
    }
  });

  if (loading) {
    return (
      <div className="text-center py-24 text-slate-400 font-medium">
        Loading product specifications...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-24">
        <p className="text-slate-500 mb-4">Product not found.</p>
        <Link to="/" className="text-indigo-600 font-bold hover:underline">
          ← Back to Marketplace
        </Link>
      </div>
    );
  }

  const isWishlisted = wishlist.includes(product._id);

  return (
    <div className="space-y-10">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-indigo-600 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Marketplace
      </Link>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-2 gap-8 shadow-xs">
        <div className="relative rounded-2xl overflow-hidden bg-slate-100 h-80 sm:h-96">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={() => toggleWishlist(product._id)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow"
          >
            <Heart
              className={`w-5 h-5 ${
                isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-slate-600'
              }`}
            />
          </button>
        </div>

        <div className="flex flex-col justify-between space-y-6">
          <div>
            <span className="inline-block px-3 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-bold mb-3">
              {product.category}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
              <span className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                <Star className="w-4 h-4 fill-amber-400" /> {product.rating || 4.8}
              </span>
              <span>•</span>
              <span>{product.reviews?.length || 0} Customer Reviews</span>
              <span>•</span>
              <span
                className={
                  product.stock > 0 ? 'text-emerald-600 font-bold' : 'text-rose-500 font-bold'
                }
              >
                {product.stock > 0 ? `${product.stock} units available` : 'Out of Stock'}
              </span>
            </div>

            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              {product.description}
            </p>

            <div className="text-3xl font-extrabold text-slate-900">
              {formatPrice(product.price)}
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 px-3 py-2">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="px-2 font-bold text-slate-600"
                >
                  -
                </button>
                <span className="w-8 text-center text-sm font-bold">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.min(product.stock || 1, q + 1))}
                  className="px-2 font-bold text-slate-600"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                disabled={product.stock === 0}
                onClick={() => addToCart(product, qty)}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 transition"
              >
                <Plus className="w-4 h-4" /> Add {qty} to Cart
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs text-slate-500 pt-2">
              <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl">
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> Authentic Guarantee
              </div>
              <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl">
                <Truck className="w-4 h-4 text-indigo-500" /> Fast Nationwide Dispatch
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 h-fit">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquarePlus className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-extrabold">Write a Review</h2>
          </div>

          {!user ? (
            <div className="text-center py-6 bg-slate-50 rounded-2xl p-4">
              <p className="text-xs text-slate-500 mb-3">
                Sign in to rate this product and share your experience.
              </p>
              <button
                type="button"
                onClick={() => setActiveModal('auth')}
                className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold"
              >
                Sign In to Review
              </button>
            </div>
          ) : (
            <form onSubmit={formik.handleSubmit} className="space-y-4">
              {reviewError && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-600 text-xs font-semibold">
                  {reviewError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Star Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      type="button"
                      key={num}
                      onClick={() => formik.setFieldValue('rating', num)}
                      className={`p-2 rounded-xl border transition ${
                        formik.values.rating >= num
                          ? 'bg-amber-50 border-amber-300 text-amber-500'
                          : 'border-slate-200 text-slate-300'
                      }`}
                    >
                      <Star className="w-4 h-4 fill-current" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Your Feedback
                </label>
                <textarea
                  rows="3"
                  placeholder="How is the build quality and performance?"
                  {...formik.getFieldProps('comment')}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-indigo-600"
                />
                {formik.touched.comment && formik.errors.comment && (
                  <p className="text-rose-500 text-xs mt-1">{formik.errors.comment}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={formik.isSubmitting}
                className="w-full bg-slate-900 hover:bg-indigo-600 text-white py-3 rounded-xl font-bold text-xs transition"
              >
                {formik.isSubmitting ? 'Submitting...' : 'Post Verified Review'}
              </button>
            </form>
          )}
        </div>

        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
          <h2 className="text-lg font-extrabold">
            Customer Reviews ({product.reviews?.length || 0})
          </h2>

          {!product.reviews || product.reviews.length === 0 ? (
            <p className="text-sm text-slate-400 py-12 text-center">
              No reviews yet. Be the first to review this item!
            </p>
          ) : (
            <div className="space-y-4">
              {product.reviews.map((rev, index) => (
                <div
                  key={rev._id || index}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">
                      {rev.fullName}
                    </span>
                    <div className="flex items-center gap-1 text-amber-500">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}