import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { X, Lock } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { useShop } from '../context/ShopContext';

export default function CheckoutModal({ isOpen, onClose, onOrderSuccess }) {
  const { user, cart, totalAmount, formatPrice, clearCart, fetchProducts } = useShop();

  const formik = useFormik({
    initialValues: {
      address: '',
      city: 'Ogbomoso, Oyo State'
    },
    validationSchema: Yup.object({
      address: Yup.string()
        .min(5, 'Enter a complete street address')
        .required('Delivery street address is required'),
      city: Yup.string().required('City / State is required')
    }),
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      const reference = `VTX-${Date.now()}`;
      const paystackKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

      const verifyOrderOnBackend = async (paymentRef) => {
        try {
          const { data } = await axiosClient.post('/orders/verify-checkout', {
            reference: paymentRef,
            customer: {
              fullName: user.fullName,
              email: user.email,
              address: values.address,
              city: values.city
            },
            items: cart.map((item) => ({
              product: item._id,
              name: item.name,
              image: item.image,
              quantity: item.quantity,
              price: item.price
            })),
            totalAmount
          });

          clearCart();
          fetchProducts();
          resetForm();
          onOrderSuccess(data.data);
          onClose();
        } catch (err) {
          alert(err.response?.data?.message || 'Order verification failed');
        } finally {
          setSubmitting(false);
        }
      };

      if (
        window.PaystackPop &&
        paystackKey &&
        !paystackKey.includes('your_paystack')
      ) {
        const handler = window.PaystackPop.setup({
          key: paystackKey,
          email: user.email,
          amount: totalAmount * 100,
          currency: 'NGN',
          ref: reference,
          callback: (response) => {
            verifyOrderOnBackend(response.reference);
          },
          onClose: () => {
            setSubmitting(false);
          }
        });
        handler.openIframe();
      } else {
        await verifyOrderOnBackend(reference);
      }
    }
  });

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
          <h2 className="text-xl font-bold text-slate-900">Checkout Point</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
            <p className="text-slate-500">Authenticated Buyer:</p>
            <p className="font-bold text-slate-900">
              {user.fullName} ({user.email})
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Delivery Street Address
            </label>
            <input
              type="text"
              name="address"
              placeholder="Under G, Ogbomoso"
              {...formik.getFieldProps('address')}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-indigo-600"
            />
            {formik.touched.address && formik.errors.address && (
              <p className="text-rose-500 text-xs mt-1">{formik.errors.address}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              City / State
            </label>
            <input
              type="text"
              name="city"
              {...formik.getFieldProps('city')}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-indigo-600"
            />
            {formik.touched.city && formik.errors.city && (
              <p className="text-rose-500 text-xs mt-1">{formik.errors.city}</p>
            )}
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex justify-between items-center text-sm font-bold">
            <span className="text-slate-600">Total Payable</span>
            <span className="text-indigo-600 text-base">
              {formatPrice(totalAmount)}
            </span>
          </div>

          <button
            type="submit"
            disabled={formik.isSubmitting}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 transition"
          >
            <Lock className="w-4 h-4" />
            {formik.isSubmitting
              ? 'Verifying Payment...'
              : `Pay ${formatPrice(totalAmount)} with Paystack`}
          </button>
        </form>
      </div>
    </div>
  );
}