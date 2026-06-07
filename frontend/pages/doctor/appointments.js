// pages/doctor/appointments.js
import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import StatusBadge from '../../components/StatusBadge';
import API from '../../utils/api';
import toast from 'react-hot-toast';

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => { fetch(); }, []);

  const fetch = async () => {
    try {
      const { data } = await API.get('/appointments');
      setAppointments(data);
    } catch { toast.error('Failed to load'); }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/appointments/${id}/status`, { status });
      toast.success(`Appointment ${status}`);
      fetch();
    } catch { toast.error('Error'); }
  };

  return (
    <Layout>
      <div className="page-header"><h1>📅 Appointments</h1></div>
      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr><th>Patient</th><th>Date</th><th>Time</th><th>Reason</th><th>Type</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {appointments.map(a => (
                <tr key={a._id}>
                  <td>{a.patient?.user?.name}</td>
                  <td>{new Date(a.appointmentDate).toLocaleDateString()}</td>
                  <td>{a.appointmentTime}</td>
                  <td>{a.reason}</td>
                  <td>{a.type}</td>
                  <td><StatusBadge status={a.status} /></td>
                  <td>
                    {a.status === 'pending' && (
                      <>
                        <button className="btn btn-success btn-sm" onClick={() => updateStatus(a._id, 'confirmed')}>Confirm</button>{' '}
                        <button className="btn btn-danger btn-sm" onClick={() => updateStatus(a._id, 'rejected')}>Reject</button>
                      </>
                    )}
                    {a.status === 'confirmed' && (
                      <button className="btn btn-outline btn-sm" onClick={() => updateStatus(a._id, 'completed')}>Mark Done</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {appointments.length === 0 && <div className="empty-state"><p>No appointments</p></div>}
        </div>
      </div>
    </Layout>
  );
}
