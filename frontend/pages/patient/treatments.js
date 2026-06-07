// pages/patient/treatments.js
import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import StatusBadge from '../../components/StatusBadge';
import API from '../../utils/api';
import toast from 'react-hot-toast';

export default function PatientTreatments() {
  const [treatments, setTreatments] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    API.get('/treatments')
      .then(r => setTreatments(r.data))
      .catch(() => toast.error('Failed to load'));
  }, []);

  return (
    <Layout>
      <div className="page-header"><h1>🩺 My Treatments</h1></div>

      {selected ? (
        // Treatment detail view
        <div>
          <button className="btn btn-outline" style={{ marginBottom: 16 }} onClick={() => setSelected(null)}>← Back</button>
          <div className="card">
            <div className="card-title">Treatment Details</div>
            <table style={{ width: 'auto', marginBottom: 16 }}>
              <tbody>
                <tr><td style={{ padding: '6px 16px 6px 0', fontWeight: 600, color: '#64748b' }}>Doctor</td><td>{selected.doctor?.user?.name}</td></tr>
                <tr><td style={{ padding: '6px 16px 6px 0', fontWeight: 600, color: '#64748b' }}>Diagnosis</td><td>{selected.diagnosis}</td></tr>
                <tr><td style={{ padding: '6px 16px 6px 0', fontWeight: 600, color: '#64748b' }}>Treatment Plan</td><td>{selected.treatmentPlan || '—'}</td></tr>
                <tr><td style={{ padding: '6px 16px 6px 0', fontWeight: 600, color: '#64748b' }}>Status</td><td><StatusBadge status={selected.status} /></td></tr>
                <tr><td style={{ padding: '6px 16px 6px 0', fontWeight: 600, color: '#64748b' }}>Started</td><td>{new Date(selected.startDate).toLocaleDateString()}</td></tr>
              </tbody>
            </table>

            {/* Checkup Records */}
            <div style={{ marginTop: 20 }}>
              <div className="card-title">Physical Checkup Records ({selected.checkups?.length || 0})</div>
              {selected.checkups?.length > 0 ? (
                <table>
                  <thead><tr><th>Date</th><th>BP</th><th>Heart Rate</th><th>Temp</th><th>Weight</th><th>Notes</th></tr></thead>
                  <tbody>
                    {selected.checkups.map((c, i) => (
                      <tr key={i}>
                        <td>{new Date(c.date).toLocaleDateString()}</td>
                        <td>{c.bloodPressure || '—'}</td>
                        <td>{c.heartRate || '—'}</td>
                        <td>{c.temperature || '—'}</td>
                        <td>{c.weight || '—'}</td>
                        <td>{c.notes || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : <p style={{ color: '#64748b', fontSize: 14 }}>No checkup records yet</p>}
            </div>

            {/* Follow-ups */}
            <div style={{ marginTop: 20 }}>
              <div className="card-title">Follow-up Visits ({selected.followUps?.length || 0})</div>
              {selected.followUps?.length > 0 ? (
                <table>
                  <thead><tr><th>Scheduled Date</th><th>Status</th><th>Notes</th></tr></thead>
                  <tbody>
                    {selected.followUps.map((f, i) => (
                      <tr key={i}>
                        <td>{new Date(f.scheduledDate).toLocaleDateString()}</td>
                        <td><span className={`badge badge-${f.status}`}>{f.status}</span></td>
                        <td>{f.notes || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : <p style={{ color: '#64748b', fontSize: 14 }}>No follow-ups scheduled</p>}
            </div>
          </div>
        </div>
      ) : (
        // Treatment list
        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr><th>Doctor</th><th>Diagnosis</th><th>Status</th><th>Start Date</th><th>Checkups</th><th>Details</th></tr>
              </thead>
              <tbody>
                {treatments.map(t => (
                  <tr key={t._id}>
                    <td>{t.doctor?.user?.name}</td>
                    <td>{t.diagnosis}</td>
                    <td><StatusBadge status={t.status} /></td>
                    <td>{new Date(t.startDate).toLocaleDateString()}</td>
                    <td>{t.checkups?.length || 0}</td>
                    <td>
                      <button className="btn btn-outline btn-sm" onClick={() => setSelected(t)}>View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {treatments.length === 0 && <div className="empty-state"><p>No treatments yet</p></div>}
          </div>
        </div>
      )}
    </Layout>
  );
}
