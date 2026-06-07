// pages/register.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../utils/AuthContext';
import API from '../utils/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'patient' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post('/auth/register', form);
      login(data.user, data.token);
      toast.success('Account created successfully!');
      router.push(`/${data.user.role}/dashboard`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>🏥 MediCare</h1>
        <p>Create your account</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input className="form-control" name="name" placeholder="John Doe"
              value={form.name} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input className="form-control" type="email" name="email" placeholder="you@example.com"
              value={form.email} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input className="form-control" name="phone" placeholder="+92 300 0000000"
              value={form.phone} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input className="form-control" type="password" name="password" placeholder="Min 6 characters"
              value={form.password} onChange={handleChange} required minLength={6} />
          </div>

          <div className="form-group">
            <label>Role</label>
            <select className="form-control" name="role" value={form.role} onChange={handleChange}>
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
            </select>
          </div>

          <button className="btn btn-primary" style={{ width: '100%', padding: '12px', marginTop: 8 }} disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={{ marginTop: 20, textAlign: 'center', fontSize: 14, color: '#64748b' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: '#2563eb', fontWeight: 600 }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}
