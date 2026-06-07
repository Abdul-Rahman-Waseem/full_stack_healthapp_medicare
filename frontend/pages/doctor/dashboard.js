// pages/doctor/dashboard.js
import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import API from '../../utils/api';
import { useAuth } from '../../utils/AuthContext';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [treatments, setTreatments] = useState([]);

  useEffect(() => {
    API.get('/appointments').then(r => setAppointments(r.data)).catch(() => {});
    API.get('/treatments').then(r => setTreatments(r.data)).catch(() => {});
  }, []);

  const pending = appointments.filter(a => a.status === 'pending').length;
  const confirmed = appointments.filter(a => a.status === 'confirmed').length;
  const today = appointments.filter(a => {
    const d = new Date(a.appointmentDate);
    const n = new Date();
    return d.toDateString() === n.toDateString();
  });

  return (
    <Layout>
      <div className="page-header">
        <h1>Doctor Dashboard</h1>
        <span style={{ color: '#64748b', fontSize: 14 }}>Dr. {user?.name}</span>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7' }}>⏳</div>
          <div className="stat-info"><h3>{pending}</h3><p>Pending Appointments</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#d1fae5' }}>✅</div>
          <div className="stat-info"><h3>{confirmed}</h3><p>Confirmed Appointments</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dbeafe' }}>📅</div>
          <div className="stat-info"><h3>{today.length}</h3><p>Today's Appointments</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fce7f3' }}>🩺</div>
          <div className="stat-info"><h3>{treatments.length}</h3><p>Active Treatments</p></div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Today's Appointments</div>
        {today.length === 0 ? (
          <div className="empty-state"><p>No appointments today</p></div>
        ) : (
          <div className="table-container">
            <table>
              <thead><tr><th>Patient</th><th>Time</th><th>Reason</th><th>Status</th></tr></thead>
              <tbody>
                {today.map(a => (
                  <tr key={a._id}>
                    <td>{a.patient?.user?.name}</td>
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
