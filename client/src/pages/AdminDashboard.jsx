import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminService, orderService } from '../services/api';

function AdminDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [repartidores, setRepartidores] = useState([]);
  const [zones, setZones] = useState([]);
  const [establishments, setEstablishments] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [fines, setFines] = useState([]);
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (activeTab === 'orders') {
      loadOrders();
    } else if (activeTab === 'repartidores') {
      loadRepartidores();
    } else if (activeTab === 'zones') {
      loadZones();
    } else if (activeTab === 'establishments') {
      loadEstablishments();
    } else if (activeTab === 'promotions') {
      loadPromotions();
    } else if (activeTab === 'fines') {
      loadFines();
    } else if (activeTab === 'reports') {
      loadReports();
    }
  }, [activeTab]);

  const loadInitialData = async () => {
    await Promise.all([loadOrders(), loadRepartidores()]);
  };

  const loadOrders = async () => {
    try {
      const response = await orderService.getOrders();
      setOrders(response.data.orders);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const loadRepartidores = async () => {
    try {
      const response = await adminService.getRepartidores();
      setRepartidores(response.data.repartidores);
    } catch (error) {
      console.error('Error loading repartidores:', error);
    }
  };

  const loadZones = async () => {
    try {
      const response = await adminService.getZones();
      setZones(response.data.zones);
    } catch (error) {
      console.error('Error loading zones:', error);
    }
  };

  const loadEstablishments = async () => {
    try {
      const response = await adminService.getEstablishments();
      setEstablishments(response.data.establishments);
    } catch (error) {
      console.error('Error loading establishments:', error);
    }
  };

  const loadPromotions = async () => {
    try {
      const response = await adminService.getPromotions();
      setPromotions(response.data.promotions);
    } catch (error) {
      console.error('Error loading promotions:', error);
    }
  };

  const loadFines = async () => {
    try {
      const response = await adminService.getAllFines();
      setFines(response.data.fines);
    } catch (error) {
      console.error('Error loading fines:', error);
    }
  };

  const loadReports = async () => {
    try {
      const response = await adminService.getReports({ period: 'monthly' });
      setReports(response.data);
    } catch (error) {
      console.error('Error loading reports:', error);
    }
  };

  const assignOrder = async (orderId, repartidorId) => {
    try {
      await orderService.assignOrder({ orderId, repartidorId });
      alert('Pedido asignado exitosamente');
      loadOrders();
    } catch (error) {
      alert(error.response?.data?.error || 'Error al asignar pedido');
    }
  };

  const updateRepartidorPercentage = async (repartidorId, percentage) => {
    try {
      await adminService.updateRepartidor(repartidorId, { percentage: parseFloat(percentage) });
      alert('Porcentaje actualizado exitosamente');
      loadRepartidores();
    } catch (error) {
      alert(error.response?.data?.error || 'Error al actualizar porcentaje');
    }
  };

  const toggleRepartidorStatus = async (repartidorId, currentStatus) => {
    try {
      await adminService.updateRepartidor(repartidorId, { isDisabledByAdmin: !currentStatus });
      alert(`Repartidor ${!currentStatus ? 'deshabilitado' : 'habilitado'} exitosamente`);
      loadRepartidores();
    } catch (error) {
      alert(error.response?.data?.error || 'Error al cambiar estado');
    }
  };

  const createFine = async (e, repartidorId) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const fineData = {
      repartidorId,
      type: formData.get('type'),
      amount: parseFloat(formData.get('amount')),
      description: formData.get('description'),
    };

    try {
      await adminService.createFine(fineData);
      alert('Multa creada exitosamente');
      e.target.reset();
      loadFines();
      loadRepartidores();
    } catch (error) {
      alert(error.response?.data?.error || 'Error al crear multa');
    }
  };

  const createZone = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const zoneData = {
      name: formData.get('name'),
      description: formData.get('description'),
      sectors: [{
        name: formData.get('sectorName'),
        baseDeliveryFee: parseFloat(formData.get('baseDeliveryFee'))
      }]
    };

    try {
      await adminService.createZone(zoneData);
      alert('Zona creada exitosamente');
      e.target.reset();
      loadZones();
    } catch (error) {
      alert(error.response?.data?.error || 'Error al crear zona');
    }
  };

  const createEstablishment = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const establishmentData = {
      name: formData.get('name'),
      category: formData.get('category'),
      address: formData.get('address'),
      phone: formData.get('phone'),
      zone: formData.get('zone'),
      sector: formData.get('sector'),
    };

    try {
      await adminService.createEstablishment(establishmentData);
      alert('Establecimiento creado exitosamente');
      e.target.reset();
      loadEstablishments();
    } catch (error) {
      alert(error.response?.data?.error || 'Error al crear establecimiento');
    }
  };

  const createPromotion = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const promotionData = {
      name: formData.get('name'),
      description: formData.get('description'),
      type: formData.get('type'),
      value: parseFloat(formData.get('value')),
      establishment: formData.get('establishment') || undefined,
      startDate: formData.get('startDate'),
      endDate: formData.get('endDate'),
      minOrderAmount: parseFloat(formData.get('minOrderAmount')) || 0,
    };

    try {
      await adminService.createPromotion(promotionData);
      alert('Promoción creada exitosamente');
      e.target.reset();
      loadPromotions();
    } catch (error) {
      alert(error.response?.data?.error || 'Error al crear promoción');
    }
  };

  const createOrder = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const orderData = {
      customer: {
        name: formData.get('customerName'),
        phone: formData.get('customerPhone'),
        address: formData.get('customerAddress'),
        zone: formData.get('zone'),
        sector: formData.get('sector'),
      },
      establishment: formData.get('establishment') || undefined,
      subtotal: parseFloat(formData.get('subtotal')),
      notes: formData.get('notes'),
    };

    try {
      await orderService.createOrder(orderData);
      alert('Pedido creado exitosamente');
      e.target.reset();
      loadOrders();
    } catch (error) {
      alert(error.response?.data?.error || 'Error al crear pedido');
    }
  };

  const availableRepartidores = repartidores.filter(r => r.isAvailable && !r.isDisabledByAdmin);

  return (
    <div>
      {/* Header */}
      <div className="header">
        <div className="header-content">
          <div>
            <h1>Juvy Administrador</h1>
            <div style={{ fontSize: '14px', opacity: 0.9', marginTop: '4px' }}>
              Panel de Control - {user.name}
            </div>
          </div>
          
          <button onClick={logout} className="btn btn-secondary">
            Cerrar Sesión
          </button>
        </div>
      </div>

      <div className="container">
        {/* Stats */}
        <div className="grid grid-4" style={{ marginTop: '20px' }}>
          <div className="stat-card">
            <div className="stat-label">Pedidos Activos</div>
            <div className="stat-value">
              {orders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length}
            </div>
          </div>
          <div className="stat-card" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
            <div className="stat-label">Repartidores Disponibles</div>
            <div className="stat-value">{availableRepartidores.length}</div>
          </div>
          <div className="stat-card" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
            <div className="stat-label">Total Repartidores</div>
            <div className="stat-value">{repartidores.length}</div>
          </div>
          <div className="stat-card" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}>
            <div className="stat-label">Zonas Activas</div>
            <div className="stat-value">{zones.filter(z => z.isActive).length}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs" style={{ marginTop: '30px' }}>
          <button
            className={`tab ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            Pedidos
          </button>
          <button
            className={`tab ${activeTab === 'repartidores' ? 'active' : ''}`}
            onClick={() => setActiveTab('repartidores')}
          >
            Repartidores
          </button>
          <button
            className={`tab ${activeTab === 'zones' ? 'active' : ''}`}
            onClick={() => setActiveTab('zones')}
          >
            Zonas y Tarifas
          </button>
          <button
            className={`tab ${activeTab === 'establishments' ? 'active' : ''}`}
            onClick={() => setActiveTab('establishments')}
          >
            Establecimientos
          </button>
          <button
            className={`tab ${activeTab === 'promotions' ? 'active' : ''}`}
            onClick={() => setActiveTab('promotions')}
          >
            Promociones
          </button>
          <button
            className={`tab ${activeTab === 'fines' ? 'active' : ''}`}
            onClick={() => setActiveTab('fines')}
          >
            Multas
          </button>
          <button
            className={`tab ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            Reportes
          </button>
        </div>

        {/* Content */}
        <div style={{ marginTop: '20px' }}>
          {activeTab === 'orders' && (
            <>
              <div className="card" style={{ marginBottom: '20px' }}>
                <h3 className="card-header">Crear Nuevo Pedido</h3>
                <form onSubmit={createOrder}>
                  <div className="grid grid-2">
                    <div className="form-group">
                      <label className="form-label">Nombre del Cliente</label>
                      <input type="text" name="customerName" className="form-input" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Teléfono</label>
                      <input type="tel" name="customerPhone" className="form-input" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Dirección</label>
                      <input type="text" name="customerAddress" className="form-input" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Zona</label>
                      <select name="zone" className="form-select" required>
                        <option value="">Seleccionar zona</option>
                        {zones.map(zone => (
                          <option key={zone._id} value={zone._id}>{zone.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Sector</label>
                      <input type="text" name="sector" className="form-input" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Establecimiento (Opcional)</label>
                      <select name="establishment" className="form-select">
                        <option value="">Ninguno</option>
                        {establishments.map(est => (
                          <option key={est._id} value={est._id}>{est.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Subtotal</label>
                      <input type="number" step="0.01" name="subtotal" className="form-input" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Notas</label>
                      <input type="text" name="notes" className="form-input" />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary">Crear Pedido</button>
                </form>
              </div>

              <div className="card">
                <h3 className="card-header">Gestión de Pedidos</h3>
                {orders.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#6b7280', padding: '40px' }}>
                    No hay pedidos
                  </p>
                ) : (
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Número</th>
                        <th>Cliente</th>
                        <th>Total</th>
                        <th>Repartidor</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(order => (
                        <tr key={order._id}>
                          <td>{order.orderNumber}</td>
                          <td>
                            <div>{order.customer.name}</div>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>
                              {order.customer.phone}
                            </div>
                          </td>
                          <td>${order.total.toFixed(2)}</td>
                          <td>
                            {order.repartidor ? (
                              order.repartidor.name
                            ) : (
                              <span style={{ color: '#6b7280' }}>Sin asignar</span>
                            )}
                          </td>
                          <td>
                            <span className={`badge badge-${
                              order.status === 'delivered' ? 'success' :
                              order.status === 'pending' ? 'warning' :
                              order.status === 'rejected' ? 'danger' : 'info'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td>
                            {order.status === 'pending' && (
                              <select
                                onChange={(e) => {
                                  if (e.target.value) {
                                    assignOrder(order._id, e.target.value);
                                    e.target.value = '';
                                  }
                                }}
                                className="form-select"
                                style={{ minWidth: '150px' }}
                              >
                                <option value="">Asignar a...</option>
                                {availableRepartidores.map(rep => (
                                  <option key={rep._id} value={rep._id}>
                                    {rep.name} ({rep.percentage}%)
                                  </option>
                                ))}
                              </select>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}

          {activeTab === 'repartidores' && (
            <div className="card">
              <h3 className="card-header">Gestión de Repartidores</h3>
              {repartidores.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#6b7280', padding: '40px' }}>
                  No hay repartidores registrados
                </p>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Email</th>
                      <th>Disponible</th>
                      <th>Porcentaje</th>
                      <th>Entregas</th>
                      <th>Multas</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {repartidores.map(rep => (
                      <tr key={rep._id}>
                        <td>{rep.name}</td>
                        <td>{rep.email}</td>
                        <td>
                          <span className={`badge badge-${rep.isAvailable ? 'success' : 'secondary'}`}>
                            {rep.isAvailable ? 'Sí' : 'No'}
                          </span>
                        </td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            defaultValue={rep.percentage}
                            onBlur={(e) => {
                              if (e.target.value !== rep.percentage.toString()) {
                                updateRepartidorPercentage(rep._id, e.target.value);
                              }
                            }}
                            style={{ width: '70px', padding: '4px', borderRadius: '4px', border: '1px solid #d1d5db' }}
                          />
                          %
                        </td>
                        <td>{rep.totalDeliveries || 0}</td>
                        <td style={{ color: '#ef4444', fontWeight: '600' }}>
                          ${rep.totalFines?.toFixed(2) || '0.00'}
                        </td>
                        <td>
                          {rep.isDisabledByAdmin ? (
                            <span className="badge badge-danger">Deshabilitado</span>
                          ) : (
                            <span className="badge badge-success">Activo</span>
                          )}
                        </td>
                        <td>
                          <button
                            onClick={() => toggleRepartidorStatus(rep._id, rep.isDisabledByAdmin)}
                            className={`btn ${rep.isDisabledByAdmin ? 'btn-success' : 'btn-danger'}`}
                            style={{ fontSize: '12px', padding: '6px 12px' }}
                          >
                            {rep.isDisabledByAdmin ? 'Habilitar' : 'Deshabilitar'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'zones' && (
            <>
              <div className="card" style={{ marginBottom: '20px' }}>
                <h3 className="card-header">Crear Nueva Zona</h3>
                <form onSubmit={createZone}>
                  <div className="grid grid-2">
                    <div className="form-group">
                      <label className="form-label">Nombre de la Zona</label>
                      <input type="text" name="name" className="form-input" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Descripción</label>
                      <input type="text" name="description" className="form-input" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Nombre del Sector</label>
                      <input type="text" name="sectorName" className="form-input" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Tarifa Base de Envío</label>
                      <input type="number" step="0.01" name="baseDeliveryFee" className="form-input" required />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary">Crear Zona</button>
                </form>
              </div>

              <div className="card">
                <h3 className="card-header">Zonas y Tarifas de Envío</h3>
                {zones.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#6b7280', padding: '40px' }}>
                    No hay zonas configuradas
                  </p>
                ) : (
                  <div className="grid grid-2">
                    {zones.map(zone => (
                      <div key={zone._id} className="card" style={{ background: '#f9fafb' }}>
                        <h4 style={{ marginBottom: '12px', color: '#1f2937' }}>{zone.name}</h4>
                        {zone.description && (
                          <p style={{ color: '#6b7280', marginBottom: '12px' }}>
                            {zone.description}
                          </p>
                        )}
                        
                        <div style={{ marginTop: '12px' }}>
                          <strong>Sectores:</strong>
                          <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                            {zone.sectors.map((sector, idx) => (
                              <li key={idx} style={{ marginBottom: '4px' }}>
                                {sector.name} - ${sector.baseDeliveryFee.toFixed(2)}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <span className={`badge badge-${zone.isActive ? 'success' : 'secondary'}`} style={{ marginTop: '12px' }}>
                          {zone.isActive ? 'Activa' : 'Inactiva'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'establishments' && (
            <>
              <div className="card" style={{ marginBottom: '20px' }}>
                <h3 className="card-header">Crear Nuevo Establecimiento</h3>
                <form onSubmit={createEstablishment}>
                  <div className="grid grid-2">
                    <div className="form-group">
                      <label className="form-label">Nombre</label>
                      <input type="text" name="name" className="form-input" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Categoría</label>
                      <select name="category" className="form-select" required>
                        <option value="restaurant">Restaurante</option>
                        <option value="pharmacy">Farmacia</option>
                        <option value="grocery">Supermercado</option>
                        <option value="retail">Retail</option>
                        <option value="other">Otro</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Dirección</label>
                      <input type="text" name="address" className="form-input" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Teléfono</label>
                      <input type="tel" name="phone" className="form-input" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Zona</label>
                      <select name="zone" className="form-select" required>
                        <option value="">Seleccionar zona</option>
                        {zones.map(zone => (
                          <option key={zone._id} value={zone._id}>{zone.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Sector</label>
                      <input type="text" name="sector" className="form-input" />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary">Crear Establecimiento</button>
                </form>
              </div>

              <div className="card">
                <h3 className="card-header">Establecimientos</h3>
                {establishments.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#6b7280', padding: '40px' }}>
                    No hay establecimientos registrados
                  </p>
                ) : (
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Categoría</th>
                        <th>Dirección</th>
                        <th>Zona</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {establishments.map(est => (
                        <tr key={est._id}>
                          <td>{est.name}</td>
                          <td>
                            <span className="badge badge-secondary">{est.category}</span>
                          </td>
                          <td>{est.address}</td>
                          <td>{est.zone?.name || 'N/A'}</td>
                          <td>
                            <span className={`badge badge-${est.isActive ? 'success' : 'secondary'}`}>
                              {est.isActive ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}

          {activeTab === 'promotions' && (
            <>
              <div className="card" style={{ marginBottom: '20px' }}>
                <h3 className="card-header">Crear Nueva Promoción</h3>
                <form onSubmit={createPromotion}>
                  <div className="grid grid-2">
                    <div className="form-group">
                      <label className="form-label">Nombre</label>
                      <input type="text" name="name" className="form-input" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Tipo</label>
                      <select name="type" className="form-select" required>
                        <option value="percentage">Porcentaje de descuento</option>
                        <option value="fixed_amount">Monto fijo de descuento</option>
                        <option value="free_delivery">Envío gratis</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Valor</label>
                      <input type="number" step="0.01" name="value" className="form-input" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Establecimiento (Opcional)</label>
                      <select name="establishment" className="form-select">
                        <option value="">Todos</option>
                        {establishments.map(est => (
                          <option key={est._id} value={est._id}>{est.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Monto Mínimo de Pedido</label>
                      <input type="number" step="0.01" name="minOrderAmount" className="form-input" defaultValue="0" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Fecha de Inicio</label>
                      <input type="date" name="startDate" className="form-input" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Fecha de Fin</label>
                      <input type="date" name="endDate" className="form-input" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Descripción</label>
                      <input type="text" name="description" className="form-input" />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary">Crear Promoción</button>
                </form>
              </div>

              <div className="card">
                <h3 className="card-header">Promociones</h3>
                {promotions.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#6b7280', padding: '40px' }}>
                    No hay promociones activas
                  </p>
                ) : (
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Tipo</th>
                        <th>Valor</th>
                        <th>Establecimiento</th>
                        <th>Vigencia</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {promotions.map(promo => (
                        <tr key={promo._id}>
                          <td>{promo.name}</td>
                          <td>
                            <span className="badge badge-info">{promo.type}</span>
                          </td>
                          <td>
                            {promo.type === 'percentage' ? `${promo.value}%` : `$${promo.value}`}
                          </td>
                          <td>{promo.establishment?.name || 'Todos'}</td>
                          <td>
                            <div style={{ fontSize: '12px' }}>
                              {new Date(promo.startDate).toLocaleDateString()} - {new Date(promo.endDate).toLocaleDateString()}
                            </div>
                          </td>
                          <td>
                            <span className={`badge badge-${promo.isActive ? 'success' : 'secondary'}`}>
                              {promo.isActive ? 'Activa' : 'Inactiva'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}

          {activeTab === 'fines' && (
            <>
              <div className="card" style={{ marginBottom: '20px' }}>
                <h3 className="card-header">Crear Nueva Multa</h3>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const repartidorId = e.target.repartidorId.value;
                  if (!repartidorId) {
                    alert('Seleccione un repartidor');
                    return;
                  }
                  createFine(e, repartidorId);
                }}>
                  <div className="grid grid-2">
                    <div className="form-group">
                      <label className="form-label">Repartidor</label>
                      <select name="repartidorId" className="form-select" required>
                        <option value="">Seleccionar repartidor</option>
                        {repartidores.map(rep => (
                          <option key={rep._id} value={rep._id}>{rep.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Tipo</label>
                      <select name="type" className="form-select" required>
                        <option value="delay">Atraso</option>
                        <option value="unjustified_rejection">Rechazo injustificado</option>
                        <option value="customer_complaint">Queja del cliente</option>
                        <option value="policy_violation">Violación de política</option>
                        <option value="other">Otro</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Monto</label>
                      <input type="number" step="0.01" name="amount" className="form-input" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Descripción</label>
                      <input type="text" name="description" className="form-input" required />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary">Crear Multa</button>
                </form>
              </div>

              <div className="card">
                <h3 className="card-header">Multas Registradas</h3>
                {fines.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#6b7280', padding: '40px' }}>
                    No hay multas registradas
                  </p>
                ) : (
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Repartidor</th>
                        <th>Tipo</th>
                        <th>Monto</th>
                        <th>Descripción</th>
                        <th>Estado</th>
                        <th>Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fines.map(fine => (
                        <tr key={fine._id}>
                          <td>{fine.repartidor?.name || 'N/A'}</td>
                          <td>
                            <span className="badge badge-secondary">{fine.type}</span>
                          </td>
                          <td style={{ fontWeight: '600', color: '#ef4444' }}>
                            ${fine.amount.toFixed(2)}
                          </td>
                          <td>{fine.description}</td>
                          <td>
                            <span className={`badge badge-${fine.status === 'paid' ? 'success' : fine.status === 'waived' ? 'info' : 'warning'}`}>
                              {fine.status === 'paid' ? 'Pagada' : fine.status === 'waived' ? 'Condonada' : 'Pendiente'}
                            </span>
                          </td>
                          <td>{new Date(fine.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}

          {activeTab === 'reports' && (
            <div className="card">
              <h3 className="card-header">Reportes y Análisis</h3>
              
              {reports && (
                <>
                  <div className="grid grid-4" style={{ marginBottom: '24px' }}>
                    <div className="card" style={{ background: '#f0fdf4' }}>
                      <div style={{ fontSize: '14px', color: '#15803d', marginBottom: '8px' }}>
                        Total Pedidos
                      </div>
                      <div style={{ fontSize: '28px', fontWeight: '700', color: '#15803d' }}>
                        {reports.summary.totalOrders}
                      </div>
                    </div>
                    
                    <div className="card" style={{ background: '#eff6ff' }}>
                      <div style={{ fontSize: '14px', color: '#1e40af', marginBottom: '8px' }}>
                        Ingresos Totales
                      </div>
                      <div style={{ fontSize: '28px', fontWeight: '700', color: '#1e40af' }}>
                        ${reports.summary.totalRevenue.toFixed(2)}
                      </div>
                    </div>
                    
                    <div className="card" style={{ background: '#fef3c7' }}>
                      <div style={{ fontSize: '14px', color: '#92400e', marginBottom: '8px' }}>
                        Tarifas de Envío
                      </div>
                      <div style={{ fontSize: '28px', fontWeight: '700', color: '#92400e' }}>
                        ${reports.summary.totalDeliveryFees.toFixed(2)}
                      </div>
                    </div>
                    
                    <div className="card" style={{ background: '#f3e8ff' }}>
                      <div style={{ fontSize: '14px', color: '#6b21a8', marginBottom: '8px' }}>
                        Ganancia Empresa
                      </div>
                      <div style={{ fontSize: '28px', fontWeight: '700', color: '#6b21a8' }}>
                        ${reports.summary.companyProfit.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <h4 style={{ marginTop: '32px', marginBottom: '16px', color: '#1f2937' }}>
                    Rendimiento por Repartidor
                  </h4>
                  
                  {reports.byRepartidor.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#6b7280', padding: '40px' }}>
                      No hay datos de rendimiento
                    </p>
                  ) : (
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Repartidor</th>
                          <th>Pedidos</th>
                          <th>Ganancias</th>
                          <th>Porcentaje</th>
                          <th>Promedio/Pedido</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reports.byRepartidor.map((rep, idx) => (
                          <tr key={idx}>
                            <td>{rep.repartidor}</td>
                            <td>{rep.orders}</td>
                            <td style={{ fontWeight: '600', color: '#10b981' }}>
                              ${rep.earnings.toFixed(2)}
                            </td>
                            <td>{rep.percentage}%</td>
                            <td>${(rep.earnings / rep.orders).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
