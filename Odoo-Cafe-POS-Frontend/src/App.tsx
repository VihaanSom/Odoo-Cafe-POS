import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './store/auth.store';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import './styles/globals.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          {/* Default redirect to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          {/* Placeholder for dashboard - can be added later */}
          <Route path="/dashboard" element={<DashboardPlaceholder />} />
          {/* Catch all - redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

// Placeholder dashboard component
const DashboardPlaceholder = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      <h1 style={{ fontSize: '2rem', color: 'var(--text-main)' }}>🎉 Welcome to Dashboard!</h1>
      <p style={{ color: 'var(--text-muted)' }}>You are successfully logged in.</p>
      <a
        href="/login"
        onClick={() => {
          localStorage.removeItem('pos_auth_token');
          localStorage.removeItem('pos_auth_user');
        }}
        style={{
          color: 'var(--primary-color)',
          textDecoration: 'underline'
        }}
      >
        Logout
      </a>
    </div>
  );
};

export default App;
