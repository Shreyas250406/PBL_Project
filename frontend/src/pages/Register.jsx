import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, User, Mail, Lock, AlertCircle, Loader } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match');
    }
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full pl-11 pr-4 py-3.5 rounded-xl text-sm outline-none transition-all duration-200";

  const inputStyle = {
    background: '#f9fafb',
    color: '#111827',
    border: '1px solid #e5e7eb',
  };

  const handleFocus = (e) => { e.currentTarget.style.borderColor = '#111827'; e.currentTarget.style.background = '#ffffff'; };
  const handleBlur = (e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = '#f9fafb'; };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: '#f9fafb' }}>

      <div className="w-full max-w-md animate-fade-in">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5"
            style={{ background: '#111827' }}>
            <span className="text-white font-bold text-xl">LF</span>
          </div>
          <h1 className="text-3xl font-bold" style={{ color: '#111827' }}>
            Create Account
          </h1>
          <p className="mt-2 text-sm" style={{ color: '#6b7280' }}>
            Join Campus Lost & Found to get started
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl p-8 sm:p-10"
          style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
          }}>
          {error && (
            <div className="flex items-center gap-3 p-4 rounded-xl mb-6 animate-fade-in"
              style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
              <AlertCircle className="w-4 h-4 shrink-0" style={{ color: '#dc2626' }} />
              <p className="text-sm" style={{ color: '#dc2626' }}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9ca3af' }} />
                <input
                  type="text" required value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="John Doe"
                  className={inputClass} style={inputStyle}
                  onFocus={handleFocus} onBlur={handleBlur}
                  id="register-name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9ca3af' }} />
                <input
                  type="email" required value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@university.edu"
                  className={inputClass} style={inputStyle}
                  onFocus={handleFocus} onBlur={handleBlur}
                  id="register-email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9ca3af' }} />
                <input
                  type="password" required value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Min 6 characters"
                  className={inputClass} style={inputStyle}
                  onFocus={handleFocus} onBlur={handleBlur}
                  id="register-password"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9ca3af' }} />
                <input
                  type="password" required value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  placeholder="Repeat password"
                  className={inputClass} style={inputStyle}
                  onFocus={handleFocus} onBlur={handleBlur}
                  id="register-confirm"
                />
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-white font-semibold text-sm transition-all duration-200 disabled:opacity-50 cursor-pointer mt-3"
              style={{ background: '#111827' }}
              onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.background = '#1f2937'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'; } }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#111827'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              id="register-submit"
            >
              {loading ? <Loader className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center mt-8 text-sm" style={{ color: '#9ca3af' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-semibold" style={{ color: '#111827' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
