// components/Sidebar.js
import { useRouter } from 'next/router';
import { useAuth } from '../utils/AuthContext';

// Navigation links for each role
const navLinks = {
  admin: [
    { href: '/admin/dashboard',    label: 'Dashboard',     icon: '📊' },
    { href: '/admin/doctors',      label: 'Doctors',       icon: '👨‍⚕️' },
    { href: '/admin/patients',     label: 'Patients',      icon: '🧑‍🤝‍🧑' },
    { href: '/admin/appointments', label: 'Appointments',  icon: '📅' },
    { href: '/admin/treatments',   label: 'Treatments',    icon: '🩺' },
    { href: '/admin/prescriptions',label: 'Prescriptions', icon: '💊' },
  ],
  doctor: [
    { href: '/doctor/dashboard',    label: 'Dashboard',     icon: '📊' },
    { href: '/doctor/appointments', label: 'Appointments',  icon: '📅' },
    { href: '/doctor/treatments',   label: 'Treatments',    icon: '🩺' },
    { href: '/doctor/prescriptions',label: 'Prescriptions', icon: '💊' },
    { href: '/doctor/patients',     label: 'Patients',      icon: '🧑‍🤝‍🧑' },
  ],
  patient: [
    { href: '/patient/dashboard',    label: 'Dashboard',     icon: '📊' },
    { href: '/patient/appointments', label: 'My Appointments',icon: '📅' },
    { href: '/patient/treatments',   label: 'My Treatments', icon: '🩺' },
    { href: '/patient/prescriptions',label: 'My Prescriptions',icon: '💊' },
    { href: '/patient/notifications',label: 'Notifications', icon: '🔔' },
  ],
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) return null;

  const links = navLinks[user.role] || [];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        🏥 MediCare
        <span>{user.role.toUpperCase()} PORTAL</span>
      </div>

      <nav className="sidebar-nav">
        {links.map((link) => (
          <div
            key={link.href}
            className={`nav-item ${router.pathname === link.href ? 'active' : ''}`}
            onClick={() => router.push(link.href)}
          >
            <span>{link.icon}</span>
            {link.label}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 10 }}>
          👤 {user.name}
        </div>
        <button className="logout-btn" onClick={logout}>
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}
