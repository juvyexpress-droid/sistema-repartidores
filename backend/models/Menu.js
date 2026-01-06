const db = require('../config/database');

const Menu = {
  async findById(id) {
    const result = await db.query(
      'SELECT * FROM menus WHERE id = $1',
      [id]
    );
    return result.rows[0];
  },

  async findAll(filters = {}) {
    let query = 'SELECT * FROM menus WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (filters.categoria) {
      query += ` AND categoria = $${paramCount}`;
      params.push(filters.categoria);
      paramCount++;
    }

    if (filters.disponible !== undefined) {
      query += ` AND disponible = $${paramCount}`;
      params.push(filters.disponible);
      paramCount++;
    }

    query += ' ORDER BY categoria, nombre';

    const result = await db.query(query, params);
    return result.rows;
  },

  async create(menu) {
    const result = await db.query(
      `INSERT INTO menus (nombre, descripcion, precio, categoria, disponible, imagen_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [menu.nombre, menu.descripcion, menu.precio, menu.categoria, menu.disponible, menu.imagen_url]
    );
    return result.rows[0];
  },

  async update(id, menu) {
    const fields = [];
    const params = [];
    let paramCount = 1;

    if (menu.nombre) {
      fields.push(`nombre = $${paramCount}`);
      params.push(menu.nombre);
      paramCount++;
    }
    if (menu.descripcion !== undefined) {
      fields.push(`descripcion = $${paramCount}`);
      params.push(menu.descripcion);
      paramCount++;
    }
    if (menu.precio) {
      fields.push(`precio = $${paramCount}`);
      params.push(menu.precio);
      paramCount++;
    }
    if (menu.categoria) {
      fields.push(`categoria = $${paramCount}`);
      params.push(menu.categoria);
      paramCount++;
    }
    if (menu.disponible !== undefined) {
      fields.push(`disponible = $${paramCount}`);
      params.push(menu.disponible);
      paramCount++;
    }
    if (menu.imagen_url !== undefined) {
      fields.push(`imagen_url = $${paramCount}`);
      params.push(menu.imagen_url);
      paramCount++;
    }

    fields.push(`fecha_actualizacion = CURRENT_TIMESTAMP`);
    params.push(id);

    const result = await db.query(
      `UPDATE menus SET ${fields.join(', ')} WHERE id = $${paramCount}
       RETURNING *`,
      params
    );
    return result.rows[0];
  },

  async delete(id) {
    const result = await db.query(
      'DELETE FROM menus WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rows[0];
  },

  async getCategorias() {
    const result = await db.query(
      'SELECT DISTINCT categoria FROM menus WHERE categoria IS NOT NULL ORDER BY categoria'
    );
    return result.rows.map(row => row.categoria);
  }
};

module.exports = Menu;
