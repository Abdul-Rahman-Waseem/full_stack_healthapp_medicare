// pages/admin/treatments.js
import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import API from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminTreatments() {
  const [treatments, setTreatments] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showCheckup, setShowCheckup] = useState(null);
  const [showFollowup, setShowFollowup] = useState(null);
  const [form, setForm] = useState({ appointmentId: '', patientId: '', doctorId: '', diagnosis: '', treatmentPlan: '' });
  const [checkupForm, setCheckupForm] = useState({ bloodPressure: '', heartRate: '', temperature: '', weight: '', notes: '' });
  const [followupForm, setFollowupForm] = useState({ scheduledDate: '', notes: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    const [t, a, p, d] = await Promise.all([
      API.get('/treatments'), API.get('/appointments'),
      API.get('/patients'), API.get('/doctors'),
    ]);
    setTreatments(t.data);
    setAppointments(a.data.filter(ap => ap.status === 'confirmed'));
    setPatients(p.data);
    setDoctors(d.data);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await API.post('/treatments', form);
      toast.success('Treatment started!');
      setShowModal(false);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    } finally { setLoading(false); }
  };

  const handleCheckup = async () => {
    try {
      await API.post(`/treatments/${showCheckup}/checkup`, checkupForm);
      toast.success('Checkup recorded!');
      setShowCheckup(null);
      fetchAll();
    } catch { toast.error('Error'); }
  };

  const handleFollowup = async () => {
    try {
      await API.post(`/treatments/${showFollowup}/followup`, followupForm);
      toast.success('Follow-up scheduled!');
      setShowFollowup(null);
      fetchAll();
    } catch { toast.error('Error'); }
  };

  return (
    <Layout>
      <div className="page-header">
        <h1>🩺 Treatments</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Start Treatment</button>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Patient</th><th>Doctor</th><th>Diagnosis</th>
                <th>Status</th><th>Start Date</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {treatments.map((t) => (
                <tr key={t._id}>
                  <td>{t.patient?.user?.name}</td>
                  <td>{t.doctor?.user?.name}</td>
                  <td>{t.diagnosis}</td>
                  <td><StatusBadge status={t.status} /></td>
                  <td>{new Date(t.startDate).toLocaleDateString()}</td>
                  <td>
                    <button className="btn btn-outline btn-sm" onClick={() => setShowCheckup(t._id)}>Checkup</button>{' '}
                    <button className="btn btn-outline btn-sm" onClick={() => setShowFollowup(t._id)}>Follow-up</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {treatments.length === 0 && <div className="empty-state"><p>No treatments yet</p></div>}
        </div>
      </div>

      {/* Start Treatment Modal */}
      {showModal && (
        <Modal title="Start New Treatment" onClose={() => setShowModal(false)}
          footer={
            <>
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>{loading ? 'Saving...' : 'Start'}</button>
            </>
          }
        >
          <div className="form-group">
            <label>Appointment (confirmed only)</label>
            <select className="form-control" value={form.appointmentId} onChange={e => setForm({ ...form, appointmentId: e.target.value })}>
              <option value="">Select appointment</option>
              {appointments.map(a => (
                <option key={a._id} value={a._id}>
                  {a.patient?.user?.name} — {new Date(a.appointmentDate).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Patient</label>
            <select className="form-control" value={form.patientId} onChange={e => setForm({ ...form, patientId: e.target.value })}>
              <option value="">Select patient</option>
              {patients.map(p => <option key={p._id} value={p._id}>{p.user?.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Doctor</label>
            <select className="form-control" value={form.doctorId} onChange={e => setForm({ ...form, doctorId: e.target.value })}>
              <option value="">Select doctor</option>
              {doctors.map(d => <option key={d._id} value={d._id}>{d.user?.name} ({d.specialization})</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Diagnosis *</label>
            <input className="form-control" value={form.diagnosis} onChange={e => setForm({ ...form, diagnosis: e.target.value })} placeholder="e.g. Hypertension" />
          </div>
          <div className="form-group">
            <label>Treatment Plan</label>
            <textarea className="form-control" rows={3} value={form.treatmentPlan} onChange={e => setForm({ ...form, treatmentPlan: e.target.value })} />
          </div>
        </Modal>
      )}

      {/* Checkup Modal */}
      {showCheckup && (
        <Modal title="Add Physical Checkup" onClose={() => setShowCheckup(null)}
          footer={
            <>
              <button className="btn btn-outline" onClick={() => setShowCheckup(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCheckup}>Save Checkup</button>
            </>
          }
        >
          <div className="form-grid">
            <div className="form-group">
              <label>Blood Pressure</label>
              <input className="form-control" value={checkupForm.bloodPressure} onChange={e => setCheckupForm({ ...checkupForm, bloodPressure: e.target.value })} placeholder="120/80 mmHg" />
            </div>
            <div className="form-group">
              <label>Heart Rate</label>
              <input className="form-control" value={checkupForm.heartRate} onChange={e => setCheckupForm({ ...checkupForm, heartRate: e.target.value })} placeholder="72 bpm" />
            </div>
            <div className="form-group">
              <label>Temperature</label>
              <input className="form-control" value={checkupForm.temperature} onChange={e => setCheckupForm({ ...checkupForm, temperature: e.target.value })} placeholder="98.6°F" />
            </div>
            <div className="form-group">
              <label>Weight</label>
              <input className="form-control" value={checkupForm.weight} onChange={e => setCheckupForm({ ...checkupForm, weight: e.target.value })} placeholder="70 kg" />
            </div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label>Notes</label>
              <textarea className="form-control" rows={2} value={checkupForm.notes} onChange={e => setCheckupForm({ ...checkupForm, notes: e.target.value })} />
            </div>
          </div>
        </Modal>
      )}

      {/* Follow-up Modal */}
      {showFollowup && (
        <Modal title="Schedule Follow-up Visit" onClose={() => setShowFollowup(null)}
          footer={
            <>
              <button className="btn btn-outline" onClick={() => setShowFollowup(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleFollowup}>Schedule</button>
            </>
          }
        >
          <div className="form-group">
            <label>Follow-up Date *</label>
            <input className="form-control" type="date" value={followupForm.scheduledDate} onChange={e => setFollowupForm({ ...followupForm, scheduledDate: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea className="form-control" rows={3} value={followupForm.notes} onChange={e => setFollowupForm({ ...followupForm, notes: e.target.value })} />
          </div>
        </Modal>
      )}
    </Layout>
  );
}
