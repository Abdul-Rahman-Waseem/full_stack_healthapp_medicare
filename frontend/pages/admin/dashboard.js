// pages/admin/dashboard.js
import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import API from '../../utils/api';
import { useAuth } from '../../utils/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ doctors: 0, patients: 0, appointments: 0, treatments: 0 });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [doctors, patients, appointments, treatments] = await Promise.all([
        API.get('/doctors'),
        API.get('/patients'),
        API.get('/appointments'),
        API.get('/treatments'),
      ]);
      setStats({
        doctors: doctors.data.length,
        patients: patients.data.length,
        appointments: appointments.data.length,
        treatments: treatments.data.length,
      });
      setRecentAppointments(appointments.data.slice(0, 5));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Layout><div className="loading">Loading...</div></Layout>;

  return (
    <Layout>
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <span style={{ color: '#64748b', fontSize: 14 }}>Welcome back, {user?.name}</span>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dbeafe' }}>👨‍⚕️</div>
          <div className="stat-info"><h3>{stats.doctors}</h3><p>Total Doctors</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#d1fae5' }}>🧑‍🤝‍🧑</div>
          <div className="stat-info"><h3>{stats.patients}</h3><p>Total Patients</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7' }}>📅</div>
          <div className="stat-info"><h3>{stats.appointments}</h3><p>Total Appointments</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fce7f3' }}>🩺</div>
          <div className="stat-info"><h3>{stats.treatments}</h3><p>Active Treatments</p></div>
        </div>
      </div>

      {/* Recent Appointments */}
      <div className="card">
        <div className="card-title">Recent Appointments</div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Patient</th><th>Doctor</th><th>Date</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentAppointments.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', color: '#64748b' }}>No appointments yet</td></tr>
              ) : (
                recentAppointments.map((a) => (
                  <tr key={a._id}>
                    <td>{a.patient?.user?.name || '—'}</td>
                    <td>{a.doctor?.user?.name || '—'}</td>
                    <td>{new Date(a.appointmentDate).toLocaleDateString()}</td>
                    <td><span className={`badge badge-${a.status}`}>{a.status}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
