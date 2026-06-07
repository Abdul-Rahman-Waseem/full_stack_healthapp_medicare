// pages/admin/doctors.js
import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import Modal from '../../components/Modal';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const emptyForm = {
  name: '', email: '', password: '', phone: '',
  specialization: '', qualification: '', experience: '',
  fee: '', hospital: '', bio: '',
  availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
};

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchDoctors(); }, []);

  const fetchDoctors = async () => {
    try {
      const { data } = await API.get('/doctors');
      setDoctors(data);
    } catch { toast.error('Failed to load doctors'); }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const openAdd = () => { setForm(emptyForm); setEditId(null); setShowModal(true); };

  const openEdit = (doc) => {
    setForm({
      name: doc.user?.name || '',
      email: doc.user?.email || '',
      password: '',
      phone: doc.user?.phone || '',
      specialization: doc.specialization || '',
      qualification: doc.qualification || '',
      experience: doc.experience || '',
      fee: doc.fee || '',
      hospital: doc.hospital || '',
      bio: doc.bio || '',
      availableDays: doc.availableDays || [],
    });
    setEditId(doc._id);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (editId) {
        await API.put(`/doctors/${editId}`, form);
        toast.success('Doctor updated!');
      } else {
        await API.post('/doctors', form);
        toast.success('Doctor added!');
      }
      setShowModal(false);
      fetchDoctors();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving doctor');
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this doctor?')) return;
    try {
      await API.delete(`/doctors/${id}`);
      toast.success('Doctor deleted');
      fetchDoctors();
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <Layout>
      <div className="page-header">
        <h1>👨‍⚕️ Doctors</h1>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Doctor</button>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th><th>Email</th><th>Specialization</th>
                <th>Experience</th><th>Fee (PKR)</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((doc) => (
                <tr key={doc._id}>
                  <td><strong>{doc.user?.name}</strong></td>
                  <td>{doc.user?.email}</td>
                  <td>{doc.specialization}</td>
                  <td>{doc.experience} yrs</td>
                  <td>{doc.fee?.toLocaleString()}</td>
                  <td>
                    <button className="btn btn-outline btn-sm" onClick={() => openEdit(doc)}>Edit</button>{' '}
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(doc._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {doctors.length === 0 && <div className="empty-state"><p>No doctors found</p></div>}
        </div>
      </div>

      {showModal && (
        <Modal
          title={editId ? 'Edit Doctor' : 'Add New Doctor'}
          onClose={() => setShowModal(false)}
          footer={
            <>
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Saving...' : 'Save Doctor'}
              </button>
            </>
          }
        >
          <div className="form-grid">
            <div className="form-group">
              <label>Full Name *</label>
              <input className="form-control" name="name" value={form.name} onChange={handleChange} placeholder="Dr. John Doe" />
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
              <label>Specialization *</label>
              <input className="form-control" name="specialization" value={form.specialization} onChange={handleChange} placeholder="Cardiology" />
            </div>
            <div className="form-group">
              <label>Qualification *</label>
              <input className="form-control" name="qualification" value={form.qualification} onChange={handleChange} placeholder="MBBS, MD" />
            </div>
            <div className="form-group">
              <label>Experience (years) *</label>
              <input className="form-control" name="experience" type="number" value={form.experience} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Consultation Fee (PKR) *</label>
              <input className="form-control" name="fee" type="number" value={form.fee} onChange={handleChange} />
            </div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label>Hospital / Clinic</label>
              <input className="form-control" name="hospital" value={form.hospital} onChange={handleChange} />
            </div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label>Bio</label>
              <textarea className="form-control" name="bio" value={form.bio} onChange={handleChange} rows={3} />
            </div>
          </div>
        </Modal>
      )}
    </Layout>
  );
}
