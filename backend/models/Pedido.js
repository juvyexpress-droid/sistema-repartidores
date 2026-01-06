const db = require('../config/database');

const Pedido = {
  async findById(id) {
    const result = await db.query(
      `SELECT p.*, 
              u_cliente.nombre as cliente_nombre,
              u_cliente.telefono as cliente_telefono,
              u_repartidor.nombre as repartidor_nombre,
              u_repartidor.telefono as repartidor_telefono
       FROM pedidos p
       LEFT JOIN usuarios u_cliente ON p.cliente_id = u_cliente.id
       LEFT JOIN usuarios u_repartidor ON p.repartidor_id = u_repartidor.id
       WHERE p.id = $1`,
      [id]
    );
    return result.rows[0];
  },

  async findAll(filters = {}) {
    let query = `
      SELECT p.*, 
             u_cliente.nombre as cliente_nombre,
             u_repartidor.nombre as repartidor_nombre
      FROM pedidos p
      LEFT JOIN usuarios u_cliente ON p.cliente_id = u_cliente.id
      LEFT JOIN usuarios u_repartidor ON p.repartidor_id = u_repartidor.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (filters.estado) {
      query += ` AND p.estado = $${paramCount}`;
      params.push(filters.estado);
      paramCount++;
    }

    if (filters.repartidor_id) {
      query += ` AND p.repartidor_id = $${paramCount}`;
      params.push(filters.repartidor_id);
      paramCount++;
    }

    if (filters.cliente_id) {
      query += ` AND p.cliente_id = $${paramCount}`;
      params.push(filters.cliente_id);
      paramCount++;
    }

    query += ' ORDER BY p.fecha_pedido DESC';

    const result = await db.query(query, params);
    return result.rows;
  },

  async create(pedido) {
    const result = await db.query(
      `INSERT INTO pedidos (
        cliente_id, repartidor_id, direccion_entrega, productos, 
        total, estado, notas, telefono_cliente, metodo_pago, fecha_asignacion
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        pedido.cliente_id, 
        pedido.repartidor_id, 
        pedido.direccion_entrega, 
        JSON.stringify(pedido.productos),
        pedido.total, 
        pedido.estado || 'pendiente', 
        pedido.notas,
        pedido.telefono_cliente,
        pedido.metodo_pago,
        pedido.repartidor_id ? new Date() : null
      ]
    );
    return result.rows[0];
  },

  async updateEstado(id, estado, repartidorId = null) {
    let query = 'UPDATE pedidos SET estado = $1, fecha_actualizacion = CURRENT_TIMESTAMP';
    const params = [estado];
    let paramCount = 2;

    if (estado === 'en_proceso' && repartidorId) {
      query += `, repartidor_id = $${paramCount}, fecha_asignacion = CURRENT_TIMESTAMP`;
      params.push(repartidorId);
      paramCount++;
    }

    if (estado === 'entregado') {
      query += ', fecha_entrega = CURRENT_TIMESTAMP';
    }

    query += ` WHERE id = $${paramCount} RETURNING *`;
    params.push(id);

    const result = await db.query(query, params);
    return result.rows[0];
  },

  async update(id, pedido) {
    const fields = [];
    const params = [];
    let paramCount = 1;

    if (pedido.repartidor_id !== undefined) {
      fields.push(`repartidor_id = $${paramCount}`);
      params.push(pedido.repartidor_id);
      paramCount++;
      
      if (pedido.repartidor_id) {
        fields.push(`fecha_asignacion = CURRENT_TIMESTAMP`);
      }
    }

    if (pedido.direccion_entrega) {
      fields.push(`direccion_entrega = $${paramCount}`);
      params.push(pedido.direccion_entrega);
      paramCount++;
    }

    if (pedido.productos) {
      fields.push(`productos = $${paramCount}`);
      params.push(JSON.stringify(pedido.productos));
      paramCount++;
    }

    if (pedido.total) {
      fields.push(`total = $${paramCount}`);
      params.push(pedido.total);
      paramCount++;
    }

    if (pedido.notas !== undefined) {
      fields.push(`notas = $${paramCount}`);
      params.push(pedido.notas);
      paramCount++;
    }

    fields.push(`fecha_actualizacion = CURRENT_TIMESTAMP`);
    params.push(id);

    const result = await db.query(
      `UPDATE pedidos SET ${fields.join(', ')} WHERE id = $${paramCount}
       RETURNING *`,
      params
    );
    return result.rows[0];
  },

  async delete(id) {
    const result = await db.query(
      'DELETE FROM pedidos WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rows[0];
  },

  async getEstadisticas() {
    const result = await db.query(`
      SELECT 
        COUNT(*) as total_pedidos,
        COUNT(*) FILTER (WHERE estado = 'entregado') as pedidos_entregados,
        COUNT(*) FILTER (WHERE estado = 'pendiente') as pedidos_pendientes,
        COUNT(*) FILTER (WHERE estado = 'en_proceso') as pedidos_en_proceso,
        COALESCE(SUM(total) FILTER (WHERE estado = 'entregado'), 0) as ingresos_totales,
        COALESCE(AVG(total) FILTER (WHERE estado = 'entregado'), 0) as ticket_promedio
      FROM pedidos
    `);
    return result.rows[0];
  }
};

module.exports = Pedido;
