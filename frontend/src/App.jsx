import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import PanelRepartidor from './pages/PanelRepartidor';
import PanelAdmin from './pages/PanelAdmin';
import GestionPedidos from './pages/GestionPedidos';
import GestionMenus from './pages/GestionMenus';
import GestionUsuarios from './pages/GestionUsuarios';
import Reportes from './pages/Reportes';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route
            path="/repartidor"
            element={
              <PrivateRoute requiredRole="repartidor">
                <PanelRepartidor />
              </PrivateRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <PrivateRoute requiredRole="admin">
                <PanelAdmin />
              </PrivateRoute>
            }
          />

          <Route
            path="/admin/pedidos"
            element={
              <PrivateRoute requiredRole="admin">
                <GestionPedidos />
              </PrivateRoute>
            }
          />

          <Route
            path="/admin/menus"
            element={
              <PrivateRoute requiredRole="admin">
                <GestionMenus />
              </PrivateRoute>
            }
          />

          <Route
            path="/admin/usuarios"
            element={
              <PrivateRoute requiredRole="admin">
                <GestionUsuarios />
              </PrivateRoute>
            }
          />

          <Route
            path="/admin/reportes"
            element={
              <PrivateRoute requiredRole="admin">
                <Reportes />
              </PrivateRoute>
            }
          />

          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
