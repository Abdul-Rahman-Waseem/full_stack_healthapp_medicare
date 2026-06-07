// pages/patient/appointments.js
import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import API from '../../utils/api';
import toast from 'react-hot-toast';

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ doctorId: '', appointmentDate: '', appointmentTime: '', reason: '', type: 'initial' });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setFetching(true);
    try {
      // Fetch separately so one failure doesn't kill the other
      const [aRes, dRes] = await Promise.allSettled([
        API.get('/appointments'),
        API.get('/doctors'),
      ]);

      if (aRes.status === 'fulfilled') setAppointments(aRes.value.data);
      else setAppointments([]);  // no appointments yet — that's fine

      if (dRes.status === 'fulfilled') setDoctors(dRes.value.data);
      else toast.error('Could not load doctors list');

    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.doctorId || !form.appointmentDate || !form.appointmentTime || !form.reason) {
      return toast.error('All fields are required');
    }
    setLoading(true);
    try {
      await API.post('/appointments', form);
      toast.success('Appointment booked! Waiting for confirmation.');
      setShowModal(false);
      setForm({ doctorId: '', appointmentDate: '', appointmentTime: '', reason: '', type: 'initial' });
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally { setLoading(false); }
  };

  const handleCancel = async (id) => {
    if (!confirm('Cancel this appointment?')) return;
    try {
      await API.delete(`/appointments/${id}`);
      toast.success('Appointment cancelled');
      fetchAll();
    } catch { toast.error('Error cancelling appointment'); }
  };

  return (
    <Layout>
      <div className="page-header">
        <h1>📅 My Appointments</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Book Appointment</button>
      </div>

      <div className="card">
        {fetching ? (
          <div className="loading">Loading...</div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Doctor</th><th>Specialization</th><th>Date</th>
                  <th>Time</th><th>Reason</th><th>Status</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map(a => (
                  <tr key={a._id}>
                    <td>{a.doctor?.user?.name}</td>
                    <td>{a.doctor?.specialization}</td>
                    <td>{new Date(a.appointmentDate).toLocaleDateString()}</td>
                    <td>{a.appointmentTime}</td>
                    <td>{a.reason}</td>
                    <td><StatusBadge status={a.status} /></td>
                    <td>
                      {a.status === 'pending' && (
                        <button className="btn btn-danger btn-sm" onClick={() => handleCancel(a._id)}>Cancel</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {appointments.length === 0 && (
              <div className="empty-state">
                <div style={{ fontSize: 48 }}>📅</div>
                <p>No appointments yet. Book your first one!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <Modal
          title="Book New Appointment"
          onClose={() => setShowModal(false)}
          footer={
            <>
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Booking...' : 'Book Appointment'}
              </button>
            </>
          }
        >
          <div className="form-group">
            <label>Select Doctor *</label>
            <select
              className="form-control"
              value={form.doctorId}
              onChange={e => setForm({ ...form, doctorId: e.target.value })}
            >
              <option value="">— Choose a doctor —</option>
              {doctors.map(d => (
                <option key={d._id} value={d._id}>
                  {d.user?.name} — {d.specialization} {d.fee ? `(PKR ${d.fee.toLocaleString()})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Date *</label>
              <input
                className="form-control"
                type="date"
                value={form.appointmentDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setForm({ ...form, appointmentDate: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Time *</label>
              <input
                className="form-control"
                type="time"
                value={form.appointmentTime}
                onChange={e => setForm({ ...form, appointmentTime: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Appointment Type</label>
            <select className="form-control" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
              <option value="initial">Initial Consultation</option>
              <option value="followup">Follow-up</option>
              <option value="checkup">General Checkup</option>
            </select>
          </div>

          <div className="form-group">
            <label>Reason for Visit *</label>
            <textarea
              className="form-control"
              rows={3}
              value={form.reason}
              onChange={e => setForm({ ...form, reason: e.target.value })}
              placeholder="Describe your symptoms or reason for visit..."
            />
          </div>
        </Modal>
      )}
    </Layout>
  );
}
