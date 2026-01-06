const bcrypt = require('bcryptjs');
const db = require('../config/database');

const seedData = async () => {
  try {
    console.log('Iniciando seed de datos...');

    // Hash para passwords de ejemplo
    const passwordHash = await bcrypt.hash('password123', 10);

    // Insertar usuarios de ejemplo
    await db.query(`
      INSERT INTO usuarios (nombre, email, telefono, rol, password_hash, direccion, activo)
      VALUES 
        ('Admin Principal', 'admin@sistema.com', '1234567890', 'admin', $1, 'Dirección Admin', true),
        ('Juan Pérez', 'juan@repartidor.com', '1234567891', 'repartidor', $1, 'Calle 1 #123', true),
        ('María García', 'maria@repartidor.com', '1234567892', 'repartidor', $1, 'Calle 2 #456', true),
        ('Carlos López', 'carlos@cliente.com', '1234567893', 'cliente', NULL, 'Calle 3 #789', true)
      ON CONFLICT (email) DO NOTHING
    `, [passwordHash]);
    console.log('✓ Usuarios creados');

    // Insertar menús de ejemplo
    await db.query(`
      INSERT INTO menus (nombre, descripcion, precio, categoria, disponible)
      VALUES 
        ('Hamburguesa Clásica', 'Hamburguesa con carne, lechuga, tomate y queso', 8.50, 'Hamburguesas', true),
        ('Pizza Margherita', 'Pizza con salsa de tomate, mozzarella y albahaca', 12.00, 'Pizzas', true),
        ('Tacos al Pastor', 'Orden de 3 tacos al pastor con piña y cilantro', 6.00, 'Tacos', true),
        ('Ensalada César', 'Lechuga romana, aderezo césar, crutones y parmesano', 7.50, 'Ensaladas', true),
        ('Refresco', 'Bebida fría de 500ml', 2.00, 'Bebidas', true),
        ('Papas Fritas', 'Papas fritas crujientes', 3.50, 'Acompañamientos', true)
      ON CONFLICT DO NOTHING
    `);
    console.log('✓ Menús creados');

    // Insertar pedidos de ejemplo
    const clienteResult = await db.query(`
      SELECT id FROM usuarios WHERE rol = 'cliente' LIMIT 1
    `);
    
    const repartidorResult = await db.query(`
      SELECT id FROM usuarios WHERE rol = 'repartidor' LIMIT 1
    `);

    if (clienteResult.rows.length > 0 && repartidorResult.rows.length > 0) {
      const clienteId = clienteResult.rows[0].id;
      const repartidorId = repartidorResult.rows[0].id;

      await db.query(`
        INSERT INTO pedidos (
          cliente_id, 
          repartidor_id, 
          direccion_entrega, 
          productos, 
          total, 
          estado, 
          notas,
          telefono_cliente,
          metodo_pago,
          fecha_asignacion
        )
        VALUES 
          (
            $1, 
            $2, 
            'Calle Principal 123, Col. Centro', 
            '[{"id": 1, "nombre": "Hamburguesa Clásica", "cantidad": 2, "precio": 8.50}, {"id": 5, "nombre": "Refresco", "cantidad": 2, "precio": 2.00}]'::jsonb, 
            21.00, 
            'pendiente', 
            'Sin cebolla, por favor',
            '1234567893',
            'efectivo',
            CURRENT_TIMESTAMP
          ),
          (
            $1, 
            $2, 
            'Avenida Reforma 456, Col. Juárez', 
            '[{"id": 2, "nombre": "Pizza Margherita", "cantidad": 1, "precio": 12.00}]'::jsonb, 
            12.00, 
            'en_proceso', 
            NULL,
            '1234567893',
            'tarjeta',
            CURRENT_TIMESTAMP
          )
      `, [clienteId, repartidorId]);
      console.log('✓ Pedidos de ejemplo creados');
    }

    console.log('Seed completado exitosamente!');
    process.exit(0);
  } catch (error) {
    console.error('Error durante el seed:', error);
    process.exit(1);
  }
};

seedData();
