# Guía de Pruebas API - Sistema Repartidores

Esta guía proporciona ejemplos de cómo probar la API utilizando cURL o cualquier cliente HTTP (como Postman, Insomnia, etc.).

## Configuración Inicial

Asegúrate de que el servidor esté corriendo en `http://localhost:5000`

## 1. Autenticación

### Registrar un Administrador

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin Principal",
    "email": "admin@juvyexpress.com",
    "password": "admin123",
    "role": "admin",
    "phoneNumber": "1234567890"
  }'
```

### Registrar un Repartidor

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez",
    "email": "juan@juvyexpress.com",
    "password": "repartidor123",
    "role": "repartidor",
    "phoneNumber": "9876543210"
  }'
```

### Iniciar Sesión

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@juvyexpress.com",
    "password": "admin123"
  }'
```

**Respuesta:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "name": "Admin Principal",
    "email": "admin@juvyexpress.com",
    "role": "admin"
  }
}
```

**Guarda el token para usarlo en las siguientes peticiones.**

## 2. Gestión de Zonas (Admin)

### Crear Zona

```bash
curl -X POST http://localhost:5000/api/admin/zones \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -d '{
    "name": "Zona Norte",
    "description": "Zona norte de la ciudad",
    "sectors": [
      {
        "name": "Sector A",
        "baseDeliveryFee": 5.00
      },
      {
        "name": "Sector B",
        "baseDeliveryFee": 7.50
      }
    ]
  }'
```

### Listar Zonas

```bash
curl -X GET http://localhost:5000/api/admin/zones \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

## 3. Gestión de Establecimientos (Admin)

### Crear Establecimiento

```bash
curl -X POST http://localhost:5000/api/admin/establishments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -d '{
    "name": "Restaurante El Buen Sabor",
    "category": "restaurant",
    "address": "Calle Principal 123",
    "phone": "5551234567",
    "zone": "ZONE_ID_AQUI",
    "sector": "Sector A"
  }'
```

### Listar Establecimientos

```bash
curl -X GET http://localhost:5000/api/admin/establishments \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

## 4. Gestión de Repartidores (Admin)

### Listar Repartidores

```bash
curl -X GET http://localhost:5000/api/admin/repartidores \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

### Actualizar Repartidor

```bash
curl -X PUT http://localhost:5000/api/admin/repartidores/REPARTIDOR_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -d '{
    "percentage": 75,
    "schedule": {
      "startTime": "09:00",
      "endTime": "18:00",
      "days": ["lunes", "martes", "miércoles", "jueves", "viernes"]
    }
  }'
```

## 5. Gestión de Pedidos

### Crear Pedido (Admin)

```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_ADMIN" \
  -d '{
    "customer": {
      "name": "María García",
      "phone": "5559876543",
      "address": "Avenida Central 456",
      "zone": "ZONE_ID_AQUI",
      "sector": "Sector A"
    },
    "establishment": "ESTABLISHMENT_ID_AQUI",
    "subtotal": 25.00,
    "notes": "Sin cebolla, por favor"
  }'
```

### Asignar Pedido a Repartidor (Admin)

```bash
curl -X POST http://localhost:5000/api/orders/assign \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_ADMIN" \
  -d '{
    "orderId": "ORDER_ID_AQUI",
    "repartidorId": "REPARTIDOR_ID_AQUI"
  }'
```

### Listar Pedidos

```bash
# Como Admin (todos los pedidos)
curl -X GET http://localhost:5000/api/orders \
  -H "Authorization: Bearer TU_TOKEN_ADMIN"

# Como Repartidor (solo sus pedidos)
curl -X GET http://localhost:5000/api/orders \
  -H "Authorization: Bearer TU_TOKEN_REPARTIDOR"
```

## 6. Acciones del Repartidor

### Activar/Desactivar Disponibilidad

```bash
curl -X POST http://localhost:5000/api/repartidor/availability \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_REPARTIDOR" \
  -d '{
    "isAvailable": true
  }'
```

### Aceptar Pedido

```bash
curl -X POST http://localhost:5000/api/orders/ORDER_ID/accept \
  -H "Authorization: Bearer TU_TOKEN_REPARTIDOR"
```

### Rechazar Pedido

```bash
curl -X POST http://localhost:5000/api/orders/ORDER_ID/reject \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_REPARTIDOR" \
  -d '{
    "reason": "No puedo llegar a esa zona en este momento debido al tráfico pesado"
  }'
```

### Marcar como En Tránsito

```bash
curl -X POST http://localhost:5000/api/orders/ORDER_ID/in-transit \
  -H "Authorization: Bearer TU_TOKEN_REPARTIDOR"
```

### Marcar como Entregado

```bash
curl -X POST http://localhost:5000/api/orders/ORDER_ID/deliver \
  -H "Authorization: Bearer TU_TOKEN_REPARTIDOR"
