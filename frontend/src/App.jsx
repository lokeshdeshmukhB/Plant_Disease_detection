import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Auth Pages
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';

// Farmer Pages
import FarmerDashboard from './pages/Farmer/FarmerDashboard';
import DiseaseDetection from './pages/Farmer/DiseaseDetection';
import ManageFarms from './pages/Farmer/ManageFarms';

// Admin Pages
import AdminDashboard from './pages/Admin/AdminDashboard';
import FarmersList from './pages/Admin/FarmersList';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '100vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
      <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/" replace />} />

      {/* Farmer Routes */}
      <Route
        path="/farmer/dashboard"
        element={
          <ProtectedRoute allowedRoles={['farmer']}>
            <FarmerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/farmer/detect"
        element={
          <ProtectedRoute allowedRoles={['farmer']}>
            <DiseaseDetection />
          </ProtectedRoute>
        }
      />
      <Route
        path="/farmer/farms"
        element={
          <ProtectedRoute allowedRoles={['farmer']}>
            <ManageFarms />
          </ProtectedRoute>
        }
      />
      <Route
        path="/farmer/history"
        element={
          <ProtectedRoute allowedRoles={['farmer']}>
            <FarmerDashboard />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/stats"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/farmers"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <FarmersList />
          </ProtectedRoute>
        }
      />

      {/* Default Route */}
      <Route
        path="/"
        element={
          user ? (
            user.role === 'admin' ? (
              <Navigate to="/admin/stats" replace />
            ) : (
              <Navigate to="/farmer/dashboard" replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* 404 Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </AuthProvider>
    </Router>
  );
}

export default App;
