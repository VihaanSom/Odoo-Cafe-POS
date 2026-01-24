import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './store/auth.store';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import TableView from './pages/POS/TableView';
import './styles/globals.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* POS Routes */}
          <Route path="/pos" element={<TableView />} />
          <Route path="/pos/tables" element={<TableView />} />
          <Route path="/pos/order/:tableId" element={<OrderPlaceholder />} />

          {/* Dashboard redirects to POS */}
          <Route path="/dashboard" element={<Navigate to="/pos" replace />} />

          {/* Default redirect to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Catch all - redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

// Placeholder for order page
const OrderPlaceholder = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '1rem',
      background: 'var(--bg-color)'
    }}>
      <h1 style={{ fontSize: '2rem', color: 'var(--text-main)' }}>📝 Order Page</h1>
      <p style={{ color: 'var(--text-muted)' }}>This is where you'll create orders for the selected table.</p>
      <a
        href="/pos"
        style={{
          color: 'var(--primary-color)',
          textDecoration: 'underline'
        }}
      >
        ← Back to Tables
      </a>
    </div>
  );
};

export default App;
