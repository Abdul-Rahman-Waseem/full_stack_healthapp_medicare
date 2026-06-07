// pages/patient/prescriptions.js
import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import API from '../../utils/api';
import toast from 'react-hot-toast';

export default function PatientPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    API.get('/prescriptions')
      .then(r => setPrescriptions(r.data))
      .catch(() => toast.error('Failed to load'));
  }, []);

  return (
    <Layout>
      <div className="page-header"><h1>💊 My Prescriptions</h1></div>

      {selected ? (
        <div>
          <button className="btn btn-outline" style={{ marginBottom: 16 }} onClick={() => setSelected(null)}>← Back</button>
          <div className="card">
            <div className="card-title">Prescription Details</div>
            <table style={{ width: 'auto', marginBottom: 20 }}>
              <tbody>
                <tr><td style={{ padding: '6px 16px 6px 0', fontWeight: 600, color: '#64748b' }}>Doctor</td><td>{selected.doctor?.user?.name}</td></tr>
                <tr><td style={{ padding: '6px 16px 6px 0', fontWeight: 600, color: '#64748b' }}>Date</td><td>{new Date(selected.createdAt).toLocaleDateString()}</td></tr>
                <tr><td style={{ padding: '6px 16px 6px 0', fontWeight: 600, color: '#64748b' }}>Valid Until</td><td>{selected.validUntil ? new Date(selected.validUntil).toLocaleDateString() : 'Not specified'}</td></tr>
                {selected.notes && <tr><td style={{ padding: '6px 16px 6px 0', fontWeight: 600, color: '#64748b' }}>Notes</td><td>{selected.notes}</td></tr>}
              </tbody>
            </table>

            <div className="card-title">Medications</div>
            <div style={{ display: 'grid', gap: 12 }}>
              {selected.medications?.map((med, i) => (
                <div key={i} style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <strong style={{ fontSize: 16 }}>💊 {med.name}</strong>
                    <span style={{ background: '#22c55e', color: 'white', padding: '2px 10px', borderRadius: 20, fontSize: 12 }}>{med.dosage}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 8, fontSize: 13, color: '#374151' }}>
                    <span>📅 <strong>Frequency:</strong> {med.frequency}</span>
                    <span>⏱ <strong>Duration:</strong> {med.duration}</span>
                    <span>🍽 <strong>Timing:</strong> {med.timing}</span>
                  </div>
                  {med.instructions && <p style={{ fontSize: 13, color: '#6b7280', marginTop: 8 }}>📝 {med.instructions}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr><th>Doctor</th><th>Medications</th><th>Date</th><th>Valid Until</th><th>Action</th></tr>
              </thead>
              <tbody>
                {prescriptions.map(p => (
                  <tr key={p._id}>
                    <td>{p.doctor?.user?.name}</td>
                    <td>{p.medications?.length} medication(s)</td>
                    <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td>{p.validUntil ? new Date(p.validUntil).toLocaleDateString() : '—'}</td>
                    <td><button className="btn btn-outline btn-sm" onClick={() => setSelected(p)}>View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {prescriptions.length === 0 && <div className="empty-state"><p>No prescriptions yet</p></div>}
          </div>
        </div>
      )}
    </Layout>
  );
}
