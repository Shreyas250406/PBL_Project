import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Mail, Lock, AlertCircle, Loader, ArrowRight } from 'lucide-react';

export default function AdminLogin() {
  const { login, user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user && isAdmin) {
    return <Navigate to="/admin/dashboard" />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userData = await login(form.email, form.password);
      if (userData.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        setError('Access denied. This portal is for administrators only.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-amber-100 mb-6">
            <ShieldCheck className="text-amber-600" size={40} />
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Admin Portal</h1>
          <p className="text-gray-500 mt-2">Secure access for platform moderators</p>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-gray-200 shadow-xl shadow-gray-200/50">
          {error && (
            <div className="flex items-start gap-3 p-4 mb-6 rounded-2xl bg-red-50 border border-red-100">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 font-medium leading-relaxed">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                Admin Email
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={18} />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl text-sm focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 transition-all outline-none"
                  placeholder="admin@campus.edu"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={18} />
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl text-sm focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 transition-all outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-black text-white rounded-2xl font-bold text-sm shadow-xl shadow-black/20 hover:bg-gray-900 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Access Terminal <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center">
            <button 
                onClick={() => navigate('/login')}
                className="text-xs font-bold text-gray-400 hover:text-black transition-colors uppercase tracking-widest"
            >
                Return to User Login
            </button>
        </div>
      </div>
    </div>
  );
}
