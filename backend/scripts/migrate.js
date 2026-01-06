const db = require('../config/database');

const createTables = async () => {
  try {
    console.log('Creating tables...');

    // Tabla de usuarios (clientes y repartidores)
    await db.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE,
        telefono VARCHAR(50),
        rol VARCHAR(50) NOT NULL CHECK (rol IN ('cliente', 'repartidor', 'admin')),
        password_hash VARCHAR(255),
        direccion TEXT,
        activo BOOLEAN DEFAULT true,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Tabla usuarios creada');

    // Tabla de menús
    await db.query(`
      CREATE TABLE IF NOT EXISTS menus (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        descripcion TEXT,
        precio DECIMAL(10, 2) NOT NULL,
        categoria VARCHAR(100),
        disponible BOOLEAN DEFAULT true,
        imagen_url VARCHAR(500),
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Tabla menus creada');

    // Tabla de pedidos
    await db.query(`
      CREATE TABLE IF NOT EXISTS pedidos (
        id SERIAL PRIMARY KEY,
        cliente_id INTEGER REFERENCES usuarios(id),
        repartidor_id INTEGER REFERENCES usuarios(id),
        direccion_entrega TEXT NOT NULL,
        productos JSONB NOT NULL,
        total DECIMAL(10, 2) NOT NULL,
        estado VARCHAR(50) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_proceso', 'entregado', 'cancelado')),
        notas TEXT,
        telefono_cliente VARCHAR(50),
        fecha_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_asignacion TIMESTAMP,
        fecha_entrega TIMESTAMP,
        metodo_pago VARCHAR(50),
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Tabla pedidos creada');

    // Crear índices para mejor rendimiento
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_pedidos_cliente ON pedidos(cliente_id);
      CREATE INDEX IF NOT EXISTS idx_pedidos_repartidor ON pedidos(repartidor_id);
      CREATE INDEX IF NOT EXISTS idx_pedidos_estado ON pedidos(estado);
      CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);
    `);
    console.log('✓ Índices creados');

    console.log('Migración completada exitosamente!');
    process.exit(0);
  } catch (error) {
    console.error('Error durante la migración:', error);
    process.exit(1);
  }
};

createTables();
