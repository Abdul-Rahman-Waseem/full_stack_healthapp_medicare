// pages/patient/notifications.js
import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const typeIcon = { appointment: '📅', medication: '💊', followup: '🔁', general: '🔔' };

export default function PatientNotifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await API.get('/notifications');
      setNotifications(data);
    } catch { toast.error('Failed to load notifications'); }
  };

  const markRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await API.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('All marked as read');
    } catch {}
  };

  const deleteNotif = async (id) => {
    try {
      await API.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch {}
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <Layout>
      <div className="page-header">
        <h1>🔔 Notifications {unreadCount > 0 && <span className="notif-count">{unreadCount}</span>}</h1>
        {unreadCount > 0 && (
          <button className="btn btn-outline" onClick={markAllRead}>Mark all as read</button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 48 }}>🔕</div>
          <p>No notifications</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {notifications.map(n => (
            <div
              key={n._id}
              className="card"
              style={{
                marginBottom: 0,
                borderLeft: `4px solid ${n.isRead ? '#e2e8f0' : '#2563eb'}`,
                background: n.isRead ? '#fff' : '#eff6ff',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 16
              }}
            >
              <span style={{ fontSize: 28, marginTop: 2 }}>{typeIcon[n.type] || '🔔'}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: n.isRead ? 500 : 700, fontSize: 15, marginBottom: 4 }}>{n.title}</div>
                <div style={{ fontSize: 14, color: '#374151' }}>{n.message}</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>
                  {new Date(n.createdAt).toLocaleString()}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                {!n.isRead && (
                  <button className="btn btn-outline btn-sm" onClick={() => markRead(n._id)}>Read</button>
                )}
                <button className="btn btn-danger btn-sm" onClick={() => deleteNotif(n._id)}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
