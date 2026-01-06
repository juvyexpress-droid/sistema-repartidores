const db = require('../config/database');

const Usuario = {
  async findById(id) {
    const result = await db.query(
      'SELECT id, nombre, email, telefono, rol, direccion, activo, fecha_creacion FROM usuarios WHERE id = $1',
      [id]
    );
    return result.rows[0];
  },

  async findByEmail(email) {
    const result = await db.query(
      'SELECT * FROM usuarios WHERE email = $1',
      [email]
    );
    return result.rows[0];
  },

  async findAll(filters = {}) {
    let query = 'SELECT id, nombre, email, telefono, rol, direccion, activo, fecha_creacion FROM usuarios WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (filters.rol) {
      query += ` AND rol = $${paramCount}`;
      params.push(filters.rol);
      paramCount++;
    }

    if (filters.activo !== undefined) {
      query += ` AND activo = $${paramCount}`;
      params.push(filters.activo);
      paramCount++;
    }

    query += ' ORDER BY fecha_creacion DESC';

    const result = await db.query(query, params);
    return result.rows;
  },

  async create(usuario) {
    const result = await db.query(
      `INSERT INTO usuarios (nombre, email, telefono, rol, password_hash, direccion, activo)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, nombre, email, telefono, rol, direccion, activo, fecha_creacion`,
      [usuario.nombre, usuario.email, usuario.telefono, usuario.rol, usuario.password_hash, usuario.direccion, usuario.activo]
    );
    return result.rows[0];
  },

  async update(id, usuario) {
    const fields = [];
    const params = [];
    let paramCount = 1;

    if (usuario.nombre) {
      fields.push(`nombre = $${paramCount}`);
      params.push(usuario.nombre);
      paramCount++;
    }
    if (usuario.email) {
      fields.push(`email = $${paramCount}`);
      params.push(usuario.email);
      paramCount++;
    }
    if (usuario.telefono) {
      fields.push(`telefono = $${paramCount}`);
      params.push(usuario.telefono);
      paramCount++;
    }
    if (usuario.direccion) {
      fields.push(`direccion = $${paramCount}`);
      params.push(usuario.direccion);
      paramCount++;
    }
    if (usuario.activo !== undefined) {
      fields.push(`activo = $${paramCount}`);
      params.push(usuario.activo);
      paramCount++;
    }
    if (usuario.password_hash) {
      fields.push(`password_hash = $${paramCount}`);
      params.push(usuario.password_hash);
      paramCount++;
    }

    fields.push(`fecha_actualizacion = CURRENT_TIMESTAMP`);
    params.push(id);

    const result = await db.query(
      `UPDATE usuarios SET ${fields.join(', ')} WHERE id = $${paramCount}
       RETURNING id, nombre, email, telefono, rol, direccion, activo, fecha_actualizacion`,
      params
    );
    return result.rows[0];
  },

  async delete(id) {
    const result = await db.query(
      'DELETE FROM usuarios WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rows[0];
  },

  async getRepartidoresDisponibles() {
    // Buscar repartidor con menos pedidos activos (pendientes o en proceso)
    const result = await db.query(
      `SELECT u.id, u.nombre, COUNT(p.id) as pedidos_activos
       FROM usuarios u
       LEFT JOIN pedidos p ON u.id = p.repartidor_id 
         AND p.estado IN ('pendiente', 'en_proceso')
       WHERE u.rol = 'repartidor' AND u.activo = true
       GROUP BY u.id, u.nombre
       ORDER BY pedidos_activos ASC, RANDOM()
       LIMIT 1`
    );
    return result.rows[0];
  },

  query: (text, params) => db.query(text, params)
};

module.exports = Usuario;
