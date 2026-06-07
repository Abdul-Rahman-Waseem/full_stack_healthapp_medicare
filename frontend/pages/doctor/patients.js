// pages/doctor/patients.js
import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import API from '../../utils/api';
import toast from 'react-hot-toast';

export default function DoctorPatients() {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    API.get('/patients')
      .then(r => setPatients(r.data))
      .catch(() => toast.error('Failed to load patients'));
  }, []);

  return (
    <Layout>
      <div className="page-header"><h1>🧑‍🤝‍🧑 Patients</h1></div>
      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr><th>Name</th><th>Email</th><th>Gender</th><th>Blood Group</th><th>Address</th></tr>
            </thead>
            <tbody>
              {patients.map(p => (
                <tr key={p._id}>
                  <td><strong>{p.user?.name}</strong></td>
                  <td>{p.user?.email}</td>
                  <td>{p.gender}</td>
                  <td>{p.bloodGroup}</td>
                  <td>{p.address}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {patients.length === 0 && <div className="empty-state"><p>No patients found</p></div>}
        </div>
      </div>
    </Layout>
  );
}
