// pages/admin/prescriptions.js
import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import Modal from '../../components/Modal';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const emptyMed = { name: '', dosage: '', frequency: '', duration: '', timing: 'after meal', instructions: '' };

export default function AdminPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ appointmentId: '', patientId: '', doctorId: '', medications: [{ ...emptyMed }], notes: '', validUntil: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    const [p, a, pa, d] = await Promise.all([
      API.get('/prescriptions'), API.get('/appointments'),
      API.get('/patients'), API.get('/doctors'),
    ]);
    setPrescriptions(p.data);
    setAppointments(a.data.filter(a => a.status === 'confirmed'));
    setPatients(pa.data);
    setDoctors(d.data);
  };

  const addMedication = () => setForm({ ...form, medications: [...form.medications, { ...emptyMed }] });

  const updateMed = (idx, field, val) => {
    const meds = [...form.medications];
    meds[idx][field] = val;
    setForm({ ...form, medications: meds });
  };

  const removeMed = (idx) => {
    const meds = form.medications.filter((_, i) => i !== idx);
    setForm({ ...form, medications: meds });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await API.post('/prescriptions', form);
      toast.success('Prescription created!');
      setShowModal(false);
      setForm({ appointmentId: '', patientId: '', doctorId: '', medications: [{ ...emptyMed }], notes: '', validUntil: '' });
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete prescription?')) return;
    try {
      await API.delete(`/prescriptions/${id}`);
      toast.success('Deleted');
      fetchAll();
    } catch { toast.error('Error'); }
  };

  return (
    <Layout>
      <div className="page-header">
        <h1>💊 Prescriptions</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Prescription</button>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Patient</th><th>Doctor</th><th>Medications</th><th>Valid Until</th><th>Created</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {prescriptions.map((p) => (
                <tr key={p._id}>
                  <td>{p.patient?.user?.name}</td>
                  <td>{p.doctor?.user?.name}</td>
                  <td>{p.medications?.length} medication(s)</td>
                  <td>{p.validUntil ? new Date(p.validUntil).toLocaleDateString() : '—'}</td>
                  <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {prescriptions.length === 0 && <div className="empty-state"><p>No prescriptions</p></div>}
        </div>
      </div>

      {showModal && (
        <Modal
          title="New Prescription"
          onClose={() => setShowModal(false)}
          footer={
            <>
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
            </>
          }
        >
          <div className="form-group">
            <label>Appointment</label>
            <select className="form-control" value={form.appointmentId} onChange={e => setForm({ ...form, appointmentId: e.target.value })}>
              <option value="">Select appointment</option>
              {appointments.map(a => <option key={a._id} value={a._id}>{a.patient?.user?.name} — {new Date(a.appointmentDate).toLocaleDateString()}</option>)}
            </select>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label>Patient *</label>
              <select className="form-control" value={form.patientId} onChange={e => setForm({ ...form, patientId: e.target.value })}>
                <option value="">Select patient</option>
                {patients.map(p => <option key={p._id} value={p._id}>{p.user?.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Doctor *</label>
              <select className="form-control" value={form.doctorId} onChange={e => setForm({ ...form, doctorId: e.target.value })}>
                <option value="">Select doctor</option>
                {doctors.map(d => <option key={d._id} value={d._id}>{d.user?.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Valid Until</label>
              <input className="form-control" type="date" value={form.validUntil} onChange={e => setForm({ ...form, validUntil: e.target.value })} />
            </div>
          </div>

          {/* Medications list */}
          <div style={{ marginBottom: 12, fontWeight: 600, fontSize: 14 }}>Medications</div>
          {form.medications.map((med, idx) => (
            <div key={idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 12, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Medication #{idx + 1}</span>
                {form.medications.length > 1 && (
                  <button className="btn btn-danger btn-sm" onClick={() => removeMed(idx)}>Remove</button>
                )}
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Medicine Name *</label>
                  <input className="form-control" value={med.name} onChange={e => updateMed(idx, 'name', e.target.value)} placeholder="Paracetamol" />
                </div>
                <div className="form-group">
                  <label>Dosage *</label>
                  <input className="form-control" value={med.dosage} onChange={e => updateMed(idx, 'dosage', e.target.value)} placeholder="500mg" />
                </div>
                <div className="form-group">
                  <label>Frequency *</label>
                  <input className="form-control" value={med.frequency} onChange={e => updateMed(idx, 'frequency', e.target.value)} placeholder="Twice daily" />
                </div>
                <div className="form-group">
                  <label>Duration *</label>
                  <input className="form-control" value={med.duration} onChange={e => updateMed(idx, 'duration', e.target.value)} placeholder="7 days" />
                </div>
                <div className="form-group">
                  <label>Timing</label>
                  <select className="form-control" value={med.timing} onChange={e => updateMed(idx, 'timing', e.target.value)}>
                    <option>before meal</option><option>after meal</option>
                    <option>with meal</option><option>at bedtime</option><option>as needed</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
          <button className="btn btn-outline" onClick={addMedication} style={{ width: '100%', marginBottom: 12 }}>+ Add Another Medication</button>

          <div className="form-group">
            <label>Additional Notes</label>
            <textarea className="form-control" rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          </div>
        </Modal>
      )}
    </Layout>
  );
}
