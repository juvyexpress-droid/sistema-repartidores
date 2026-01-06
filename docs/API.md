# Documentación de la API

## Base URL
```
http://localhost:3000/api
```

## Autenticación

Todos los endpoints protegidos requieren un token JWT en el header:
```
Authorization: Bearer <token>
```

## Endpoints

### 1. Autenticación

#### POST /auth/login
Iniciar sesión de usuario.

**Request Body:**
```json
{
  "email": "admin@sistema.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 1,
    "nombre": "Admin Principal",
    "email": "admin@sistema.com",
    "rol": "admin"
  }
}
```

#### POST /auth/register
Registrar nuevo usuario.

**Request Body:**
```json
{
  "nombre": "Nuevo Usuario",
  "email": "nuevo@email.com",
  "password": "password123",
  "telefono": "1234567890",
  "direccion": "Calle 123",
  "rol": "cliente"
}
```

**Response:**
```json
{
  "mensaje": "Usuario registrado exitosamente",
  "usuario": {
    "id": 5,
    "nombre": "Nuevo Usuario",
    "email": "nuevo@email.com",
    "rol": "cliente"
  }
}
```

#### GET /auth/profile
Obtener perfil del usuario autenticado (requiere token).

**Response:**
```json
{
  "id": 1,
  "nombre": "Admin Principal",
  "email": "admin@sistema.com",
  "telefono": "1234567890",
  "rol": "admin",
  "direccion": "Dirección Admin",
  "activo": true,
  "fecha_creacion": "2024-01-01T00:00:00.000Z"
}
```

---

### 2. Pedidos

#### GET /pedidos
Listar pedidos (requiere autenticación).
- Repartidores solo ven sus pedidos asignados
- Admins ven todos los pedidos

**Query Parameters:**
- `estado`: Filtrar por estado (pendiente, en_proceso, entregado, cancelado)

**Response:**
```json
[
  {
    "id": 1,
    "cliente_id": 4,
    "repartidor_id": 2,
    "direccion_entrega": "Calle Principal 123",
    "productos": [
      {
        "id": 1,
        "nombre": "Hamburguesa Clásica",
        "cantidad": 2,
        "precio": 8.50
      }
    ],
    "total": 21.00,
    "estado": "pendiente",
    "notas": "Sin cebolla",
    "telefono_cliente": "1234567893",
    "fecha_pedido": "2024-01-01T12:00:00.000Z",
    "cliente_nombre": "Carlos López",
    "repartidor_nombre": "Juan Pérez"
  }
]
```

#### GET /pedidos/:id
Obtener detalles de un pedido (requiere autenticación).

**Response:**
```json
{
  "id": 1,
  "cliente_id": 4,
  "repartidor_id": 2,
  "direccion_entrega": "Calle Principal 123",
  "productos": [...],
  "total": 21.00,
  "estado": "pendiente",
  "notas": "Sin cebolla",
  "telefono_cliente": "1234567893",
  "cliente_nombre": "Carlos López",
  "cliente_telefono": "1234567893",
  "repartidor_nombre": "Juan Pérez",
  "repartidor_telefono": "1234567891",
  "fecha_pedido": "2024-01-01T12:00:00.000Z",
  "fecha_asignacion": "2024-01-01T12:05:00.000Z"
}
```

#### POST /pedidos
Crear un nuevo pedido (requiere autenticación).

**Request Body:**
```json
{
  "direccion_entrega": "Calle Nueva 456",
  "productos": [
    {
      "id": 2,
      "nombre": "Pizza Margherita",
      "cantidad": 1,
      "precio": 12.00
    }
  ],
  "total": 12.00,
  "telefono_cliente": "9876543210",
  "cliente_nombre": "Cliente Nuevo",
  "notas": "Tocar el timbre",
  "metodo_pago": "tarjeta"
}
```

**Response:**
```json
{
  "mensaje": "Pedido creado exitosamente",
  "pedido": {
    "id": 3,
    "cliente_id": 5,
    "repartidor_id": 2,
    "direccion_entrega": "Calle Nueva 456",
    "productos": [...],
    "total": 12.00,
    "estado": "pendiente",
    "fecha_pedido": "2024-01-01T13:00:00.000Z"
  }
}
```

#### POST /pedidos/webhook
Webhook público para n8n (no requiere autenticación).
Mismo formato que POST /pedidos.

#### PUT /pedidos/:id/estado
Actualizar estado de un pedido (requiere autenticación).
- Repartidores solo pueden actualizar sus propios pedidos

