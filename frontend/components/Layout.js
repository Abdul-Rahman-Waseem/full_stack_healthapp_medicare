// components/Layout.js
import Sidebar from './Sidebar';
import { useAuth } from '../utils/AuthContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function Layout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading]);

  if (loading) return <div className="loading">Loading...</div>;
  if (!user) return null;

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
