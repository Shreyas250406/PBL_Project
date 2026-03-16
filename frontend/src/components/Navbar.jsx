import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Search, Bell, Menu, X, LogOut, LayoutDashboard, FileText, Eye, ShieldCheck,
  ChevronDown, User
} from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {}
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/lost-items?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/report-lost', label: 'Report Lost', icon: FileText },
    { to: '/report-found', label: 'Report Found', icon: FileText },
    { to: '/lost-items', label: 'Lost Items', icon: Eye },
    { to: '/found-items', label: 'Found Items', icon: Eye },
    ...(isAdmin ? [{ to: '/admin', label: 'Admin', icon: ShieldCheck }] : []),
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50"
      style={{
        background: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid #e5e7eb',
      }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm"
              style={{ background: '#111827' }}>
              LF
            </div>
            <span className="text-lg font-bold hidden sm:block" style={{ color: '#111827' }}>
              Campus <span style={{ color: '#6b7280' }}>L&F</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  color: isActive(link.to) ? '#111827' : '#6b7280',
                  background: isActive(link.to) ? '#f3f4f6' : 'transparent',
                }}
                onMouseEnter={(e) => {
                  if (!isActive(link.to)) { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.color = '#374151'; }
                }}
                onMouseLeave={(e) => {
                  if (!isActive(link.to)) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6b7280'; }
                }}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
          </div>

          {/* Search + Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <form onSubmit={handleSearch} className="hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9ca3af' }} />
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 rounded-xl text-sm w-48 focus:w-64 transition-all duration-300 outline-none"
                  style={{
                    background: '#f3f4f6',
                    color: '#111827',
                    border: '1px solid #e5e7eb',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#111827'; e.currentTarget.style.background = '#ffffff'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = '#f3f4f6'; }}
                />
              </div>
            </form>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 rounded-xl transition-all duration-200 cursor-pointer"
                style={{ color: '#6b7280', background: 'transparent', border: 'none' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.color = '#111827'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6b7280'; }}
                id="notification-bell"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-bold"
                    style={{ background: '#dc2626', fontSize: '10px' }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-xl overflow-hidden animate-scale-in"
                  style={{ background: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
                  <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <h3 className="font-semibold text-sm" style={{ color: '#111827' }}>Notifications</h3>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="text-xs font-medium cursor-pointer"
                        style={{ color: '#111827', background: 'none', border: 'none' }}>
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-center py-10 text-sm" style={{ color: '#9ca3af' }}>No notifications</p>
                    ) : (
                      notifications.slice(0, 8).map((n) => (
                        <div
                          key={n._id}
                          className="px-4 py-3 transition-colors cursor-pointer"
                          style={{
                            background: n.read ? 'transparent' : '#f9fafb',
                            borderBottom: '1px solid #f3f4f6',
                          }}
                          onClick={() => {
                            if (n.relatedItemId) navigate(`/item/${n.relatedItemId}`);
                            setNotifOpen(false);
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                          onMouseLeave={(e) => e.currentTarget.style.background = n.read ? 'transparent' : '#f9fafb'}
                        >
                          <p className="text-sm font-medium" style={{ color: '#111827' }}>{n.title}</p>
                          <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl transition-all duration-200 cursor-pointer"
                style={{ background: 'transparent', border: 'none' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                id="profile-menu"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                  style={{ background: '#111827' }}>
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <ChevronDown className="w-4 h-4 hidden sm:block" style={{ color: '#9ca3af' }} />
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl overflow-hidden animate-scale-in"
                  style={{ background: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
                  <div className="px-4 py-3" style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <p className="text-sm font-semibold" style={{ color: '#111827' }}>{user?.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>{user?.email}</p>
                    <span className="inline-block mt-1.5 px-2 py-0.5 rounded text-xs font-medium"
                      style={{
                        background: user?.role === 'admin' ? '#fffbeb' : '#f3f4f6',
                        color: user?.role === 'admin' ? '#d97706' : '#6b7280',
                      }}>
                      {user?.role}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-3 text-sm font-medium transition-colors cursor-pointer"
                    style={{ color: '#dc2626', background: 'transparent', border: 'none' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    id="logout-button"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 rounded-xl cursor-pointer"
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{ color: '#374151', background: 'transparent', border: 'none' }}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="lg:hidden pb-4 animate-fade-in" style={{ borderTop: '1px solid #f3f4f6' }}>
            <form onSubmit={handleSearch} className="mt-3 mb-3 md:hidden">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9ca3af' }} />
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: '#f3f4f6', color: '#111827', border: '1px solid #e5e7eb' }}
                />
              </div>
            </form>
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2.5 px-3 py-3 rounded-xl text-sm font-medium transition-colors"
                style={{
                  color: isActive(link.to) ? '#111827' : '#6b7280',
                  background: isActive(link.to) ? '#f3f4f6' : 'transparent',
                }}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
