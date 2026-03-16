import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import MatchList from '../components/MatchList';
import {
  ArrowLeft, MapPin, Calendar, Tag, Palette, User, Mail, Phone,
  Loader, ImageOff, HandHeart, AlertCircle, CheckCircle, Send, Trash2
} from 'lucide-react';

const API_BASE = '';

export default function ItemDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claimMessage, setClaimMessage] = useState('');
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [claimError, setClaimError] = useState('');
  const [showClaimForm, setShowClaimForm] = useState(false);

  useEffect(() => {
    loadItem();
  }, [id]);

  const loadItem = async () => {
    try {
      const [itemRes, matchRes] = await Promise.all([
        api.get(`/items/${id}`),
        api.get(`/matches/${id}`),
      ]);
      setItem(itemRes.data.item);
      setMatches(matchRes.data.matches || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (e) => {
    e.preventDefault();
    setClaimError('');
    setClaimLoading(true);
    try {
      await api.post('/claims', { itemId: id, message: claimMessage });
      setClaimSuccess(true);
      setShowClaimForm(false);
    } catch (err) {
      setClaimError(err.response?.data?.message || 'Failed to submit claim');
    } finally {
      setClaimLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await api.delete(`/items/${id}`);
      navigate(-1);
    } catch (err) {
      alert('Failed to delete item');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader className="w-8 h-8 animate-spin" style={{ color: '#111827' }} />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-12 h-12 mx-auto mb-4" style={{ color: '#dc2626' }} />
        <h2 className="text-xl font-bold mb-3" style={{ color: '#111827' }}>Item Not Found</h2>
        <button onClick={() => navigate(-1)} className="text-sm font-medium cursor-pointer"
          style={{ color: '#111827', background: 'none', border: 'none' }}>Go back</button>
      </div>
    );
  }

  const isOwner = item.reportedBy?._id === user?.id || item.reportedBy === user?.id;
  const typeColor = item.type === 'lost' ? '#dc2626' : '#059669';
  const typeBg = item.type === 'lost' ? '#fef2f2' : '#ecfdf5';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm mb-8 cursor-pointer transition-colors"
        style={{ color: '#9ca3af', background: 'none', border: 'none' }}
        onMouseEnter={(e) => e.currentTarget.style.color = '#111827'}
        onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}>
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left column - Image & Details */}
        <div className="lg:col-span-3 space-y-6">
          {/* Image */}
          <div className="rounded-2xl overflow-hidden"
            style={{ background: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            {item.imageUrl ? (
              <img src={`${API_BASE}${item.imageUrl}`} alt={item.name}
                className="w-full h-72 sm:h-96 object-cover"
                onError={(e) => { e.target.style.display = 'none'; }} />
            ) : (
              <div className="w-full h-72 flex flex-col items-center justify-center gap-3"
                style={{ background: '#f9fafb', color: '#d1d5db' }}>
                <ImageOff className="w-16 h-16" />
                <span className="text-sm" style={{ color: '#9ca3af' }}>No image uploaded</span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="rounded-2xl p-6 sm:p-8"
            style={{ background: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3"
                  style={{ background: typeBg, color: typeColor }}>
                  {item.type}
                </span>
                <h1 className="text-2xl font-bold" style={{ color: '#111827' }}>{item.name}</h1>
              </div>
              {item.status !== 'active' && (
                <span className="px-3 py-1 rounded-full text-sm font-semibold capitalize"
                  style={{ background: '#fffbeb', color: '#d97706' }}>
                  {item.status}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <InfoRow icon={Tag} label="Category" value={item.category?.replace('_', ' ')} />
              <InfoRow icon={Palette} label="Color" value={item.color} />
              <InfoRow icon={MapPin} label="Location" value={item.location} />
              <InfoRow icon={Calendar} label="Date" value={new Date(item.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} />
            </div>

            <div className="pt-5" style={{ borderTop: '1px solid #f3f4f6' }}>
              <h3 className="text-sm font-semibold mb-3" style={{ color: '#374151' }}>Description</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#4b5563' }}>{item.description}</p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="rounded-2xl p-6 sm:p-8"
            style={{ background: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <h3 className="text-xs font-semibold mb-4 uppercase tracking-widest pb-3"
              style={{ color: '#9ca3af', borderBottom: '1px solid #f3f4f6' }}>
              Reported by
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4" style={{ color: '#9ca3af' }} />
                <span className="text-sm" style={{ color: '#111827' }}>
                  {item.reportedBy?.name || 'Unknown'}
                </span>
              </div>
              {item.contactInfo?.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4" style={{ color: '#9ca3af' }} />
                  <span className="text-sm" style={{ color: '#111827' }}>{item.contactInfo.email}</span>
                </div>
              )}
              {item.contactInfo?.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4" style={{ color: '#9ca3af' }} />
                  <span className="text-sm" style={{ color: '#111827' }}>{item.contactInfo.phone}</span>
                </div>
              )}
            </div>

            {isOwner && (
              <button onClick={handleDelete}
                className="flex items-center gap-2 mt-5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer"
                style={{ color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#fee2e2'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#fef2f2'; }}
                id="delete-item">
                <Trash2 className="w-4 h-4" /> Delete this item
              </button>
            )}
          </div>
        </div>

        {/* Right column - Claims & Matches */}
        <div className="lg:col-span-2 space-y-6">
          {/* Claim Section */}
          {!isOwner && item.status === 'active' && (
            <div className="rounded-2xl p-6 sm:p-8"
              style={{ background: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              {claimSuccess ? (
                <div className="text-center py-4 animate-scale-in">
                  <CheckCircle className="w-10 h-10 mx-auto mb-3" style={{ color: '#059669' }} />
                  <p className="text-sm font-semibold" style={{ color: '#111827' }}>Claim submitted!</p>
                  <p className="text-xs mt-1" style={{ color: '#9ca3af' }}>The owner has been notified.</p>
                </div>
              ) : showClaimForm ? (
                <form onSubmit={handleClaim} className="animate-fade-in">
                  <h3 className="font-semibold mb-4" style={{ color: '#111827' }}>Verify Ownership</h3>
                  {claimError && (
                    <p className="text-xs mb-3 p-3 rounded-lg" style={{ color: '#dc2626', background: '#fef2f2' }}>{claimError}</p>
                  )}
                  <textarea
                    required
                    value={claimMessage}
                    onChange={(e) => setClaimMessage(e.target.value)}
                    placeholder="Describe how you can verify this is your item..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none mb-4 transition-all duration-200"
                    style={{ background: '#f9fafb', color: '#111827', border: '1px solid #e5e7eb' }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#111827'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; }}
                    id="claim-message"
                  />
                  <div className="flex gap-3">
                    <button type="submit" disabled={claimLoading}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-semibold disabled:opacity-50 cursor-pointer transition-all duration-200"
                      style={{ background: '#111827' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#1f2937'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#111827'}
                      id="submit-claim">
                      {claimLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      Submit
                    </button>
                    <button type="button" onClick={() => setShowClaimForm(false)}
                      className="px-4 py-3 rounded-xl text-sm font-medium cursor-pointer transition-all duration-200"
                      style={{ background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb' }}>
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <button onClick={() => setShowClaimForm(true)}
                  className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-white font-semibold text-sm transition-all duration-200 cursor-pointer"
                  style={{ background: '#111827' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#1f2937'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#111827'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                  id="claim-item-button">
                  <HandHeart className="w-5 h-5" /> Claim This Item
                </button>
              )}
            </div>
          )}

          {/* Matches */}
          <div className="rounded-2xl p-6 sm:p-8"
            style={{ background: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <h3 className="font-semibold mb-5" style={{ color: '#111827' }}>
              Matching Suggestions
            </h3>
            <MatchList matches={matches} currentItemId={id} />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl"
      style={{ background: '#f9fafb' }}>
      <Icon className="w-4 h-4 shrink-0" style={{ color: '#9ca3af' }} />
      <div>
        <p className="text-xs" style={{ color: '#9ca3af' }}>{label}</p>
        <p className="text-sm font-medium capitalize" style={{ color: '#111827' }}>{value}</p>
      </div>
    </div>
  );
}