**Request Body:**
```json
{
  "estado": "en_proceso"
}
```

**Valores permitidos:** `pendiente`, `en_proceso`, `entregado`, `cancelado`

**Response:**
```json
{
  "mensaje": "Estado actualizado exitosamente",
  "pedido": {
    "id": 1,
    "estado": "en_proceso",
    "fecha_actualizacion": "2024-01-01T13:30:00.000Z"
  }
}
```

#### PUT /pedidos/:id
Actualizar pedido completo (requiere rol admin).

**Request Body:**
```json
{
  "repartidor_id": 3,
  "direccion_entrega": "Nueva dirección",
  "notas": "Nuevas notas"
}
```

#### DELETE /pedidos/:id
Eliminar pedido (requiere rol admin).

**Response:**
```json
{
  "mensaje": "Pedido eliminado exitosamente"
}
```

#### GET /pedidos/estadisticas
Obtener estadísticas de pedidos (requiere rol admin).

**Response:**
```json
{
  "total_pedidos": 150,
  "pedidos_entregados": 120,
  "pedidos_pendientes": 15,
  "pedidos_en_proceso": 15,
  "ingresos_totales": 15000.00,
  "ticket_promedio": 125.00
}
```

---

### 3. Menús

#### GET /menus
Listar todos los menús (público).

**Query Parameters:**
- `categoria`: Filtrar por categoría
- `disponible`: Filtrar por disponibilidad (true/false)

**Response:**
```json
[
  {
    "id": 1,
    "nombre": "Hamburguesa Clásica",
    "descripcion": "Hamburguesa con carne, lechuga, tomate y queso",
    "precio": 8.50,
    "categoria": "Hamburguesas",
    "disponible": true,
    "imagen_url": null,
    "fecha_creacion": "2024-01-01T00:00:00.000Z"
  }
]
```

#### GET /menus/categorias
Listar categorías disponibles (público).

**Response:**
```json
[
  "Hamburguesas",
  "Pizzas",
  "Tacos",
  "Ensaladas",
  "Bebidas"
]
```

#### GET /menus/:id
Obtener detalles de un menú (público).

#### POST /menus
Crear nuevo menú (requiere rol admin).

**Request Body:**
```json
{
  "nombre": "Burrito Especial",
  "descripcion": "Burrito con carne asada y guacamole",
  "precio": 10.50,
  "categoria": "Mexicana",
  "disponible": true,
  "imagen_url": "https://example.com/burrito.jpg"
}
```

#### PUT /menus/:id
Actualizar menú (requiere rol admin).

**Request Body:**
```json
{
  "precio": 11.00,
  "disponible": false
}
```

#### DELETE /menus/:id
Eliminar menú (requiere rol admin).

---

### 4. Usuarios

Todos los endpoints de usuarios requieren rol admin.

#### GET /usuarios
Listar usuarios.

**Query Parameters:**
- `rol`: Filtrar por rol (admin, repartidor, cliente)
- `activo`: Filtrar por estado (true/false)

**Response:**
```json
[
  {
    "id": 1,
    "nombre": "Admin Principal",
    "email": "admin@sistema.com",
    "telefono": "1234567890",
    "rol": "admin",
    "direccion": "Dirección Admin",
    "activo": true,
    "fecha_creacion": "2024-01-01T00:00:00.000Z"
  }
]
```

#### GET /usuarios/:id
Obtener detalles de un usuario.

#### POST /usuarios
Crear nuevo usuario.

**Request Body:**
```json
{
  "nombre": "Nuevo Repartidor",
  "email": "repartidor@email.com",
  "password": "password123",
  "telefono": "5555555555",
  "direccion": "Calle del Repartidor",
  "rol": "repartidor",
  "activo": true
}
```

#### PUT /usuarios/:id
Actualizar usuario.

**Request Body:**
```json
{
  "nombre": "Nombre Actualizado",
  "telefono": "9999999999",
  "activo": false
}
```

Si se incluye `password`, será encriptado automáticamente.

#### DELETE /usuarios/:id
Eliminar usuario.

---

## Códigos de Estado

- `200 OK`: Solicitud exitosa
- `201 Created`: Recurso creado exitosamente
- `400 Bad Request`: Datos inválidos
- `401 Unauthorized`: No autenticado
- `403 Forbidden`: Sin permisos
- `404 Not Found`: Recurso no encontrado
- `409 Conflict`: Conflicto (ej: email duplicado)
- `500 Internal Server Error`: Error del servidor

## Formato de Errores

```json
{
  "error": "Mensaje de error descriptivo"
}
```
