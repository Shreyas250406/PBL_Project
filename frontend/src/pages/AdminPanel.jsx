import { useState, useEffect } from 'react';
import api from '../services/api';
import {
  ShieldCheck, Package, Users, TrendingUp, AlertTriangle, CheckCircle,
  Trash2, Loader, Eye, X, Check, Clock
} from 'lucide-react';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [items, setItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, claimsRes, matchesRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/claims'),
        api.get('/admin/matches'),
      ]);
      setStats(statsRes.data.stats);
      setItems(statsRes.data.recentItems || []);
      setClaims(claimsRes.data.claims || []);
      setMatches(matchesRes.data.matches || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (id) => {
    if (!confirm('Delete this item and all related data?')) return;
    try {
      await api.delete(`/admin/items/${id}`);
      setItems((prev) => prev.filter((i) => i._id !== id));
      loadData();
    } catch (err) {
      alert('Failed to delete');
    }
  };

  const handleClaimAction = async (claimId, status) => {
    try {
      await api.patch(`/claims/${claimId}`, { status });
      setClaims((prev) => prev.map((c) => (c._id === claimId ? { ...c, status } : c)));
    } catch (err) {
      alert('Failed to update claim');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader className="w-8 h-8 animate-spin" style={{ color: 'var(--primary)' }} />
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'items', label: 'Items', icon: Package },
    { id: 'claims', label: 'Claims', icon: CheckCircle },
    { id: 'matches', label: 'Matches', icon: TrendingUp },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(245,158,11,0.12)' }}>
          <ShieldCheck className="w-5 h-5" style={{ color: 'var(--accent)' }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Admin Panel</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Manage items, claims, and matches</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl mb-6 w-fit"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
              background: activeTab === tab.id ? 'var(--primary)' : 'transparent',
            }}>
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && stats && (
        <div className="stagger">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <AdminStatCard icon={AlertTriangle} label="Total Lost" value={stats.totalLost} color="#ef4444" />
            <AdminStatCard icon={CheckCircle} label="Total Found" value={stats.totalFound} color="#10b981" />
            <AdminStatCard icon={TrendingUp} label="Strong Matches" value={stats.totalMatches} color="#f59e0b" />
            <AdminStatCard icon={Package} label="Total Claims" value={stats.totalClaims} color="#6366f1" />
            <AdminStatCard icon={Clock} label="Pending Claims" value={stats.pendingClaims} color="#f97316" />
            <AdminStatCard icon={Users} label="Total Users" value={stats.totalUsers} color="#0ea5e9" />
          </div>

          <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Recent Items</h3>
          <div className="space-y-2">
            {items.map((item) => (
              <ItemRow key={item._id} item={item} onDelete={handleDeleteItem} />
            ))}
          </div>
        </div>
      )}

      {/* Items Tab */}
      {activeTab === 'items' && (
        <div className="space-y-2 stagger">
          {items.length === 0 ? (
            <EmptyState message="No items found" />
          ) : (
            items.map((item) => (
              <ItemRow key={item._id} item={item} onDelete={handleDeleteItem} />
            ))
          )}
        </div>
      )}

      {/* Claims Tab */}
      {activeTab === 'claims' && (
        <div className="space-y-3 stagger">
          {claims.length === 0 ? (
            <EmptyState message="No claims yet" />
          ) : (
            claims.map((claim) => (
              <div key={claim._id} className="p-4 rounded-xl flex flex-col sm:flex-row sm:items-center gap-3"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                      {claim.itemId?.name || 'Unknown Item'}
                    </span>
                    <StatusBadge status={claim.status} />
                  </div>
                  <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                    Claimed by: {claim.claimedBy?.name} ({claim.claimedBy?.email})
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                    "{claim.message}"
                  </p>
                </div>
                {claim.status === 'pending' && (
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => handleClaimAction(claim._id, 'approved')}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                      style={{ background: 'var(--success)' }}>
                      <Check className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button onClick={() => handleClaimAction(claim._id, 'rejected')}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                      style={{ background: 'var(--danger)' }}>
                      <X className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Matches Tab */}
      {activeTab === 'matches' && (
        <div className="space-y-3 stagger">
          {matches.length === 0 ? (
            <EmptyState message="No matches found" />
          ) : (
            matches.map((match) => (
              <div key={match._id} className="p-4 rounded-xl"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-semibold" style={{ color: '#ef4444' }}>
                        {match.lostItemId?.name || '?'}
                      </span>
                      <span style={{ color: 'var(--text-muted)' }}>↔</span>
                      <span className="font-semibold" style={{ color: '#10b981' }}>
                        {match.foundItemId?.name || '?'}
                      </span>
                    </div>
                    <div className="score-bar mt-2 w-48">
                      <div className="score-bar-fill"
                        style={{
                          width: `${match.matchScore}%`,
                          background: match.matchScore >= 80 ? '#10b981' : match.matchScore >= 60 ? '#f59e0b' : '#64748b',
                        }}></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold"
                      style={{ color: match.matchScore >= 80 ? '#10b981' : match.matchScore >= 60 ? '#f59e0b' : '#64748b' }}>
                      {match.matchScore}%
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function AdminStatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="p-4 rounded-2xl transition-all"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `${color}18` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <div>
          <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{value}</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</p>
        </div>
      </div>
    </div>
  );
}

function ItemRow({ item, onDelete }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl transition-colors"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card-hover)'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-card)'}>
      {item.imageUrl ? (
        <img src={item.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
      ) : (
        <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: 'var(--bg-input)', color: 'var(--text-muted)', fontSize: '10px' }}>
          N/A
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{item.name}</span>
          <span className="px-2 py-0.5 rounded text-xs font-bold uppercase"
            style={{
              background: item.type === 'lost' ? 'rgba(239,68,68,0.12)' : 'rgba(16,185,129,0.12)',
              color: item.type === 'lost' ? '#ef4444' : '#10b981',
            }}>
            {item.type}
          </span>
        </div>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {item.reportedBy?.name} • {item.category?.replace('_', ' ')} • {item.color}
        </p>
      </div>
      <button onClick={() => onDelete(item._id)}
        className="p-2 rounded-lg transition-colors shrink-0"
        style={{ color: 'var(--danger)' }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = {
    pending: { bg: 'rgba(245,158,11,0.12)', text: '#f59e0b' },
    approved: { bg: 'rgba(16,185,129,0.12)', text: '#10b981' },
    rejected: { bg: 'rgba(239,68,68,0.12)', text: '#ef4444' },
  };
  const c = colors[status] || colors.pending;
  return (
    <span className="px-2 py-0.5 rounded text-xs font-semibold capitalize" style={{ background: c.bg, color: c.text }}>
      {status}
    </span>
  );
}

function EmptyState({ message }) {
  return (
    <div className="text-center py-12 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <Package className="w-10 h-10 mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{message}</p>
    </div>
  );
}
