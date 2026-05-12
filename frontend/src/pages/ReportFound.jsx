import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ImageUploader from '../components/ImageUploader';
import api from '../services/api';
import {
  CheckCircle, MapPin, Calendar, Tag, Palette, FileText, Phone, Mail,
  Loader, ArrowLeft, HandHeart
} from 'lucide-react';

const categories = [
  { value: 'phone', label: 'Phone' },
  { value: 'wallet', label: 'Wallet' },
  { value: 'bag', label: 'Bag' },
  { value: 'id_card', label: 'ID Card' },
  { value: 'laptop', label: 'Laptop' },
  { value: 'keys', label: 'Keys' },
  { value: 'books', label: 'Books' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'other', label: 'Other' },
];

export default function ReportFound() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', category: 'phone', color: '', description: '',
    location: '', date: '', contactPhone: '', contactEmail: user?.email || '',
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [matchesFound, setMatchesFound] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => formData.append(key, val));
      if (image) formData.append('image', image);

      const res = await api.post('/items/found', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMatchesFound(res.data.matchesFound || 0);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to report item');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    background: '#f9fafb',
    color: '#111827',
    border: '1px solid #e5e7eb',
  };

  const handleFocus = (e) => { e.currentTarget.style.borderColor = '#111827'; e.currentTarget.style.background = '#ffffff'; };
  const handleBlur = (e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = '#f9fafb'; };

  if (success) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center animate-scale-in">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: '#ecfdf5' }}>
          <HandHeart className="w-10 h-10" style={{ color: '#059669' }} />
        </div>
        <h2 className="text-2xl font-bold mb-3" style={{ color: '#111827' }}>Thank You!</h2>
        <p className="text-sm mb-6" style={{ color: '#6b7280' }}>
          The found item has been recorded. We'll try to match it with lost reports.
        </p>
        {matchesFound > 0 && (
          <div className="p-4 rounded-xl mb-6 animate-fade-in"
            style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
            <p className="font-semibold" style={{ color: '#d97706' }}>
              {matchesFound} potential match{matchesFound > 1 ? 'es' : ''} found!
            </p>
          </div>
        )}
        <div className="flex gap-4 justify-center">
          <button onClick={() => navigate('/dashboard')}
            className="px-6 py-3 rounded-xl text-sm font-semibold text-white cursor-pointer transition-all duration-200"
            style={{ background: '#111827' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#1f2937'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#111827'; }}>
            Go to Dashboard
          </button>
          <button onClick={() => { setSuccess(false); setForm({ ...form, name: '', description: '' }); setImage(null); }}
            className="px-6 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-200"
            style={{ background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb' }}>
            Report Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm mb-8 cursor-pointer transition-colors"
        style={{ color: '#9ca3af', background: 'none', border: 'none' }}
        onMouseEnter={(e) => e.currentTarget.style.color = '#111827'}
        onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}>
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ background: '#ecfdf5' }}>
          <CheckCircle className="w-6 h-6" style={{ color: '#059669' }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#111827' }}>Report Found Item</h1>
          <p className="text-sm" style={{ color: '#6b7280' }}>Help someone get their item back</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl mb-6" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
          <p className="text-sm" style={{ color: '#dc2626' }}>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Item Details Card */}
        <div className="rounded-2xl p-6 sm:p-8 space-y-6"
          style={{ background: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <h3 className="text-xs font-semibold uppercase tracking-widest pb-3"
            style={{ color: '#9ca3af', borderBottom: '1px solid #f3f4f6' }}>
            Item Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                <Tag className="w-3.5 h-3.5 inline mr-1.5" /> Item Name *
              </label>
              <input type="text" required value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., Black Wallet"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200"
                style={inputStyle} onFocus={handleFocus} onBlur={handleBlur}
                id="found-item-name" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                <Palette className="w-3.5 h-3.5 inline mr-1.5" /> Color *
              </label>
              <input type="text" required value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                placeholder="e.g., Brown, Black"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200"
                style={inputStyle} onFocus={handleFocus} onBlur={handleBlur}
                id="found-item-color" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>Category *</label>
              <select value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none appearance-none cursor-pointer"
                style={inputStyle} id="found-item-category">
                {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                <Calendar className="w-3.5 h-3.5 inline mr-1.5" /> Date Found *
              </label>
              <input type="date" required value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={inputStyle} id="found-item-date" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
              <MapPin className="w-3.5 h-3.5 inline mr-1.5" /> Found Location *
            </label>
            <input type="text" required value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="e.g., Cafeteria, Parking Lot B"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200"
              style={inputStyle} onFocus={handleFocus} onBlur={handleBlur}
              id="found-item-location" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
              <FileText className="w-3.5 h-3.5 inline mr-1.5" /> Description *
            </label>
            <textarea required value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe the item — brand, condition, any distinguishing features..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none transition-all duration-200"
              style={inputStyle} onFocus={handleFocus} onBlur={handleBlur}
              id="found-item-description" />
          </div>
        </div>

        {/* Image Upload Card */}
        <div className="rounded-2xl p-6 sm:p-8"
          style={{ background: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <h3 className="text-xs font-semibold uppercase tracking-widest mb-5 pb-3"
            style={{ color: '#9ca3af', borderBottom: '1px solid #f3f4f6' }}>
            Upload Image
          </h3>
          <ImageUploader onFileSelect={setImage} />
        </div>

        {/* Contact Info Card */}
        <div className="rounded-2xl p-6 sm:p-8 space-y-5"
          style={{ background: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <h3 className="text-xs font-semibold uppercase tracking-widest pb-3"
            style={{ color: '#9ca3af', borderBottom: '1px solid #f3f4f6' }}>
            Contact Info
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                <Phone className="w-3.5 h-3.5 inline mr-1.5" /> Phone
              </label>
              <input type="tel" value={form.contactPhone}
                onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                placeholder="+1 234 567 8900"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200"
                style={inputStyle} onFocus={handleFocus} onBlur={handleBlur}
                id="found-contact-phone" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                <Mail className="w-3.5 h-3.5 inline mr-1.5" /> Email
              </label>
              <input type="email" value={form.contactEmail}
                onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200"
                style={inputStyle} onFocus={handleFocus} onBlur={handleBlur}
                id="found-contact-email" />
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="w-full flex items-center justify-center gap-2.5 py-4 rounded-xl text-white font-semibold text-sm transition-all duration-200 disabled:opacity-50 cursor-pointer"
          style={{ background: '#111827' }}
          onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.background = '#1f2937'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'; } }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#111827'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          id="submit-found-item">
          {loading ? <Loader className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
          {loading ? 'Submitting...' : 'Report Found Item'}
        </button>
      </form>
    </div>
  );
}
