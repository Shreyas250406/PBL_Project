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
        <Loader className="w-8 h-8 animate-spin" style={{ color: '#111827' }} />
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
    <div className="page-container animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ background: '#fffbeb' }}>
          <ShieldCheck className="w-5 h-5" style={{ color: '#d97706' }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#111827' }}>Admin Panel</h1>
          <p className="text-sm" style={{ color: '#6b7280' }}>Manage items, claims, and matches</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1.5 rounded-xl mb-8 w-fit"
        style={{ background: '#f3f4f6', border: '1px solid #e5e7eb' }}>
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer"
            style={{
              color: activeTab === tab.id ? '#ffffff' : '#6b7280',
              background: activeTab === tab.id ? '#111827' : 'transparent',
            }}>
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && stats && (
        <div className="stagger">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
            <AdminStatCard icon={AlertTriangle} label="Total Lost" value={stats.totalLost} color="#dc2626" bg="#fef2f2" />
            <AdminStatCard icon={CheckCircle} label="Total Found" value={stats.totalFound} color="#059669" bg="#ecfdf5" />
            <AdminStatCard icon={TrendingUp} label="Strong Matches" value={stats.totalMatches} color="#d97706" bg="#fffbeb" />
            <AdminStatCard icon={Package} label="Total Claims" value={stats.totalClaims} color="#111827" bg="#f3f4f6" />
            <AdminStatCard icon={Clock} label="Pending Claims" value={stats.pendingClaims} color="#ea580c" bg="#fff7ed" />
            <AdminStatCard icon={Users} label="Total Users" value={stats.totalUsers} color="#2563eb" bg="#eff6ff" />
          </div>

          <h3 className="text-lg font-bold mb-5" style={{ color: '#111827' }}>Recent Items</h3>
          <div className="space-y-3">
            {items.map((item) => (
              <ItemRow key={item._id} item={item} onDelete={handleDeleteItem} />
            ))}
          </div>
        </div>
      )}

      {/* Items Tab */}
      {activeTab === 'items' && (
        <div className="space-y-3 stagger">
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
        <div className="space-y-4 stagger">
          {claims.length === 0 ? (
            <EmptyState message="No claims yet" />
          ) : (
            claims.map((claim) => (
              <div key={claim._id} className="p-5 rounded-xl flex flex-col sm:flex-row sm:items-center gap-4"
                style={{ background: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-sm font-semibold truncate" style={{ color: '#111827' }}>
                      {claim.itemId?.name || 'Unknown Item'}
                    </span>
                    <StatusBadge status={claim.status} />
                  </div>
                  <p className="text-xs truncate" style={{ color: '#9ca3af' }}>
                    Claimed by: {claim.claimedBy?.name} ({claim.claimedBy?.email})
                  </p>
                  <p className="text-xs mt-1.5" style={{ color: '#6b7280' }}>
                    "{claim.message}"
                  </p>
                </div>
                {claim.status === 'pending' && (
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => handleClaimAction(claim._id, 'approved')}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white cursor-pointer transition-all duration-200"
                      style={{ background: '#059669' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#047857'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#059669'}>
                      <Check className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button onClick={() => handleClaimAction(claim._id, 'rejected')}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white cursor-pointer transition-all duration-200"
                      style={{ background: '#dc2626' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#b91c1c'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#dc2626'}>
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
        <div className="space-y-4 stagger">
          {matches.length === 0 ? (
            <EmptyState message="No matches found" />
          ) : (
            matches.map((match) => (
              <div key={match._id} className="p-5 rounded-xl"
                style={{ background: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 text-sm">
                      <span className="font-semibold" style={{ color: '#dc2626' }}>
                        {match.lostItemId?.name || '?'}
                      </span>
                      <span style={{ color: '#d1d5db' }}>↔</span>
                      <span className="font-semibold" style={{ color: '#059669' }}>
                        {match.foundItemId?.name || '?'}
                      </span>
                    </div>
                    <div className="score-bar mt-3 w-48">
                      <div className="score-bar-fill"
                        style={{
                          width: `${match.matchScore}%`,
                          background: match.matchScore >= 80 ? '#059669' : match.matchScore >= 60 ? '#d97706' : '#9ca3af',
                        }}></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold"
                      style={{ color: match.matchScore >= 80 ? '#059669' : match.matchScore >= 60 ? '#d97706' : '#9ca3af' }}>
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

function AdminStatCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div className="p-5 rounded-2xl transition-all duration-200"
      style={{ background: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = color; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; }}>
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: bg }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <div>
          <p className="text-2xl font-bold" style={{ color: '#111827' }}>{value}</p>
          <p className="text-xs" style={{ color: '#9ca3af' }}>{label}</p>
        </div>
      </div>
    </div>
  );
}

function ItemRow({ item, onDelete }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl transition-all duration-200"
      style={{ background: '#ffffff', border: '1px solid #e5e7eb' }}
      onMouseEnter={(e) => { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.boxShadow = 'none'; }}>
      {item.imageUrl ? (
        <img src={item.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
      ) : (
        <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: '#f3f4f6', color: '#9ca3af', fontSize: '10px' }}>
          N/A
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold truncate" style={{ color: '#111827' }}>{item.name}</span>
          <span className="px-2 py-0.5 rounded text-xs font-bold uppercase"
            style={{
              background: item.type === 'lost' ? '#fef2f2' : '#ecfdf5',
              color: item.type === 'lost' ? '#dc2626' : '#059669',
            }}>
            {item.type}
          </span>
        </div>
        <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>
          {item.reportedBy?.name} • {item.category?.replace('_', ' ')} • {item.color}
        </p>
      </div>
      <button onClick={() => onDelete(item._id)}
        className="p-2 rounded-lg transition-all duration-200 shrink-0 cursor-pointer"
        style={{ color: '#dc2626', background: 'transparent' }}
        onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = {
    pending: { bg: '#fffbeb', text: '#d97706' },
    approved: { bg: '#ecfdf5', text: '#059669' },
    rejected: { bg: '#fef2f2', text: '#dc2626' },
  };
  const c = colors[status] || colors.pending;
  return (
    <span className="px-2.5 py-0.5 rounded text-xs font-semibold capitalize"
      style={{ background: c.bg, color: c.text }}>
      {status}
    </span>
  );
}

function EmptyState({ message }) {
  return (
    <div className="text-center py-16 rounded-2xl"
      style={{ background: '#f9fafb', border: '1px solid #e5e7eb' }}>
      <Package className="w-10 h-10 mx-auto mb-3" style={{ color: '#d1d5db' }} />
      <p className="text-sm" style={{ color: '#9ca3af' }}>{message}</p>
    </div>
  );
}
