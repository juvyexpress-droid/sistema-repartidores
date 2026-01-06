import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import RepartidorDashboard from './pages/RepartidorDashboard';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        
        <Route
          path="/"
          element={
            user ? (
              user.role === 'admin' ? (
                <Navigate to="/admin" />
              ) : (
                <Navigate to="/repartidor" />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/repartidor/*"
          element={
            user && user.role === 'repartidor' ? (
              <RepartidorDashboard />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/admin/*"
          element={
            user && user.role === 'admin' ? (
              <AdminDashboard />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
