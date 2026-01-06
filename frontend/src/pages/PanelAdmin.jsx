import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { pedidoService } from '../services';
import Navbar from '../components/Navbar';
import { FiPackage, FiUsers, FiDollarSign, FiTrendingUp, FiMenu, FiFileText } from 'react-icons/fi';

const PanelAdmin = () => {
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    fetchEstadisticas();
  }, []);

  const fetchEstadisticas = async () => {
    try {
      const data = await pedidoService.getEstadisticas();
      setEstadisticas(data);
    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { path: '/admin/pedidos', icon: FiPackage, label: 'Gestión de Pedidos', color: 'bg-blue-500' },
    { path: '/admin/menus', icon: FiMenu, label: 'Gestión de Menús', color: 'bg-green-500' },
    { path: '/admin/usuarios', icon: FiUsers, label: 'Gestión de Usuarios', color: 'bg-purple-500' },
    { path: '/admin/reportes', icon: FiFileText, label: 'Reportes', color: 'bg-orange-500' },
  ];

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Panel de Administración</h1>

        {/* Estadísticas */}
        {!loading && estadisticas && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Pedidos</p>
                  <p className="text-3xl font-bold text-gray-800">{estadisticas.total_pedidos}</p>
                </div>
                <FiPackage className="text-4xl text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Entregados</p>
                  <p className="text-3xl font-bold text-green-600">{estadisticas.pedidos_entregados}</p>
                </div>
                <FiTrendingUp className="text-4xl text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Ingresos Totales</p>
                  <p className="text-3xl font-bold text-primary-600">
                    ${parseFloat(estadisticas.ingresos_totales).toFixed(2)}
                  </p>
                </div>
                <FiDollarSign className="text-4xl text-primary-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Ticket Promedio</p>
                  <p className="text-3xl font-bold text-purple-600">
                    ${parseFloat(estadisticas.ticket_promedio).toFixed(2)}
                  </p>
                </div>
                <FiDollarSign className="text-4xl text-purple-500" />
              </div>
            </div>
          </div>
        )}

        {/* Menú de Navegación */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition transform hover:-translate-y-1"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className={`${item.color} p-4 rounded-full`}>
                  <item.icon className="text-3xl text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">{item.label}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default PanelAdmin;
