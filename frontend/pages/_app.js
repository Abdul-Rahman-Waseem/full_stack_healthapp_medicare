// pages/_app.js
import { AuthProvider } from '../utils/AuthContext';
import { Toaster } from 'react-hot-toast';
import '../styles/globals.css';

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      {/* Toast notifications appear here */}
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Component {...pageProps} />
    </AuthProvider>
  );
}
