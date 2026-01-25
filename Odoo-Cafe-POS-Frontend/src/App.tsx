import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './store/auth.store';
import { SessionProvider } from './store/session.store';
import { SocketProvider } from './context/SocketContext';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import Dashboard from './pages/Dashboard/Dashboard';
import TableView from './pages/POS/TableView';
import OrderView from './pages/POS/OrderView';
import TerminalSettings from './pages/POS/TerminalSettings';
import KitchenDisplay from './pages/Kitchen/KitchenDisplay';
import CustomerDisplay from './pages/CustomerDisplay/CustomerDisplay';
// Admin Pages
import Products from './pages/Inventory/Products';
import ProductList from './pages/Inventory/ProductList';
import ProductForm from './pages/Inventory/ProductForm';
import Categories from './pages/Inventory/Categories';
import Orders from './pages/Sales/Orders';
import Customers from './pages/Sales/Customers';
import Payments from './pages/Sales/Payments';
import FloorEditor from './pages/Floors/FloorEditor';
import Settings from './pages/Settings/Settings';
import AnalyticsDashboard from './pages/Analytics/AnalyticsDashboard';

import './styles/globals.css';


function App() {
  return (
    <AuthProvider>
      <SessionProvider>
        <SocketProvider>
          <BrowserRouter>
            <Routes>
              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Dashboard */}
              <Route path="/dashboard" element={<Dashboard />} />

              {/* Admin/Settings Routes */}
              <Route path="/dashboard/products" element={<ProductList />} />
              <Route path="/dashboard/products/new" element={<ProductForm />} />
              <Route path="/dashboard/products/:productId" element={<ProductForm />} />
              <Route path="/dashboard/products-old" element={<Products />} />
              <Route path="/dashboard/categories" element={<Categories />} />
              <Route path="/dashboard/orders" element={<Orders />} />
              <Route path="/dashboard/customers" element={<Customers />} />
              <Route path="/dashboard/payments" element={<Payments />} />
              <Route path="/dashboard/floors" element={<FloorEditor />} />
              <Route path="/dashboard/analytics" element={<AnalyticsDashboard />} />
              <Route path="/dashboard/settings" element={<Settings />} />

              {/* POS Routes */}
              <Route path="/pos" element={<TableView />} />
              <Route path="/pos/tables" element={<TableView />} />
              <Route path="/pos/order/:tableId" element={<OrderView />} />
              <Route path="/pos/settings" element={<TerminalSettings />} />

              {/* Kitchen Display */}
              <Route path="/kitchen" element={<KitchenDisplay />} />

              {/* Customer Display */}
              <Route path="/customer-display/:terminalId" element={<CustomerDisplay />} />

              {/* Default redirect to login */}
              <Route path="/" element={<Navigate to="/login" replace />} />

              {/* Catch all - redirect to login */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </SocketProvider>
      </SessionProvider>
    </AuthProvider>
  );
}

export default App;

