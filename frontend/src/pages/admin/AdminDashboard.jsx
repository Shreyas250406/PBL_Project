import { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  Users, Package, CheckCircle, TrendingUp, Clock, AlertTriangle, 
  ArrowRight, Loader 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/admin/stats');
        setStats(res.data.stats);
        setRecentItems(res.data.recentItems);
      } catch (err) {
        console.error('Failed to fetch dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader className="animate-spin text-gray-400" size={32} />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers, icon: Users, color: 'blue' },
    { label: 'Lost Items', value: stats?.totalLost, icon: AlertTriangle, color: 'red' },
    { label: 'Found Items', value: stats?.totalFound, icon: CheckCircle, color: 'emerald' },
    { label: 'Strong Matches', value: stats?.totalMatches, icon: TrendingUp, color: 'amber' },
    { label: 'Total Claims', value: stats?.totalClaims, icon: Package, color: 'purple' },
    { label: 'Pending Claims', value: stats?.pendingClaims, icon: Clock, color: 'orange' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="bg-black text-white p-8 rounded-3xl overflow-hidden relative shadow-2xl">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Dashboard Overview</h1>
          <p className="text-gray-400 max-w-md">Welcome back to the command center. Here's what's happening on the platform today.</p>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
             <ShieldCheck size={200} />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, i) => (
          <div 
            key={i} 
            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group cursor-default"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
                <h3 className="text-2xl font-bold text-gray-900">{stat.value || 0}</h3>
              </div>
              <div className={`
                w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110
                ${stat.color === 'blue' ? 'bg-blue-50 text-blue-600' : ''}
                ${stat.color === 'red' ? 'bg-red-50 text-red-600' : ''}
                ${stat.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : ''}
                ${stat.color === 'amber' ? 'bg-amber-50 text-amber-600' : ''}
                ${stat.color === 'purple' ? 'bg-purple-50 text-purple-600' : ''}
                ${stat.color === 'orange' ? 'bg-orange-50 text-orange-600' : ''}
              `}>
                <stat.icon size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity & Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Items */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">Recent Reports</h3>
            <Link to="/admin/lost-items" className="text-xs font-bold text-black hover:underline flex items-center gap-1">
                View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentItems?.map((item) => (
              <div key={item._id} className="p-4 hover:bg-gray-50 transition-colors flex items-center gap-4">
                <div className={`
                    w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold uppercase
                    ${item.type === 'lost' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}
                `}>
                    {item.type.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.reportedBy?.name} • {new Date(item.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`
                    px-2 py-1 rounded-full text-[10px] font-bold uppercase
                    ${item.status === 'active' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-400'}
                `}>
                    {item.status}
                </span>
              </div>
            ))}
            {(!recentItems || recentItems.length === 0) && (
                <div className="p-8 text-center text-gray-400 text-sm">No recent activity</div>
            )}
          </div>
        </div>

        {/* Quick Actions / Insights */}
        <div className="space-y-6">
            <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100">
                <h4 className="font-bold text-amber-900 mb-2">Automated Matches</h4>
                <p className="text-sm text-amber-800/80 mb-4">
                    The system has identified <b>{stats?.totalMatches || 0}</b> high-confidence matches that await manual verification.
                </p>
                <button className="w-full bg-amber-600 text-white py-3 rounded-xl text-sm font-bold shadow-lg shadow-amber-200 hover:bg-amber-700 transition-colors">
                    Review Matches
                </button>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <h4 className="font-bold text-gray-900 mb-4">Quick Navigation</h4>
                <div className="space-y-3">
                    <Link to="/admin/users" className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-black hover:text-white transition-all group">
                        <span className="text-sm font-medium">User Management</span>
                        <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                    </Link>
                    <Link to="/admin/lost-items" className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-black hover:text-white transition-all group">
                        <span className="text-sm font-medium">Moderate Lost Items</span>
                        <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                    </Link>
                    <Link to="/admin/found-items" className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-black hover:text-white transition-all group">
                        <span className="text-sm font-medium">Moderate Found Items</span>
                        <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                    </Link>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

function ShieldCheck({ size, className }) {
    return (
        <svg 
            width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}
        >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>
        </svg>
    )
}
