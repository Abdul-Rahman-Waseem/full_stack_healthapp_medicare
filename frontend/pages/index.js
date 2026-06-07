// pages/index.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../utils/AuthContext';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else {
        router.push(`/${user.role}/dashboard`);
      }
    }
  }, [user, loading]);

  return <div className="loading">Redirecting...</div>;
}
