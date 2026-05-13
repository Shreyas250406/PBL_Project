import { Link, useLocation, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, Users,Package, 
  Search, ShieldCheck, LogOut, Menu, X, ArrowLeft
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const { logout, user } = useAuth();

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { label: 'Users', icon: Users, path: '/admin/users' },
    { label: 'Lost Items', icon: Package, path: '/admin/lost-items' },
    { label: 'Found Items', icon: Package, path: '/admin/found-items' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Sidebar Toggle */}
      <button 
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transition-transform duration-300 transform
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0
      `}>
        <div className="flex flex-col h-full">
          <div className="p-6">
            <Link to="/dashboard" className="flex items-center gap-2 mb-8 text-gray-600 hover:text-black transition-colors">
                <ArrowLeft size={16} />
                <span className="text-sm font-medium">Back to Portal</span>
            </Link>
            <div className="flex items-center gap-3 px-2 mb-8">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <ShieldCheck className="text-amber-600" size={24} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 leading-tight">Admin</h1>
                <p className="text-xs text-gray-500">Control Panel</p>
              </div>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                      ${isActive 
                        ? 'bg-black text-white shadow-lg' 
                        : 'text-gray-600 hover:bg-gray-100'
                      }
                    `}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="mt-auto p-6 border-t border-gray-100">
            <div className="flex items-center gap-3 px-2 mb-6">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {user?.avatar ? (
                    <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                    <span className="text-xs font-bold text-gray-500">{user?.name?.charAt(0)}</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-30">
          <h2 className="text-lg font-bold text-gray-900 capitalize">
            {location.pathname.split('/').pop()?.replace('-', ' ')}
          </h2>
          <div className="flex items-center gap-4">
             <div className="relative hidden md:block">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Quick search..."
                    className="pl-10 pr-4 py-2 bg-gray-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-black transition-all w-64"
                />
             </div>
          </div>
        </header>

        <div className="p-8">
          <Outlet />
        </div>
      </main>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
