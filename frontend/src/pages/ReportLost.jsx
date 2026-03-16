import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ImageUploader from '../components/ImageUploader';
import api from '../services/api';
import {
  AlertTriangle, MapPin, Calendar, Tag, Palette, FileText, Phone, Mail,
  Loader, CheckCircle, ArrowLeft
} from 'lucide-react';

const categories = [
  { value: 'phone', label: '📱 Phone' },
  { value: 'wallet', label: '👛 Wallet' },
  { value: 'bag', label: '🎒 Bag' },
  { value: 'id_card', label: '🪪 ID Card' },
  { value: 'laptop', label: '💻 Laptop' },
  { value: 'keys', label: '🔑 Keys' },
  { value: 'books', label: '📚 Books' },
  { value: 'clothing', label: '👕 Clothing' },
  { value: 'electronics', label: '🔌 Electronics' },
  { value: 'other', label: '📦 Other' },
];

export default function ReportLost() {
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

      const res = await api.post('/items/lost', formData, {
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
    background: 'var(--bg-input)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border)',
  };

  if (success) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center animate-scale-in">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: 'rgba(16,185,129,0.12)' }}>
          <CheckCircle className="w-10 h-10" style={{ color: 'var(--success)' }} />
        </div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Item Reported!</h2>
        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
          Your lost item has been recorded. We'll notify you when we find matches.
        </p>
        {matchesFound > 0 && (
          <div className="p-4 rounded-xl mb-6 animate-fade-in"
            style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <p className="font-semibold" style={{ color: 'var(--accent)' }}>
              🎉 {matchesFound} potential match{matchesFound > 1 ? 'es' : ''} found!
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Check your dashboard for details
            </p>
          </div>
        )}
        <div className="flex gap-3 justify-center">
          <button onClick={() => navigate('/dashboard')}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))' }}>
            Go to Dashboard
          </button>
          <button onClick={() => { setSuccess(false); setForm({ ...form, name: '', description: '' }); setImage(null); }}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
            Report Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm mb-6"
        style={{ color: 'var(--text-muted)' }}>
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(239,68,68,0.12)' }}>
          <AlertTriangle className="w-6 h-6" style={{ color: '#ef4444' }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Report Lost Item</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Fill in the details to help find your item</p>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl mb-6" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <p className="text-sm" style={{ color: 'var(--danger)' }}>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="glass rounded-2xl p-6 space-y-5">
          <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Item Details</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                <Tag className="w-3.5 h-3.5 inline mr-1" /> Item Name *
              </label>
              <input type="text" required value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., iPhone 15 Pro"
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                style={inputStyle}
                onFocus={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                id="item-name" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                <Palette className="w-3.5 h-3.5 inline mr-1" /> Color *
              </label>
              <input type="text" required value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                placeholder="e.g., Black, Silver"
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                style={inputStyle}
                onFocus={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                id="item-color" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Category *</label>
              <select value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none appearance-none cursor-pointer"
                style={inputStyle} id="item-category">
                {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                <Calendar className="w-3.5 h-3.5 inline mr-1" /> Date Lost *
              </label>
              <input type="date" required value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                style={inputStyle}
                id="item-date" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              <MapPin className="w-3.5 h-3.5 inline mr-1" /> Location *
            </label>
            <input type="text" required value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="e.g., Library 2nd Floor, Science Building"
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
              style={inputStyle}
              onFocus={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
              id="item-location" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              <FileText className="w-3.5 h-3.5 inline mr-1" /> Description *
            </label>
            <textarea required value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe your item in detail — brand, model, distinguishing features..."
              rows={4}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none resize-none"
              style={inputStyle}
              onFocus={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
              id="item-description" />
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>Upload Image</h3>
          <ImageUploader onFileSelect={setImage} />
        </div>

        <div className="glass rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Contact Info</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                <Phone className="w-3.5 h-3.5 inline mr-1" /> Phone
              </label>
              <input type="tel" value={form.contactPhone}
                onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                placeholder="+1 234 567 8900"
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                style={inputStyle}
                id="contact-phone" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                <Mail className="w-3.5 h-3.5 inline mr-1" /> Email
              </label>
              <input type="email" value={form.contactEmail}
                onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                style={inputStyle}
                id="contact-email" />
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-semibold text-sm transition-all disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', boxShadow: '0 4px 14px rgba(239,68,68,0.4)' }}
          onMouseEnter={(e) => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          id="submit-lost-item">
          {loading ? <Loader className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
          {loading ? 'Submitting...' : 'Report Lost Item'}
        </button>
      </form>
    </div>
  );
}
