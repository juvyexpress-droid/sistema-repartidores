import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { repartidorService, orderService, notificationService } from '../services/api';

function RepartidorDashboard() {
  const { user, logout, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [orderHistory, setOrderHistory] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [fines, setFines] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('daily');

  useEffect(() => {
    loadOrders();
    loadNotifications();
  }, []);

  useEffect(() => {
    if (activeTab === 'history') {
      loadOrderHistory();
    } else if (activeTab === 'earnings') {
      loadEarnings();
    } else if (activeTab === 'fines') {
      loadFines();
    }
  }, [activeTab, selectedPeriod]);

  const loadOrders = async () => {
    try {
      const response = await orderService.getOrders({ status: 'assigned' });
      setOrders(response.data.orders);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const loadOrderHistory = async () => {
    try {
      const response = await orderService.getOrderHistory();
      setOrderHistory(response.data.orders);
    } catch (error) {
      console.error('Error loading order history:', error);
    }
  };

  const loadEarnings = async () => {
    try {
      const response = await repartidorService.getEarnings(selectedPeriod);
      setEarnings(response.data);
    } catch (error) {
      console.error('Error loading earnings:', error);
    }
  };

  const loadFines = async () => {
    try {
      const response = await repartidorService.getFines();
      setFines(response.data);
    } catch (error) {
      console.error('Error loading fines:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      const response = await notificationService.getNotifications();
      setNotifications(response.data.notifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const toggleAvailability = async () => {
    setLoading(true);
    try {
      const response = await repartidorService.toggleAvailability(!user.isAvailable);
      updateUser({ ...user, isAvailable: response.data.isAvailable });
      alert(response.data.message);
    } catch (error) {
      alert(error.response?.data?.error || 'Error al cambiar disponibilidad');
    } finally {
      setLoading(false);
    }
  };

  const acceptOrder = async (orderId) => {
    try {
      await orderService.acceptOrder(orderId);
      alert('Pedido aceptado exitosamente');
      loadOrders();
    } catch (error) {
      alert(error.response?.data?.error || 'Error al aceptar pedido');
    }
  };

  const rejectOrder = async (orderId) => {
    const reason = prompt('Por favor, ingresa el motivo del rechazo (mínimo 10 caracteres):');
    if (!reason || reason.length < 10) {
      alert('El motivo debe tener al menos 10 caracteres');
      return;
    }

    try {
      await orderService.rejectOrder(orderId, reason);
      alert('Pedido rechazado. El administrador será notificado.');
      loadOrders();
    } catch (error) {
      alert(error.response?.data?.error || 'Error al rechazar pedido');
    }
  };

  const markInTransit = async (orderId) => {
    try {
      await orderService.markInTransit(orderId);
      alert('Pedido marcado como en tránsito');
      loadOrders();
    } catch (error) {
      alert(error.response?.data?.error || 'Error al actualizar estado');
    }
  };

  const deliverOrder = async (orderId) => {
    try {
      await orderService.deliverOrder(orderId);
      alert('Pedido entregado exitosamente');
      loadOrders();
      loadEarnings();
    } catch (error) {
      alert(error.response?.data?.error || 'Error al entregar pedido');
    }
  };

  const isWithinSchedule = () => {
    if (!user.schedule || !user.schedule.startTime || !user.schedule.endTime) {
      return false;
    }
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const currentDay = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'][now.getDay()];
    
    return user.schedule.days?.includes(currentDay) &&
           currentTime >= user.schedule.startTime &&
           currentTime <= user.schedule.endTime;
  };

  const unreadNotifications = notifications.filter(n => !n.isRead).length;

  return (
    <div>
      {/* Fixed Header */}
      <div className="header">
        <div className="header-content">
          <div>
            <h1>Juvy Repartidor - {user.name}</h1>
            <div style={{ fontSize: '14px', opacity: 0.9, marginTop: '4px' }}>
              {user.schedule ? (
                <>
                  Horario: {user.schedule.startTime} - {user.schedule.endTime}
                  {' '}({user.schedule.days?.join(', ')})
                </>
              ) : (
                'Sin horario asignado'
              )}
            </div>
          </div>
          
          <div className="header-actions">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>Disponible:</span>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={user.isAvailable}
                  onChange={toggleAvailability}
                  disabled={loading || !isWithinSchedule()}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            
            {unreadNotifications > 0 && (
              <div className="notification-badge" data-count={unreadNotifications}>
                🔔
              </div>
            )}
            
            <button onClick={logout} className="btn btn-secondary">
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Stats */}
        <div className="grid grid-4" style={{ marginTop: '20px' }}>
          <div className="stat-card">
            <div className="stat-label">Porcentaje de Ganancia</div>
            <div className="stat-value">{user.percentage}%</div>
          </div>
          <div className="stat-card" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
            <div className="stat-label">Entregas Totales</div>
            <div className="stat-value">{user.totalDeliveries || 0}</div>
          </div>
          <div className="stat-card" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
            <div className="stat-label">Ganancias Totales</div>
            <div className="stat-value">${user.totalEarnings?.toFixed(2) || '0.00'}</div>
          </div>
          <div className="stat-card" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>
            <div className="stat-label">Multas Acumuladas</div>
            <div className="stat-value">${user.totalFines?.toFixed(2) || '0.00'}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs" style={{ marginTop: '30px' }}>
          <button
            className={`tab ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            Pedidos Activos
          </button>
          <button
            className={`tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            Historial
          </button>
          <button
            className={`tab ${activeTab === 'earnings' ? 'active' : ''}`}
            onClick={() => setActiveTab('earnings')}
          >
            Ganancias
          </button>
          <button
            className={`tab ${activeTab === 'fines' ? 'active' : ''}`}
            onClick={() => setActiveTab('fines')}
          >
            Auditoría / Multas
          </button>
          <button
            className={`tab ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            Notificaciones {unreadNotifications > 0 && `(${unreadNotifications})`}
          </button>
        </div>

        {/* Content */}
        <div style={{ marginTop: '20px' }}>
          {activeTab === 'orders' && (
            <div className="card">
              <h3 className="card-header">Pedidos Asignados</h3>
              {orders.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#6b7280', padding: '40px' }}>
                  No tienes pedidos asignados en este momento
                </p>
              ) : (
                <div className="grid grid-2">
                  {orders.map(order => (
                    <div key={order._id} className="card" style={{ background: '#f9fafb' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <strong>{order.orderNumber}</strong>
                        <span className={`badge badge-${order.status === 'assigned' ? 'warning' : 'info'}`}>
                          {order.status}
                        </span>
                      </div>
                      
                      <div style={{ marginBottom: '12px' }}>
                        <div><strong>Cliente:</strong> {order.customer.name}</div>
                        <div><strong>Dirección:</strong> {order.customer.address}</div>
                        <div><strong>Teléfono:</strong> {order.customer.phone}</div>
                      </div>

                      <div style={{ marginBottom: '12px' }}>
                        <div><strong>Total:</strong> ${order.total.toFixed(2)}</div>
                        <div><strong>Tarifa de Envío:</strong> ${order.deliveryFee.toFixed(2)}</div>
                        <div style={{ color: '#10b981', fontWeight: '600' }}>
                          <strong>Tu Ganancia:</strong> ${order.repartidorEarning?.toFixed(2)}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                        {order.status === 'assigned' && (
                          <>
                            <button 
                              onClick={() => acceptOrder(order._id)}
                              className="btn btn-success"
                              style={{ flex: 1 }}
                            >
                              Aceptar
                            </button>
                            <button 
                              onClick={() => rejectOrder(order._id)}
                              className="btn btn-danger"
                              style={{ flex: 1 }}
                            >
                              Rechazar
                            </button>
                          </>
                        )}
                        {order.status === 'accepted' && (
                          <>
                            <button 
                              onClick={() => markInTransit(order._id)}
                              className="btn btn-primary"
                              style={{ flex: 1 }}
                            >
                              En Tránsito
                            </button>
                            <button 
                              onClick={() => deliverOrder(order._id)}
                              className="btn btn-success"
                              style={{ flex: 1 }}
                            >
                              Entregar
                            </button>
                          </>
                        )}
                        {order.status === 'in_transit' && (
                          <button 
                            onClick={() => deliverOrder(order._id)}
                            className="btn btn-success"
                            style={{ width: '100%' }}
                          >
                            Marcar como Entregado
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="card">
              <h3 className="card-header">Historial de Pedidos</h3>
              {!orderHistory || orderHistory.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#6b7280', padding: '40px' }}>
                  No hay historial de pedidos
                </p>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Número</th>
                      <th>Cliente</th>
                      <th>Total</th>
                      <th>Ganancia</th>
                      <th>Estado</th>
                      <th>Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderHistory.map(order => (
                      <tr key={order._id}>
                        <td>{order.orderNumber}</td>
                        <td>{order.customer.name}</td>
                        <td>${order.total.toFixed(2)}</td>
                        <td>${order.repartidorEarning?.toFixed(2) || '0.00'}</td>
                        <td>
                          <span className={`badge badge-${order.status === 'delivered' ? 'success' : 'danger'}`}>
                            {order.status === 'delivered' ? 'Entregado' : 'Rechazado'}
                          </span>
                        </td>
                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'earnings' && (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 className="card-header" style={{ marginBottom: 0 }}>Ganancias</h3>
                <select
                  className="form-select"
                  style={{ width: 'auto' }}
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                >
                  <option value="daily">Diario</option>
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensual</option>
                  <option value="">Histórico</option>
                </select>
              </div>

              {earnings && (
                <div className="grid grid-3">
                  <div className="card" style={{ background: '#f0fdf4' }}>
                    <div style={{ fontSize: '14px', color: '#15803d', marginBottom: '8px' }}>
                      Total Ganado
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: '#15803d' }}>
                      ${earnings.totalEarnings.toFixed(2)}
                    </div>
                  </div>
                  
                  <div className="card" style={{ background: '#eff6ff' }}>
                    <div style={{ fontSize: '14px', color: '#1e40af', marginBottom: '8px' }}>
                      Total Pedidos
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: '#1e40af' }}>
                      {earnings.totalOrders}
                    </div>
                  </div>
                  
                  <div className="card" style={{ background: '#fef3c7' }}>
                    <div style={{ fontSize: '14px', color: '#92400e', marginBottom: '8px' }}>
                      Ganancia Promedio
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: '#92400e' }}>
                      ${earnings.averageEarning.toFixed(2)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'fines' && (
            <div className="card">
              <h3 className="card-header">Auditoría Personal - Multas</h3>
              
              {fines && (
                <div className="grid grid-3" style={{ marginBottom: '24px' }}>
                  <div className="card" style={{ background: '#fee2e2' }}>
                    <div style={{ fontSize: '14px', color: '#991b1b', marginBottom: '8px' }}>
                      Total Multas
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: '#991b1b' }}>
                      ${fines.totalFines.toFixed(2)}
                    </div>
                  </div>
                  
                  <div className="card" style={{ background: '#fed7aa' }}>
                    <div style={{ fontSize: '14px', color: '#92400e', marginBottom: '8px' }}>
                      Pendientes
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: '#92400e' }}>
                      ${fines.pendingFines.toFixed(2)}
                    </div>
                  </div>
                  
                  <div className="card" style={{ background: '#d1fae5' }}>
                    <div style={{ fontSize: '14px', color: '#065f46', marginBottom: '8px' }}>
                      Pagadas
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: '#065f46' }}>
                      ${fines.paidFines.toFixed(2)}
                    </div>
                  </div>
                </div>
              )}

              {fines && fines.fines.length > 0 ? (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Tipo</th>
                      <th>Monto</th>
                      <th>Descripción</th>
                      <th>Estado</th>
                      <th>Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fines.fines.map(fine => (
                      <tr key={fine._id}>
                        <td>
                          <span className="badge badge-secondary">
                            {fine.type}
                          </span>
                        </td>
                        <td style={{ fontWeight: '600', color: '#ef4444' }}>
                          ${fine.amount.toFixed(2)}
                        </td>
                        <td>{fine.description}</td>
                        <td>
                          <span className={`badge badge-${fine.status === 'paid' ? 'success' : 'warning'}`}>
                            {fine.status === 'paid' ? 'Pagada' : fine.status === 'waived' ? 'Condonada' : 'Pendiente'}
                          </span>
                        </td>
                        <td>{new Date(fine.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{ textAlign: 'center', color: '#6b7280', padding: '40px' }}>
                  No tienes multas registradas
                </p>
              )}
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="card">
              <h3 className="card-header">Notificaciones</h3>
              {notifications.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#6b7280', padding: '40px' }}>
                  No tienes notificaciones
                </p>
              ) : (
                <div>
                  {notifications.map(notif => (
                    <div
                      key={notif._id}
                      style={{
                        padding: '16px',
                        borderBottom: '1px solid #e5e7eb',
                        background: notif.isRead ? 'white' : '#f0f9ff',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <strong>{notif.title}</strong>
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>
                          {new Date(notif.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div style={{ color: '#4b5563' }}>{notif.message}</div>
                      {!notif.isRead && (
                        <span className="badge badge-info" style={{ marginTop: '8px' }}>
                          Nueva
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RepartidorDashboard;