```

### Ver Ganancias

```bash
# Diarias
curl -X GET "http://localhost:5000/api/repartidor/earnings?period=daily" \
  -H "Authorization: Bearer TU_TOKEN_REPARTIDOR"

# Semanales
curl -X GET "http://localhost:5000/api/repartidor/earnings?period=weekly" \
  -H "Authorization: Bearer TU_TOKEN_REPARTIDOR"

# Mensuales
curl -X GET "http://localhost:5000/api/repartidor/earnings?period=monthly" \
  -H "Authorization: Bearer TU_TOKEN_REPARTIDOR"
```

### Ver Multas

```bash
curl -X GET http://localhost:5000/api/repartidor/fines \
  -H "Authorization: Bearer TU_TOKEN_REPARTIDOR"
```

## 7. Gestión de Multas (Admin)

### Crear Multa

```bash
curl -X POST http://localhost:5000/api/admin/fines \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_ADMIN" \
  -d '{
    "repartidorId": "REPARTIDOR_ID_AQUI",
    "type": "delay",
    "amount": 10.00,
    "description": "Entrega con más de 30 minutos de retraso"
  }'
```

### Listar Multas

```bash
curl -X GET http://localhost:5000/api/admin/fines \
  -H "Authorization: Bearer TU_TOKEN_ADMIN"
```

### Actualizar Estado de Multa

```bash
curl -X PUT http://localhost:5000/api/admin/fines/FINE_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_ADMIN" \
  -d '{
    "status": "paid"
  }'
```

## 8. Promociones (Admin)

### Crear Promoción

```bash
curl -X POST http://localhost:5000/api/admin/promotions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_ADMIN" \
  -d '{
    "name": "Envío Gratis Viernes",
    "description": "Envío gratis todos los viernes",
    "type": "free_delivery",
    "value": 0,
    "establishment": "ESTABLISHMENT_ID_AQUI",
    "minOrderAmount": 20.00,
    "startDate": "2024-01-01",
    "endDate": "2024-12-31"
  }'
```

### Listar Promociones

```bash
curl -X GET http://localhost:5000/api/admin/promotions \
  -H "Authorization: Bearer TU_TOKEN_ADMIN"
```

## 9. Reportes (Admin)

### Obtener Reportes

```bash
# Mensuales
curl -X GET "http://localhost:5000/api/admin/reports?period=monthly" \
  -H "Authorization: Bearer TU_TOKEN_ADMIN"

# Por repartidor específico
curl -X GET "http://localhost:5000/api/admin/reports?period=monthly&repartidorId=REPARTIDOR_ID" \
  -H "Authorization: Bearer TU_TOKEN_ADMIN"
```

## 10. Notificaciones

### Ver Notificaciones

```bash
curl -X GET http://localhost:5000/api/notifications \
  -H "Authorization: Bearer TU_TOKEN"
```

### Marcar Notificación como Leída

```bash
curl -X PUT http://localhost:5000/api/notifications/NOTIFICATION_ID/read \
  -H "Authorization: Bearer TU_TOKEN"
```

### Marcar Todas como Leídas

```bash
curl -X PUT http://localhost:5000/api/notifications/read-all \
  -H "Authorization: Bearer TU_TOKEN"
```

## 11. Chat

### Enviar Mensaje

```bash
curl -X POST http://localhost:5000/api/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN" \
  -d '{
    "receiverId": "USER_ID_DESTINO",
    "orderId": "ORDER_ID_AQUI",
    "message": "Hola, necesito ayuda con este pedido"
  }'
```

### Ver Conversación

```bash
curl -X GET "http://localhost:5000/api/messages?userId=USER_ID&orderId=ORDER_ID" \
  -H "Authorization: Bearer TU_TOKEN"
```

## Health Check

Verificar que el servidor esté funcionando:

```bash
curl http://localhost:5000/api/health
```

## Notas Importantes

1. **Reemplaza `TU_TOKEN_AQUI`** con el token JWT real obtenido al iniciar sesión
2. **Reemplaza los IDs** (`ZONE_ID_AQUI`, `ORDER_ID_AQUI`, etc.) con los IDs reales de tus recursos
3. Las respuestas de error incluirán un campo `error` con el mensaje descriptivo
4. Los tokens JWT expiran después de 7 días
5. Las fechas deben estar en formato ISO 8601 (YYYY-MM-DD)

## Códigos de Estado HTTP

- `200` - Éxito
- `201` - Recurso creado exitosamente
- `400` - Error en la petición (datos inválidos)
- `401` - No autenticado (token faltante o inválido)
- `403` - No autorizado (permisos insuficientes)
- `404` - Recurso no encontrado
- `500` - Error interno del servidor
