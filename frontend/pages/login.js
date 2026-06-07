// pages/login.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../utils/AuthContext';
import API from '../utils/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post('/auth/login', form);
      login(data.user, data.token);
      toast.success(`Welcome back, ${data.user.name}!`);
      router.push(`/${data.user.role}/dashboard`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>🏥 MediCare</h1>
        <p>Sign in to your account to continue</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              className="form-control"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              className="form-control"
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <button className="btn btn-primary" style={{ width: '100%', padding: '12px', marginTop: 8 }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ marginTop: 20, textAlign: 'center', fontSize: 14, color: '#64748b' }}>
          Don't have an account?{' '}
          <Link href="/register" style={{ color: '#2563eb', fontWeight: 600 }}>Register</Link>
        </p>

        {/* Quick login hints for demo */}
        <div style={{ marginTop: 20, padding: 12, background: '#f1f5f9', borderRadius: 8, fontSize: 12, color: '#64748b' }}>
          <strong>Demo Credentials:</strong><br/>
          Admin: admin@hospital.com / password123<br/>
          Doctor: ahmed.khan@hospital.com / password123<br/>
          Patient: ali.hassan@email.com / password123
        </div>
      </div>
    </div>
  );
}
