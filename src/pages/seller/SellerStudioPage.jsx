import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { UploadCloud, Link as LinkIcon } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { CATEGORIES, useShop } from '../../context/ShopContext';

export default function SellerStudioPage() {
  const { setProducts } = useShop();
  const navigate = useNavigate();
  const [uploadMode, setUploadMode] = useState('file');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const formik = useFormik({
    initialValues: {
      name: '',
      category: 'Electronics',
      price: '',
      stock: '',
      image: '',
      description: ''
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Product name is required'),
      category: Yup.string().required('Category is required'),
      price: Yup.number().positive('Must be positive').required('Price is required'),
      stock: Yup.number().integer().min(1, 'Minimum 1 item').required('Stock is required'),
      description: Yup.string().min(10, 'Minimum 10 characters').required('Description is required')
    }),
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const formData = new FormData();
        formData.append('name', values.name);
        formData.append('category', values.category);
        formData.append('price', values.price);
        formData.append('stock', values.stock);
        formData.append('description', values.description);

        if (uploadMode === 'file' && selectedFile) {
          formData.append('imageFile', selectedFile);
        } else if (values.image) {
          formData.append('image', values.image);
        } else {
          alert('Please select a file or enter an image URL');
          setSubmitting(false);
          return;
        }

        const { data } = await axiosClient.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        setProducts((prev) => {
          if (prev.some((p) => p._id === data.data._id)) return prev;
          return [data.data, ...prev];
        });
        resetForm();
        navigate('/');
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to publish product');
      } finally {
        setSubmitting(false);
      }
    }
  });

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-2xl">
      <h2 className="text-lg font-extrabold mb-6">Publish New Marketplace Product</h2>

      <form onSubmit={formik.handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
            Product Name
          </label>
          <input
            type="text"
            placeholder="Apple MacBook Pro M3"
            {...formik.getFieldProps('name')}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-indigo-600"
          />
          {formik.touched.name && formik.errors.name && (
            <p className="text-rose-500 text-xs mt-1">{formik.errors.name}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Category
            </label>
            <select
              {...formik.getFieldProps('category')}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm bg-white"
            >
              {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Price (₦)
            </label>
            <input
              type="number"
              placeholder="185000"
              {...formik.getFieldProps('price')}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Stock Quantity
            </label>
            <input
              type="number"
              placeholder="10"
              {...formik.getFieldProps('stock')}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase text-slate-500">Product Image</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setUploadMode('file')}
                className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-bold ${
                  uploadMode === 'file'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                <UploadCloud className="w-3.5 h-3.5" /> Cloudinary Upload
              </button>
              <button
                type="button"
                onClick={() => setUploadMode('url')}
                className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-bold ${
                  uploadMode === 'url'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" /> Image URL
              </button>
            </div>
          </div>

          {uploadMode === 'file' ? (
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-6 cursor-pointer bg-slate-50 transition">
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="h-36 object-cover rounded-xl mb-2" />
              ) : (
                <UploadCloud className="w-8 h-8 text-indigo-500 mb-1" />
              )}
              <span className="text-xs font-semibold text-slate-600">
                {selectedFile ? selectedFile.name : 'Click to select local image (JPG, PNG, WEBP)'}
              </span>
              <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
            </label>
          ) : (
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              {...formik.getFieldProps('image')}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm"
            />
          )}
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
            Specifications & Description
          </label>
          <textarea
            rows="3"
            placeholder="Highlight key product specifications..."
            {...formik.getFieldProps('description')}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm"
          />
          {formik.touched.description && formik.errors.description && (
            <p className="text-rose-500 text-xs mt-1">{formik.errors.description}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={formik.isSubmitting}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white py-3.5 rounded-xl font-bold text-sm transition"
        >
          {formik.isSubmitting ? 'Uploading & Publishing...' : 'Publish Product to Marketplace'}
        </button>
      </form>
    </div>
  );
}