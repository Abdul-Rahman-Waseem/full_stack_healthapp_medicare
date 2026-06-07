// pages/admin/appointments.js
import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import API from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [selected, setSelected] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => { fetchAppointments(); }, []);

  const fetchAppointments = async () => {
    try {
      const { data } = await API.get('/appointments');
      setAppointments(data);
    } catch { toast.error('Failed to load appointments'); }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/appointments/${id}/status`, { status, notes, rejectionReason });
      toast.success(`Appointment ${status}`);
      setSelected(null);
      fetchAppointments();
    } catch { toast.error('Update failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Cancel this appointment?')) return;
    try {
      await API.delete(`/appointments/${id}`);
      toast.success('Appointment cancelled');
      fetchAppointments();
    } catch { toast.error('Failed'); }
  };

  return (
    <Layout>
      <div className="page-header">
        <h1>📅 Appointments</h1>
      </div>

      {/* Status filter summary */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {['pending','confirmed','rejected','completed','cancelled'].map(s => (
          <span key={s} style={{ fontSize: 13 }}>
            <span className={`badge badge-${s}`}>{s}</span>
            {' '}{appointments.filter(a => a.status === s).length}
          </span>
        ))}
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Patient</th><th>Doctor</th><th>Date</th>
                <th>Time</th><th>Reason</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a._id}>
                  <td>{a.patient?.user?.name}</td>
                  <td>{a.doctor?.user?.name}</td>
                  <td>{new Date(a.appointmentDate).toLocaleDateString()}</td>
                  <td>{a.appointmentTime}</td>
                  <td style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.reason}</td>
                  <td><StatusBadge status={a.status} /></td>
                  <td>
                    {a.status === 'pending' && (
                      <>
                        <button className="btn btn-success btn-sm" onClick={() => updateStatus(a._id, 'confirmed')}>✓</button>{' '}
                        <button className="btn btn-danger btn-sm" onClick={() => { setSelected(a); }}>✗</button>{' '}
                      </>
                    )}
                    <button className="btn btn-outline btn-sm" onClick={() => handleDelete(a._id)}>Del</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {appointments.length === 0 && <div className="empty-state"><p>No appointments</p></div>}
        </div>
      </div>

      {/* Rejection reason modal */}
      {selected && (
        <Modal
          title="Reject Appointment"
          onClose={() => setSelected(null)}
          footer={
            <>
              <button className="btn btn-outline" onClick={() => setSelected(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => updateStatus(selected._id, 'rejected')}>Reject</button>
            </>
          }
        >
          <div className="form-group">
            <label>Rejection Reason</label>
            <textarea className="form-control" rows={3} value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              placeholder="Explain why the appointment is being rejected..." />
          </div>
        </Modal>
      )}
    </Layout>
  );
}
