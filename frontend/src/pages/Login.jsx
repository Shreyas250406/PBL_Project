import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, AlertCircle, Loader } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 16px',
      background: '#f9fafb',
    }}>
      <div style={{ width: '100%', maxWidth: '440px' }} className="animate-fade-in">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: '#111827',
            marginBottom: '20px',
          }}>
            <span style={{ color: 'white', fontWeight: 700, fontSize: '20px' }}>LF</span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#111827', margin: 0 }}>
            Welcome Back
          </h1>
          <p style={{ marginTop: '8px', fontSize: '14px', color: '#6b7280' }}>
            Sign in to Campus Lost &amp; Found
          </p>
        </div>

        {/* Form Card */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '16px',
          padding: '40px 36px',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
        }}>
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '14px 16px',
              borderRadius: '12px',
              marginBottom: '28px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
            }} className="animate-fade-in">
              <AlertCircle style={{ width: '16px', height: '16px', flexShrink: 0, color: '#dc2626' }} />
              <p style={{ fontSize: '14px', color: '#dc2626', margin: 0 }}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email Field */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 500,
                color: '#374151',
                marginBottom: '10px',
              }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '16px',
                  height: '16px',
                  color: '#9ca3af',
                }} />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@university.edu"
                  style={{
                    width: '100%',
                    paddingLeft: '44px',
                    paddingRight: '16px',
                    paddingTop: '14px',
                    paddingBottom: '14px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    outline: 'none',
                    background: '#f9fafb',
                    color: '#111827',
                    border: '1.5px solid #e5e7eb',
                    transition: 'border-color 0.2s, background 0.2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#111827'; e.currentTarget.style.background = '#ffffff'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = '#f9fafb'; }}
                  id="login-email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div style={{ marginBottom: '32px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 500,
                color: '#374151',
                marginBottom: '10px',
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '16px',
                  height: '16px',
                  color: '#9ca3af',
                }} />
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    paddingLeft: '44px',
                    paddingRight: '16px',
                    paddingTop: '14px',
                    paddingBottom: '14px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    outline: 'none',
                    background: '#f9fafb',
                    color: '#111827',
                    border: '1.5px solid #e5e7eb',
                    transition: 'border-color 0.2s, background 0.2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#111827'; e.currentTarget.style.background = '#ffffff'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = '#f9fafb'; }}
                  id="login-password"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '14px 24px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#ffffff',
                background: '#111827',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.background = '#1f2937'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'; } }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#111827'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              id="login-submit"
            >
              {loading ? <Loader style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} /> : <LogIn style={{ width: '16px', height: '16px' }} />}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '28px', fontSize: '14px', color: '#9ca3af' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ fontWeight: 600, color: '#111827', textDecoration: 'none' }}>
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
