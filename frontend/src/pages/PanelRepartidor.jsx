import React, { useState, useEffect } from 'react';
import { pedidoService } from '../services';
import Navbar from '../components/Navbar';
import EstadoBadge from '../components/EstadoBadge';
import { useToast } from '../components/Toast';
import { FiRefreshCw, FiMapPin, FiDollarSign, FiPhone } from 'react-icons/fi';

const PanelRepartidor = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(null);
  const { showToast, ToastContainer } = useToast();

  const fetchPedidos = async () => {
    try {
      setLoading(true);
      const data = await pedidoService.getAll();
      setPedidos(data);
      setError('');
    } catch (err) {
      setError('Error al cargar pedidos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPedidos();
  }, []);

  const handleUpdateEstado = async (pedidoId, nuevoEstado) => {
    try {
      setUpdating(pedidoId);
      await pedidoService.updateEstado(pedidoId, nuevoEstado);
      await fetchPedidos();
      showToast('Estado actualizado exitosamente', 'success');
    } catch (err) {
      showToast('Error al actualizar estado: ' + (err.response?.data?.error || err.message), 'error');
    } finally {
      setUpdating(null);
    }
  };

  const getNextEstado = (estadoActual) => {
    if (estadoActual === 'pendiente') return 'en_proceso';
    if (estadoActual === 'en_proceso') return 'entregado';
    return null;
  };

  const getNextEstadoLabel = (estadoActual) => {
    if (estadoActual === 'pendiente') return 'Iniciar Entrega';
    if (estadoActual === 'en_proceso') return 'Marcar como Entregado';
    return null;
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-xl">Cargando pedidos...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <ToastContainer />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Mis Pedidos</h1>
          <button
            onClick={fetchPedidos}
            className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition"
          >
            <FiRefreshCw />
            <span>Actualizar</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {pedidos.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">No tienes pedidos asignados</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pedidos.map((pedido) => (
              <div key={pedido.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">
                      Pedido #{pedido.id}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(pedido.fecha_pedido).toLocaleString('es-MX')}
                    </p>
                  </div>
                  <EstadoBadge estado={pedido.estado} />
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-start space-x-2">
                    <FiMapPin className="text-primary-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Dirección:</p>
                      <p className="text-sm text-gray-600">{pedido.direccion_entrega}</p>
                    </div>
                  </div>

                  {pedido.telefono_cliente && (
                    <div className="flex items-center space-x-2">
                      <FiPhone className="text-primary-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Teléfono:</p>
                        <p className="text-sm text-gray-600">{pedido.telefono_cliente}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <FiDollarSign className="text-primary-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Total:</p>
                      <p className="text-lg font-bold text-primary-600">
                        ${parseFloat(pedido.total).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Productos:</p>
                  <ul className="space-y-1">
                    {pedido.productos.map((producto, idx) => (
                      <li key={idx} className="text-sm text-gray-600">
                        {producto.cantidad}x {producto.nombre}
                      </li>
                    ))}
                  </ul>
                </div>

                {pedido.notas && (
                  <div className="border-t pt-4 mt-4">
                    <p className="text-sm font-medium text-gray-700">Notas:</p>
                    <p className="text-sm text-gray-600">{pedido.notas}</p>
                  </div>
                )}

                {getNextEstado(pedido.estado) && (
                  <button
                    onClick={() => handleUpdateEstado(pedido.id, getNextEstado(pedido.estado))}
                    disabled={updating === pedido.id}
                    className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg transition disabled:opacity-50"
                  >
                    {updating === pedido.id ? 'Actualizando...' : getNextEstadoLabel(pedido.estado)}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default PanelRepartidor;
