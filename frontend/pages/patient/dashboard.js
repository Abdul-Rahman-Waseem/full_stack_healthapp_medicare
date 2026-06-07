// pages/patient/dashboard.js
import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import API from '../../utils/api';
import { useAuth } from '../../utils/AuthContext';
import { useRouter } from 'next/router';

export default function PatientDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Use allSettled so a 404 on one doesn't crash the whole dashboard
    Promise.allSettled([
      API.get('/appointments'),
      API.get('/treatments'),
      API.get('/prescriptions'),
      API.get('/notifications'),
    ]).then(([a, t, p, n]) => {
      if (a.status === 'fulfilled') setAppointments(a.value.data);
      if (t.status === 'fulfilled') setTreatments(t.value.data);
      if (p.status === 'fulfilled') setPrescriptions(p.value.data);
      if (n.status === 'fulfilled') setNotifications(n.value.data.filter(x => !x.isRead));
    });
  }, []);

  const upcoming = appointments.filter(a => a.status === 'confirmed' || a.status === 'pending');

  return (
    <Layout>
      <div className="page-header">
        <h1>My Dashboard</h1>
        <span style={{ color: '#64748b', fontSize: 14 }}>Welcome, {user?.name}</span>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dbeafe' }}>📅</div>
          <div className="stat-info"><h3>{upcoming.length}</h3><p>Upcoming Appointments</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#d1fae5' }}>🩺</div>
          <div className="stat-info"><h3>{treatments.length}</h3><p>Treatments</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fce7f3' }}>💊</div>
          <div className="stat-info"><h3>{prescriptions.length}</h3><p>Prescriptions</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7' }}>🔔</div>
          <div className="stat-info"><h3>{notifications.length}</h3><p>Unread Alerts</p></div>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <button className="btn btn-primary" onClick={() => router.push('/patient/appointments')}>
          + Book Appointment
        </button>
        <button className="btn btn-outline" onClick={() => router.push('/patient/notifications')}>
          🔔 View Notifications
        </button>
      </div>

      {/* Upcoming appointments */}
      <div className="card">
        <div className="card-title">Upcoming Appointments</div>
        {upcoming.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: 48 }}>📅</div>
            <p>No upcoming appointments. Book one now!</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr><th>Doctor</th><th>Date</th><th>Time</th><th>Reason</th><th>Status</th></tr>
              </thead>
              <tbody>
                {upcoming.map(a => (
                  <tr key={a._id}>
                    <td>{a.doctor?.user?.name}</td>
                    <td>{new Date(a.appointmentDate).toLocaleDateString()}</td>
                    <td>{a.appointmentTime}</td>
                    <td>{a.reason}</td>
                    <td><span className={`badge badge-${a.status}`}>{a.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
