import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ItemCard from '../components/ItemCard';
import MatchList from '../components/MatchList';
import {
  MapPin, Search as SearchIcon, Plus, Eye, TrendingUp, AlertTriangle,
  Package, ArrowRight, Loader, CheckCircle
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [myItems, setMyItems] = useState([]);
  const [matches, setMatches] = useState([]);
  const [recentLost, setRecentLost] = useState([]);
  const [recentFound, setRecentFound] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [itemsRes, matchRes, lostRes, foundRes] = await Promise.all([
        api.get('/items/my/items'),
        api.get('/matches'),
        api.get('/items/lost?limit=4'),
        api.get('/items/found?limit=4'),
      ]);
      setMyItems(itemsRes.data.items || []);
      setMatches(matchRes.data.matches || []);
      setRecentLost(lostRes.data.items || []);
      setRecentFound(foundRes.data.items || []);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const myLostCount = myItems.filter((i) => i.type === 'lost').length;
  const myFoundCount = myItems.filter((i) => i.type === 'found').length;
  const strongMatches = matches.filter((m) => m.matchScore > 60).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader className="w-8 h-8 animate-spin" style={{ color: 'var(--primary)' }} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Welcome Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Welcome back, <span style={{ color: 'var(--primary-light)' }}>{user?.name?.split(' ')[0]}</span> 👋
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Here's what's happening with your lost & found items
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger">
        <StatCard icon={AlertTriangle} label="My Lost Reports" value={myLostCount} color="#ef4444" bg="rgba(239,68,68,0.1)" />
        <StatCard icon={CheckCircle} label="My Found Reports" value={myFoundCount} color="#10b981" bg="rgba(16,185,129,0.1)" />
        <StatCard icon={TrendingUp} label="Strong Matches" value={strongMatches} color="#f59e0b" bg="rgba(245,158,11,0.1)" />
        <StatCard icon={Package} label="Total Items" value={myItems.length} color="#6366f1" bg="rgba(99,102,241,0.1)" />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 stagger">
        <Link
          to="/report-lost"
          className="group flex items-center gap-4 p-5 rounded-2xl transition-all duration-300"
          style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.12), rgba(239,68,68,0.04))', border: '1px solid rgba(239,68,68,0.2)' }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(239,68,68,0.15)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          id="quick-report-lost"
        >
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(239,68,68,0.15)' }}>
            <AlertTriangle className="w-6 h-6" style={{ color: '#ef4444' }} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Report Lost Item</h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Lost something? Report it now</p>
          </div>
          <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" style={{ color: '#ef4444' }} />
        </Link>

        <Link
          to="/report-found"
          className="group flex items-center gap-4 p-5 rounded-2xl transition-all duration-300"
          style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(16,185,129,0.04))', border: '1px solid rgba(16,185,129,0.2)' }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(16,185,129,0.15)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          id="quick-report-found"
        >
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(16,185,129,0.15)' }}>
            <CheckCircle className="w-6 h-6" style={{ color: '#10b981' }} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Report Found Item</h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Found something? Help return it</p>
          </div>
          <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" style={{ color: '#10b981' }} />
        </Link>
      </div>

      {/* Matching Suggestions */}
      {matches.length > 0 && (
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <TrendingUp className="w-5 h-5" style={{ color: 'var(--accent)' }} />
              Matching Suggestions
            </h2>
          </div>
          <MatchList matches={matches.slice(0, 5)} />
        </div>
      )}

      {/* Recent Lost Items */}
      <div className="mb-8 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Recent Lost Items</h2>
          <Link to="/lost-items" className="flex items-center gap-1 text-sm font-medium" style={{ color: 'var(--primary-light)' }}>
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {recentLost.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger">
            {recentLost.map((item) => (
              <ItemCard key={item._id} item={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <Package className="w-10 h-10 mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No lost items reported yet</p>
          </div>
        )}
      </div>

      {/* Recent Found Items */}
      <div className="animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Recent Found Items</h2>
          <Link to="/found-items" className="flex items-center gap-1 text-sm font-medium" style={{ color: 'var(--primary-light)' }}>
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {recentFound.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger">
            {recentFound.map((item) => (
              <ItemCard key={item._id} item={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <Package className="w-10 h-10 mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No found items reported yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div className="p-4 rounded-2xl transition-all duration-200"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      onMouseEnter={(e) => e.currentTarget.style.borderColor = color}
      onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: bg }}>
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
