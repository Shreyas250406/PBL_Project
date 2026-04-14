import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import MatchList from '../components/MatchList';
import {
  ArrowLeft, MapPin, Calendar, Tag, Palette, User, Mail, Phone,
  Loader, ImageOff, HandHeart, AlertCircle, CheckCircle, Send, Trash2,
  ShieldAlert, Clock, MessageSquare, ThumbsUp, ThumbsDown, Eye, UserCheck
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

  // Re-verification state
  const [reverifications, setReverifications] = useState([]);
  const [showReverifyForm, setShowReverifyForm] = useState(false);
  const [reverifyMessage, setReverifyMessage] = useState('');
  const [reverifyLoading, setReverifyLoading] = useState(false);
  const [reverifySuccess, setReverifySuccess] = useState(false);
  const [reverifyError, setReverifyError] = useState('');
  const [respondingTo, setRespondingTo] = useState(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [respondLoading, setRespondLoading] = useState(false);

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

      // Load re-verifications if item is claimed
      if (itemRes.data.item?.status === 'claimed') {
        try {
          const revRes = await api.get(`/reverifications/item/${id}`);
          setReverifications(revRes.data.reverifications || []);
        } catch {}
      }
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

  const handleReverify = async (e) => {
    e.preventDefault();
    setReverifyError('');
    setReverifyLoading(true);
    try {
      await api.post('/reverifications', { itemId: id, message: reverifyMessage });
      setReverifySuccess(true);
      setShowReverifyForm(false);
      loadItem();
    } catch (err) {
      setReverifyError(err.response?.data?.message || 'Failed to submit re-verification request');
    } finally {
      setReverifyLoading(false);
    }
  };

  const handleRespond = async (revId, status) => {
    setRespondLoading(true);
    try {
      await api.patch(`/reverifications/${revId}/respond`, {
        status,
        responseMessage,
      });
      setRespondingTo(null);
      setResponseMessage('');
      loadItem();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to respond');
    } finally {
      setRespondLoading(false);
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
  const isClaimer = item.claimedBy?._id === user?.id || item.claimedBy === user?.id;
  const typeColor = item.type === 'lost' ? '#dc2626' : '#059669';
  const typeBg = item.type === 'lost' ? '#fef2f2' : '#ecfdf5';

  // Check if user already has a reverification request
  const myReverification = reverifications.find(
    r => (r.requestedBy?._id === user?.id || r.requestedBy === user?.id)
  );

  // Days remaining for auto-delete
  const daysRemaining = item.autoDeleteAt
    ? Math.max(0, Math.ceil((new Date(item.autoDeleteAt) - new Date()) / (1000 * 60 * 60 * 24)))
    : null;

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
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                    style={{ background: typeBg, color: typeColor }}>
                    {item.type}
                  </span>
                  {item.status === 'claimed' && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                      style={{ background: '#fef3c7', color: '#92400e' }}>
                      <UserCheck className="w-3 h-3" /> Claimed
                    </span>
                  )}
                </div>
                <h1 className="text-2xl font-bold" style={{ color: '#111827' }}>{item.name}</h1>
              </div>
              {item.status !== 'active' && item.status !== 'claimed' && (
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

          {/* Claimed Info Banner */}
          {item.status === 'claimed' && (
            <div className="rounded-2xl p-5 sm:p-6"
              style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', border: '1px solid #f59e0b' }}>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(146, 64, 14, 0.12)' }}>
                  <ShieldAlert className="w-5 h-5" style={{ color: '#92400e' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm mb-1" style={{ color: '#92400e' }}>
                    This item has been claimed
                  </h3>
                  <p className="text-xs leading-relaxed" style={{ color: '#78350f' }}>
                    Claimed by <strong>{item.claimedBy?.name || 'Unknown'}</strong> on {' '}
                    {item.claimedAt ? new Date(item.claimedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}.
                  </p>
                  {daysRemaining !== null && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <Clock className="w-3.5 h-3.5" style={{ color: '#92400e' }} />
                      <span className="text-xs font-medium" style={{ color: '#92400e' }}>
                        {daysRemaining > 0
                          ? `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining to dispute this claim`
                          : 'Dispute window has expired'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

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

        {/* Right column - Claims, Re-verification & Matches */}
        <div className="lg:col-span-2 space-y-6">

          {/* === CLAIM SECTION (for active items, non-owners) === */}
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

          {/* === RE-VERIFICATION SECTION (for claimed items, Person C) === */}
          {item.status === 'claimed' && !isClaimer && !isOwner && (
            <div className="rounded-2xl p-6 sm:p-8"
              style={{ background: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: '#fef3c7' }}>
                  <ShieldAlert className="w-4 h-4" style={{ color: '#92400e' }} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm" style={{ color: '#111827' }}>Dispute This Claim</h3>
                  <p className="text-xs" style={{ color: '#9ca3af' }}>Believe this item belongs to you?</p>
                </div>
              </div>

              {myReverification ? (
                <div className="rounded-xl p-4" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4" style={{ color: '#16a34a' }} />
                    <p className="text-sm font-semibold" style={{ color: '#15803d' }}>Request Submitted</p>
                  </div>
                  <p className="text-xs" style={{ color: '#166534' }}>
                    Status: <strong className="capitalize">{myReverification.status.replace(/_/g, ' ')}</strong>
                  </p>
                  {myReverification.responseMessage && (
                    <p className="text-xs mt-2 p-2 rounded-lg" style={{ background: '#dcfce7', color: '#166534' }}>
                      Response: "{myReverification.responseMessage}"
                    </p>
                  )}
                </div>
              ) : reverifySuccess ? (
                <div className="text-center py-4 animate-scale-in">
                  <CheckCircle className="w-10 h-10 mx-auto mb-3" style={{ color: '#059669' }} />
                  <p className="text-sm font-semibold" style={{ color: '#111827' }}>Re-verification request sent!</p>
                  <p className="text-xs mt-1" style={{ color: '#9ca3af' }}>The claimer has been notified to review.</p>
                </div>
              ) : showReverifyForm ? (
                <form onSubmit={handleReverify} className="animate-fade-in">
                  {reverifyError && (
                    <p className="text-xs mb-3 p-3 rounded-lg" style={{ color: '#dc2626', background: '#fef2f2' }}>{reverifyError}</p>
                  )}
                  <textarea
                    required
                    value={reverifyMessage}
                    onChange={(e) => setReverifyMessage(e.target.value)}
                    placeholder="Explain why you believe this item is yours. Include any identifying details, serial numbers, marks, or proof of ownership..."
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none mb-4 transition-all duration-200"
                    style={{ background: '#f9fafb', color: '#111827', border: '1px solid #e5e7eb' }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#111827'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; }}
                    id="reverify-message"
                  />
                  <div className="flex gap-3">
                    <button type="submit" disabled={reverifyLoading}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-semibold disabled:opacity-50 cursor-pointer transition-all duration-200"
                      style={{ background: '#92400e' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#78350f'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#92400e'}
                      id="submit-reverify">
                      {reverifyLoading ? <Loader className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
                      Submit Dispute
                    </button>
                    <button type="button" onClick={() => setShowReverifyForm(false)}
                      className="px-4 py-3 rounded-xl text-sm font-medium cursor-pointer transition-all duration-200"
                      style={{ background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb' }}>
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <button onClick={() => setShowReverifyForm(true)}
                  className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer"
                  style={{ background: '#92400e', color: '#ffffff' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#78350f'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(146,64,14,0.25)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#92400e'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                  id="dispute-claim-button">
                  <ShieldAlert className="w-5 h-5" /> Request Re-verification
                </button>
              )}
            </div>
          )}

          {/* === INCOMING DISPUTES (Person B - claimer's view) === */}
          {item.status === 'claimed' && isClaimer && reverifications.length > 0 && (
            <div className="rounded-2xl p-6 sm:p-8"
              style={{ background: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: '#fef2f2' }}>
                  <AlertCircle className="w-4 h-4" style={{ color: '#dc2626' }} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm" style={{ color: '#111827' }}>
                    Dispute Requests ({reverifications.length})
                  </h3>
                  <p className="text-xs" style={{ color: '#9ca3af' }}>Others claim this item belongs to them</p>
                </div>
              </div>

              <div className="space-y-4">
                {reverifications.map((rev) => (
                  <div key={rev._id} className="rounded-xl p-4 transition-all duration-200"
                    style={{ background: '#f9fafb', border: '1px solid #e5e7eb' }}>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                          style={{ background: '#6b7280' }}>
                          {rev.requestedBy?.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: '#111827' }}>
                            {rev.requestedBy?.name || 'Unknown'}
                          </p>
                          <p className="text-xs" style={{ color: '#9ca3af' }}>
                            {rev.requestedBy?.email}
                          </p>
                        </div>
                      </div>
                      <ReverificationBadge status={rev.status} />
                    </div>

                    <div className="flex items-start gap-2 mt-3 mb-3 p-3 rounded-lg" style={{ background: '#ffffff' }}>
                      <MessageSquare className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: '#9ca3af' }} />
                      <p className="text-xs leading-relaxed" style={{ color: '#4b5563' }}>
                        "{rev.message}"
                      </p>
                    </div>

                    {rev.responseMessage && (
                      <div className="flex items-start gap-2 mb-3 p-3 rounded-lg" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                        <Eye className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: '#16a34a' }} />
                        <p className="text-xs leading-relaxed" style={{ color: '#166534' }}>
                          Your response: "{rev.responseMessage}"
                        </p>
                      </div>
                    )}

                    {/* Action buttons for pending disputes */}
                    {rev.status === 'pending' && (
                      respondingTo === rev._id ? (
                        <div className="space-y-3 animate-fade-in">
                          <textarea
                            value={responseMessage}
                            onChange={(e) => setResponseMessage(e.target.value)}
                            placeholder="Add a message (optional)..."
                            rows={2}
                            className="w-full px-3 py-2 rounded-lg text-xs outline-none resize-none transition-all duration-200"
                            style={{ background: '#ffffff', color: '#111827', border: '1px solid #e5e7eb' }}
                            onFocus={(e) => { e.currentTarget.style.borderColor = '#111827'; }}
                            onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; }}
                          />
                          <div className="flex gap-2">
                            <button onClick={() => handleRespond(rev._id, 'resolved_in_favor')}
                              disabled={respondLoading}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold text-white cursor-pointer transition-all duration-200 disabled:opacity-50"
                              style={{ background: '#059669' }}
                              onMouseEnter={(e) => e.currentTarget.style.background = '#047857'}
                              onMouseLeave={(e) => e.currentTarget.style.background = '#059669'}>
                              <ThumbsUp className="w-3 h-3" /> Transfer Claim
                            </button>
                            <button onClick={() => handleRespond(rev._id, 'resolved_against')}
                              disabled={respondLoading}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold text-white cursor-pointer transition-all duration-200 disabled:opacity-50"
                              style={{ background: '#dc2626' }}
                              onMouseEnter={(e) => e.currentTarget.style.background = '#b91c1c'}
                              onMouseLeave={(e) => e.currentTarget.style.background = '#dc2626'}>
                              <ThumbsDown className="w-3 h-3" /> Deny
                            </button>
                            <button onClick={() => handleRespond(rev._id, 'acknowledged')}
                              disabled={respondLoading}
                              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-200 disabled:opacity-50"
                              style={{ background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb' }}>
                              <Eye className="w-3 h-3" />
                            </button>
                          </div>
                          <button onClick={() => setRespondingTo(null)}
                            className="text-xs cursor-pointer"
                            style={{ color: '#9ca3af', background: 'none', border: 'none' }}>
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => setRespondingTo(rev._id)}
                          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-200"
                          style={{ background: '#111827', color: '#ffffff' }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#1f2937'}
                          onMouseLeave={(e) => e.currentTarget.style.background = '#111827'}>
                          <MessageSquare className="w-3.5 h-3.5" /> Review & Respond
                        </button>
                      )
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* === YOUR CLAIM STATUS (Person B - claimer's view, no disputes) === */}
          {item.status === 'claimed' && isClaimer && reverifications.length === 0 && (
            <div className="rounded-2xl p-6 sm:p-8"
              style={{ background: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div className="text-center py-2">
                <CheckCircle className="w-10 h-10 mx-auto mb-3" style={{ color: '#059669' }} />
                <p className="text-sm font-semibold" style={{ color: '#111827' }}>You've claimed this item</p>
                <p className="text-xs mt-1" style={{ color: '#9ca3af' }}>
                  No one has disputed your claim yet.
                  {daysRemaining !== null && daysRemaining > 0 && (
                    <> The dispute window closes in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}.</>
                  )}
                </p>
              </div>
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

function ReverificationBadge({ status }) {
  const map = {
    pending: { bg: '#fffbeb', text: '#d97706', label: 'Pending' },
    acknowledged: { bg: '#eff6ff', text: '#2563eb', label: 'Reviewing' },
    resolved_in_favor: { bg: '#ecfdf5', text: '#059669', label: 'Transferred' },
    resolved_against: { bg: '#fef2f2', text: '#dc2626', label: 'Denied' },
  };
  const c = map[status] || map.pending;
  return (
    <span className="px-2.5 py-0.5 rounded text-xs font-semibold shrink-0"
      style={{ background: c.bg, color: c.text }}>
      {c.label}
    </span>
  );
}
