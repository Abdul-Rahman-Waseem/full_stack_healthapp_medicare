// pages/admin/patients.js
import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import Modal from '../../components/Modal';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const emptyForm = {
  name: '', email: '', password: '', phone: '',
  dateOfBirth: '', gender: 'Male', bloodGroup: 'O+', address: '',
  assignedDoctor: '',
};

export default function AdminPatients() {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchPatients(); fetchDoctors(); }, []);

  const fetchPatients = async () => {
    try {
      const { data } = await API.get('/patients');
      setPatients(data);
    } catch { toast.error('Failed to load patients'); }
  };

  const fetchDoctors = async () => {
    try {
      const { data } = await API.get('/doctors');
      setDoctors(data);
    } catch {}
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const openAdd = () => { setForm(emptyForm); setEditId(null); setShowModal(true); };

  const openEdit = (p) => {
    setForm({
      name: p.user?.name || '',
      email: p.user?.email || '',
      password: '',
      phone: p.user?.phone || '',
      dateOfBirth: p.dateOfBirth ? p.dateOfBirth.split('T')[0] : '',
      gender: p.gender || 'Male',
      bloodGroup: p.bloodGroup || 'O+',
      address: p.address || '',
      assignedDoctor: p.assignedDoctor?._id || '',
    });
    setEditId(p._id);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (editId) {
        await API.put(`/patients/${editId}`, form);
        toast.success('Patient updated!');
      } else {
        await API.post('/patients', form);
        toast.success('Patient added!');
      }
      setShowModal(false);
      fetchPatients();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving patient');
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this patient?')) return;
    try {
      await API.delete(`/patients/${id}`);
      toast.success('Patient deleted');
      fetchPatients();
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <Layout>
      <div className="page-header">
        <h1>🧑‍🤝‍🧑 Patients</h1>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Patient</button>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th><th>Email</th><th>Gender</th>
                <th>Blood Group</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p._id}>
                  <td><strong>{p.user?.name}</strong></td>
                  <td>{p.user?.email}</td>
                  <td>{p.gender}</td>
                  <td>{p.bloodGroup}</td>
                  <td>
                    <button className="btn btn-outline btn-sm" onClick={() => openEdit(p)}>Edit</button>{' '}
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {patients.length === 0 && <div className="empty-state"><p>No patients found</p></div>}
        </div>
      </div>

      {showModal && (
        <Modal
          title={editId ? 'Edit Patient' : 'Add New Patient'}
          onClose={() => setShowModal(false)}
          footer={
            <>
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Saving...' : 'Save Patient'}
              </button>
            </>
          }
        >
          <div className="form-grid">
            <div className="form-group">
              <label>Full Name *</label>
              <input className="form-control" name="name" value={form.name} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input className="form-control" name="email" type="email" value={form.email} onChange={handleChange} />
            </div>
            {!editId && (
              <div className="form-group">
                <label>Password *</label>
                <input className="form-control" name="password" type="password" value={form.password} onChange={handleChange} />
              </div>
            )}
            <div className="form-group">
              <label>Phone</label>
              <input className="form-control" name="phone" value={form.phone} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Date of Birth</label>
              <input className="form-control" name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Gender</label>
              <select className="form-control" name="gender" value={form.gender} onChange={handleChange}>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Blood Group</label>
              <select className="form-control" name="bloodGroup" value={form.bloodGroup} onChange={handleChange}>
                {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Assign Doctor</label>
              <select className="form-control" name="assignedDoctor" value={form.assignedDoctor} onChange={handleChange}>
                <option value="">— None —</option>
                {doctors.map(d => <option key={d._id} value={d._id}>{d.user?.name} ({d.specialization})</option>)}
              </select>
            </div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label>Address</label>
              <input className="form-control" name="address" value={form.address} onChange={handleChange} />
            </div>
          </div>
        </Modal>
      )}
    </Layout>
  );
}
