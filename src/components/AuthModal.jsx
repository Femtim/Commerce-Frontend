import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { X } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { useShop } from '../context/ShopContext';

export default function AuthModal({ isOpen, onClose }) {
  const { setUser } = useShop();
  const [authMode, setAuthMode] = useState('login');
  const [serverError, setServerError] = useState('');

  const validationSchema = Yup.object({
    fullName:
      authMode === 'register'
        ? Yup.string()
            .min(3, 'Full name must be at least 3 characters')
            .required('Full name is required')
        : Yup.string(),
    email: Yup.string()
      .email('Enter a valid email address')
      .required('Email is required'),
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required'),
    role: Yup.string().oneOf(['buyer', 'seller']).required()
  });

  const formik = useFormik({
    initialValues: {
      fullName: '',
      email: '',
      password: '',
      role: 'buyer'
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      setServerError('');
      try {
        const endpoint = authMode === 'login' ? '/auth/login' : '/auth/register';
        const { data } = await axiosClient.post(endpoint, values);

        localStorage.setItem('vortex_token', data.token);
        localStorage.setItem('vortex_user', JSON.stringify(data.user));
        setUser(data.user);
        resetForm();
        onClose();
      } catch (err) {
        setServerError(
          err.response?.data?.message || 'Authentication failed. Please try again.'
        );
      } finally {
        setSubmitting(false);
      }
    }
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
          <h2 className="text-xl font-extrabold text-slate-900">
            {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {serverError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold">
            {serverError}
          </div>
        )}

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          {authMode === 'register' && (
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                placeholder="Feranmi Ojedokun"
                {...formik.getFieldProps('fullName')}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-indigo-600"
              />
              {formik.touched.fullName && formik.errors.fullName && (
                <p className="text-rose-500 text-xs mt-1">{formik.errors.fullName}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              {...formik.getFieldProps('email')}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-indigo-600"
            />
            {formik.touched.email && formik.errors.email && (
              <p className="text-rose-500 text-xs mt-1">{formik.errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              {...formik.getFieldProps('password')}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-indigo-600"
            />
            {formik.touched.password && formik.errors.password && (
              <p className="text-rose-500 text-xs mt-1">{formik.errors.password}</p>
            )}
          </div>

          {authMode === 'register' && (
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Account Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                {['buyer', 'seller'].map((r) => (
                  <button
                    type="button"
                    key={r}
                    onClick={() => formik.setFieldValue('role', r)}
                    className={`py-2.5 rounded-xl text-xs font-bold capitalize border transition ${
                      formik.values.role === r
                        ? 'bg-indigo-50 border-indigo-600 text-indigo-700'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    {r} Account
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={formik.isSubmitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white py-3 rounded-xl font-bold text-sm transition"
          >
            {formik.isSubmitting
              ? 'Processing...'
              : authMode === 'login'
              ? 'Sign In'
              : 'Create Account'}
          </button>
        </form>

        <p className="text-xs text-center text-slate-500 mt-5">
          {authMode === 'login'
            ? "Don't have an account?"
            : 'Already have an account?'}{' '}
          <button
            type="button"
            onClick={() => {
              setServerError('');
              setAuthMode(authMode === 'login' ? 'register' : 'login');
            }}
            className="text-indigo-600 font-bold hover:underline"
          >
            {authMode === 'login' ? 'Register' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
}