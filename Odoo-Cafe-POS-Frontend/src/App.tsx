import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './store/auth.store';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import TableView from './pages/POS/TableView';
import OrderView from './pages/POS/OrderView';
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
          <Route path="/pos/order/:tableId" element={<OrderView />} />

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

export default App;
