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
        <Loader className="w-8 h-8 animate-spin" style={{ color: 'var(--primary)' }} />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--danger)' }} />
        <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Item Not Found</h2>
        <button onClick={() => navigate(-1)} className="text-sm" style={{ color: 'var(--primary-light)' }}>Go back</button>
      </div>
    );
  }

  const isOwner = item.reportedBy?._id === user?.id || item.reportedBy === user?.id;
  const typeColor = item.type === 'lost' ? '#ef4444' : '#10b981';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm mb-6"
        style={{ color: 'var(--text-muted)' }}>
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left column - Image & Details */}
        <div className="lg:col-span-3 space-y-6">
          {/* Image */}
          <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            {item.imageUrl ? (
              <img src={`${API_BASE}${item.imageUrl}`} alt={item.name}
                className="w-full h-72 sm:h-96 object-cover"
                onError={(e) => { e.target.style.display = 'none'; }} />
            ) : (
              <div className="w-full h-72 flex flex-col items-center justify-center gap-3"
                style={{ background: 'var(--bg-input)', color: 'var(--text-muted)' }}>
                <ImageOff className="w-16 h-16" />
                <span className="text-sm">No image uploaded</span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="rounded-2xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white mb-3"
                  style={{ background: `linear-gradient(135deg, ${typeColor}, ${item.type === 'lost' ? '#dc2626' : '#059669'})` }}>
                  {item.type}
                </span>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{item.name}</h1>
              </div>
              {item.status !== 'active' && (
                <span className="px-3 py-1 rounded-full text-sm font-semibold capitalize"
                  style={{ background: 'rgba(245,158,11,0.12)', color: 'var(--accent)' }}>
                  {item.status}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <InfoRow icon={Tag} label="Category" value={item.category?.replace('_', ' ')} />
              <InfoRow icon={Palette} label="Color" value={item.color} />
              <InfoRow icon={MapPin} label="Location" value={item.location} />
              <InfoRow icon={Calendar} label="Date" value={new Date(item.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} />
            </div>

            <div className="pt-4" style={{ borderTop: '1px solid var(--border)' }}>
              <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Description</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>{item.description}</p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="rounded-2xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Reported by
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                  {item.reportedBy?.name || 'Unknown'}
                </span>
              </div>
              {item.contactInfo?.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                  <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{item.contactInfo.email}</span>
                </div>
              )}
              {item.contactInfo?.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                  <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{item.contactInfo.phone}</span>
                </div>
              )}
            </div>

            {isOwner && (
              <button onClick={handleDelete}
                className="flex items-center gap-2 mt-4 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{ color: 'var(--danger)', background: 'rgba(239,68,68,0.08)' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
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
            <div className="rounded-2xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              {claimSuccess ? (
                <div className="text-center py-4 animate-scale-in">
                  <CheckCircle className="w-10 h-10 mx-auto mb-2" style={{ color: 'var(--success)' }} />
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Claim submitted!</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>The owner has been notified.</p>
                </div>
              ) : showClaimForm ? (
                <form onSubmit={handleClaim} className="animate-fade-in">
                  <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Verify Ownership</h3>
                  {claimError && (
                    <p className="text-xs mb-2" style={{ color: 'var(--danger)' }}>{claimError}</p>
                  )}
                  <textarea
                    required
                    value={claimMessage}
                    onChange={(e) => setClaimMessage(e.target.value)}
                    placeholder="Describe how you can verify this is your item..."
                    rows={4}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none resize-none mb-3"
                    style={{ background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
                    id="claim-message"
                  />
                  <div className="flex gap-2">
                    <button type="submit" disabled={claimLoading}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-60"
                      style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))' }}
                      id="submit-claim">
                      {claimLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      Submit
                    </button>
                    <button type="button" onClick={() => setShowClaimForm(false)}
                      className="px-4 py-2.5 rounded-xl text-sm"
                      style={{ background: 'var(--bg-input)', color: 'var(--text-secondary)' }}>
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <button onClick={() => setShowClaimForm(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold text-sm transition-all"
                  style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))', boxShadow: '0 4px 14px rgba(245,158,11,0.3)' }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  id="claim-item-button">
                  <HandHeart className="w-5 h-5" /> Claim This Item
                </button>
              )}
            </div>
          )}

          {/* Matches */}
          <div className="rounded-2xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
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
    <div className="flex items-center gap-2">
      <Icon className="w-4 h-4 shrink-0" style={{ color: 'var(--text-muted)' }} />
      <div>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</p>
        <p className="text-sm font-medium capitalize" style={{ color: 'var(--text-primary)' }}>{value}</p>
      </div>
    </div>
  );
}
