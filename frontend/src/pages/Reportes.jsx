import React, { useState, useEffect } from 'react';
import { pedidoService } from '../services';
import Navbar from '../components/Navbar';
import { FiTrendingUp, FiDollarSign, FiPackage, FiCheckCircle } from 'react-icons/fi';

const Reportes = () => {
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-xl">Cargando reportes...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Reportes y Estadísticas</h1>

        {estadisticas && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <FiPackage className="text-2xl text-blue-600" />
                  </div>
                  <span className="text-sm text-gray-500">Total</span>
                </div>
                <p className="text-3xl font-bold text-gray-800">{estadisticas.total_pedidos}</p>
                <p className="text-sm text-gray-600 mt-1">Pedidos Totales</p>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-green-100 p-3 rounded-full">
                    <FiCheckCircle className="text-2xl text-green-600" />
                  </div>
                  <span className="text-sm text-gray-500">Completados</span>
                </div>
                <p className="text-3xl font-bold text-green-600">{estadisticas.pedidos_entregados}</p>
                <p className="text-sm text-gray-600 mt-1">Pedidos Entregados</p>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-yellow-100 p-3 rounded-full">
                    <FiTrendingUp className="text-2xl text-yellow-600" />
                  </div>
                  <span className="text-sm text-gray-500">Pendientes</span>
                </div>
                <p className="text-3xl font-bold text-yellow-600">
                  {parseInt(estadisticas.pedidos_pendientes) + parseInt(estadisticas.pedidos_en_proceso)}
                </p>
                <p className="text-sm text-gray-600 mt-1">En Proceso/Pendientes</p>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-purple-100 p-3 rounded-full">
                    <FiDollarSign className="text-2xl text-purple-600" />
                  </div>
                  <span className="text-sm text-gray-500">Ingresos</span>
                </div>
                <p className="text-3xl font-bold text-purple-600">
                  ${parseFloat(estadisticas.ingresos_totales).toFixed(2)}
                </p>
                <p className="text-sm text-gray-600 mt-1">Ingresos Totales</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Resumen de Estados</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Pendientes</span>
                    <span className="font-bold text-yellow-600">{estadisticas.pedidos_pendientes}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">En Proceso</span>
                    <span className="font-bold text-blue-600">{estadisticas.pedidos_en_proceso}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Entregados</span>
                    <span className="font-bold text-green-600">{estadisticas.pedidos_entregados}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Métricas de Ventas</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Ticket Promedio</span>
                    <span className="font-bold text-primary-600">
                      ${parseFloat(estadisticas.ticket_promedio).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Tasa de Entrega</span>
                    <span className="font-bold text-green-600">
                      {estadisticas.total_pedidos > 0
                        ? ((estadisticas.pedidos_entregados / estadisticas.total_pedidos) * 100).toFixed(1)
                        : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Ingresos Totales</span>
                    <span className="font-bold text-purple-600">
                      ${parseFloat(estadisticas.ingresos_totales).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Reportes;
