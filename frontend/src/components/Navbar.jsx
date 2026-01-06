import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiLogOut, FiUser } from 'react-icons/fi';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-primary-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">Sistema de Repartidores</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <FiUser />
              <span>{user?.nombre}</span>
              <span className="text-xs bg-primary-700 px-2 py-1 rounded">
                {user?.rol}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-primary-700 hover:bg-primary-800 px-4 py-2 rounded transition"
            >
              <FiLogOut />
              <span>Salir</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
