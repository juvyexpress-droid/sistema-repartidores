# Guía de Integración con n8n y ManyChat

## Visión General

Este documento explica cómo integrar el sistema con ManyChat y n8n para recibir pedidos desde WhatsApp.

## Arquitectura del Flujo

```
Cliente WhatsApp → ManyChat → n8n → Backend API → Base de Datos
                                        ↓
                                  Asignación Automática
                                        ↓
                                   Repartidor
```

## 1. Configuración de ManyChat

### Paso 1: Crear Flujo de Conversación

1. Ir a ManyChat y crear un nuevo flujo
2. Configurar mensaje de bienvenida
3. Agregar botones para navegar el menú

### Paso 2: Mostrar Menú

Consultar la API del backend para obtener menús disponibles:

**Endpoint:** `GET https://tu-api.com/api/menus?disponible=true`

Ejemplo de respuesta:
```json
[
  {
    "id": 1,
    "nombre": "Hamburguesa Clásica",
    "descripcion": "Deliciosa hamburguesa con todos los ingredientes",
    "precio": 8.50,
    "categoria": "Hamburguesas"
  }
]
```

### Paso 3: Recopilar Información del Pedido

1. **Selección de productos**: Usar botones o listas
2. **Cantidad**: Preguntar cantidad de cada producto
3. **Dirección de entrega**: Campo de texto libre
4. **Notas especiales**: Campo opcional
5. **Método de pago**: Botones (Efectivo/Tarjeta)

### Paso 4: Confirmar Pedido

Mostrar resumen del pedido antes de enviar:
```
📦 Tu Pedido:
- 2x Hamburguesa Clásica ($8.50 c/u)
- 1x Refresco ($2.00)

💰 Total: $19.00

📍 Dirección: Calle Principal 123

¿Confirmar pedido?
[Sí] [No, editar]
```

### Paso 5: Enviar a n8n

Configurar webhook de ManyChat para enviar datos a n8n:

**URL del Webhook n8n:** `https://tu-n8n.com/webhook/pedidos`

**Datos a enviar:**
```json
{
  "cliente": {
    "nombre": "{{user.first_name}} {{user.last_name}}",
    "telefono": "{{user.phone}}"
  },
  "productos": [
    {
      "id": 1,
      "nombre": "Hamburguesa Clásica",
      "cantidad": 2,
      "precio": 8.50
    },
    {
      "id": 5,
      "nombre": "Refresco",
      "cantidad": 1,
      "precio": 2.00
    }
  ],
  "direccion": "{{custom_field.direccion}}",
  "notas": "{{custom_field.notas}}",
  "metodo_pago": "{{custom_field.metodo_pago}}"
}
```

## 2. Configuración de n8n

### Paso 1: Crear Workflow

1. Abrir n8n
2. Crear nuevo workflow
3. Nombre: "Procesar Pedidos WhatsApp"

### Paso 2: Agregar Nodos

#### Nodo 1: Webhook Trigger

```json
{
  "method": "POST",
  "path": "pedidos",
  "responseMode": "responseNode"
}
```

#### Nodo 2: Function - Procesar Datos

```javascript
// Calcular total
let total = 0;
const productos = items[0].json.productos;

productos.forEach(producto => {
  total += producto.precio * producto.cantidad;
});

// Preparar payload para API
const payload = {
  cliente_nombre: items[0].json.cliente.nombre,
  telefono_cliente: items[0].json.cliente.telefono,
  direccion_entrega: items[0].json.direccion,
  productos: productos,
  total: total,
  notas: items[0].json.notas || '',
  metodo_pago: items[0].json.metodo_pago || 'efectivo'
};

return [{json: payload}];
```

#### Nodo 3: HTTP Request - Enviar a API

```json
{
  "method": "POST",
  "url": "https://tu-api.com/api/pedidos/webhook",
  "authentication": "none",
  "sendBody": true,
  "bodyContentType": "json",
  "body": "={{$json}}"
}
```

#### Nodo 4: IF - Validar Respuesta

```json
{
  "conditions": {
    "boolean": [
      {
        "value1": "={{$statusCode}}",
        "operation": "equal",
        "value2": 201
      }
    ]
  }
}
```

#### Nodo 5a: HTTP Request - Notificar Éxito (ManyChat)

Enviar mensaje de confirmación al cliente:

```json
{
  "method": "POST",
  "url": "https://api.manychat.com/fb/sending/sendContent",
  "headers": {
    "Authorization": "Bearer TU_TOKEN_MANYCHAT"
  },
  "body": {
    "subscriber_id": "={{$json.cliente.phone}}",
    "data": {
      "version": "v2",
      "content": {
        "messages": [
          {
            "type": "text",
            "text": "✅ ¡Pedido confirmado! Tu pedido #{{$json.pedido.id}} está en camino. Total: ${{$json.pedido.total}}"
          }
        ]
      }
    }
  }
}
```

#### Nodo 5b: HTTP Request - Notificar Error

Notificar al cliente en caso de error.

### Paso 3: Activar Workflow

1. Guardar el workflow
2. Activar con el switch en la parte superior
3. Copiar la URL del webhook

## 3. Webhook Público del Backend

El backend tiene un endpoint público específico para recibir pedidos desde n8n:

**Endpoint:** `POST /api/pedidos/webhook`

### Formato del Request

```json
{
  "direccion_entrega": "Calle Principal 123, Col. Centro",
  "productos": [
    {
      "id": 1,
      "nombre": "Hamburguesa Clásica",
      "cantidad": 2,
      "precio": 8.50
    }
  ],
  "total": 17.00,
  "telefono_cliente": "5551234567",
  "cliente_nombre": "Juan Pérez",
  "notas": "Sin cebolla, por favor",
  "metodo_pago": "efectivo"
}
```

### Respuesta Exitosa

```json
{
  "mensaje": "Pedido creado exitosamente",
  "pedido": {
    "id": 15,
    "cliente_id": 8,
    "repartidor_id": 2,
    "direccion_entrega": "Calle Principal 123, Col. Centro",
    "productos": [...],
    "total": 17.00,
    "estado": "pendiente",
    "telefono_cliente": "5551234567",
    "fecha_pedido": "2024-01-15T14:30:00.000Z",
    "repartidor_nombre": "Juan Pérez"
  }
}
```

### Características del Webhook

1. **No requiere autenticación** - Diseñado para recibir pedidos externos
2. **Crea clientes automáticamente** - Si el teléfono no existe, crea un nuevo cliente
3. **Asigna repartidor automáticamente** - Selecciona un repartidor disponible al azar
4. **Valida datos** - Verifica que los campos requeridos estén presentes

## 4. Asignación Automática de Repartidores

El sistema asigna repartidores automáticamente usando el siguiente algoritmo:

```sql
SELECT id, nombre 
FROM usuarios 
WHERE rol = 'repartidor' 
  AND activo = true 
ORDER BY RANDOM() 
LIMIT 1
```

Esto selecciona un repartidor activo al azar. En el futuro se puede mejorar para:
- Considerar ubicación del repartidor
- Distribuir carga de trabajo equitativamente
- Verificar disponibilidad en tiempo real

## 5. Flujo Completo de Ejemplo

### Paso a Paso

1. **Cliente en WhatsApp**: "Hola, quiero hacer un pedido"
2. **ManyChat responde**: "¡Bienvenido! ¿Qué te gustaría ordenar?"
3. **Cliente selecciona**: 2x Hamburguesa Clásica, 1x Refresco
4. **ManyChat pregunta**: "¿Dirección de entrega?"
5. **Cliente proporciona**: "Calle Principal 123"
6. **ManyChat confirma**: Muestra resumen del pedido
7. **Cliente confirma**: Presiona "Confirmar"
8. **ManyChat → n8n**: Envía webhook con datos
9. **n8n procesa**: Calcula total y formatea datos
10. **n8n → Backend**: POST /api/pedidos/webhook
11. **Backend**:
    - Crea/encuentra cliente por teléfono
    - Asigna repartidor automáticamente
    - Guarda pedido en BD
    - Retorna confirmación
12. **n8n → ManyChat**: Envía mensaje de confirmación
13. **Cliente recibe**: "✅ Pedido #15 confirmado"
14. **Repartidor ve**: Pedido aparece en su panel

## 6. Manejo de Errores

### Errores Comunes

#### Error 400: Datos inválidos
```json
{
  "error": "Dirección, productos y total son requeridos"
}
```

**Solución**: Verificar que todos los campos requeridos estén presentes.

#### Error 500: Error del servidor
```json
{
  "error": "Error al crear pedido"
}
```

**Solución**: Verificar logs del servidor, problemas de BD.

### Reintentos en n8n

Configurar reintentos automáticos en el nodo HTTP Request:
- Máximo 3 reintentos
- Espera 2 segundos entre reintentos
- Solo reintentar en errores 5xx

## 7. Testing

### Probar con Postman

```bash
POST http://localhost:3000/api/pedidos/webhook
Content-Type: application/json

{
  "direccion_entrega": "Dirección de prueba 123",
  "productos": [
    {
      "id": 1,
      "nombre": "Test Product",
      "cantidad": 1,
      "precio": 10.00
    }
  ],
  "total": 10.00,
  "telefono_cliente": "5559999999",
  "cliente_nombre": "Cliente Test",
  "notas": "Pedido de prueba",
  "metodo_pago": "efectivo"
}
```

### Verificar en Base de Datos

```sql
-- Ver último pedido creado
SELECT * FROM pedidos ORDER BY id DESC LIMIT 1;

-- Ver cliente creado
SELECT * FROM usuarios WHERE telefono = '5559999999';
```

## 8. Monitoreo

### Logs en n8n
- Ver ejecuciones del workflow
- Revisar datos de entrada y salida
- Verificar errores

### Logs en Backend
```bash
# Ver logs del servidor
tail -f logs/server.log

# Filtrar errores
grep ERROR logs/server.log
```

## 9. Seguridad

### Recomendaciones

1. **Validar origen**: Verificar IP de n8n en producción
2. **Rate limiting**: Limitar requests por minuto
3. **Validación de datos**: Sanitizar inputs del usuario
4. **HTTPS**: Siempre usar conexiones seguras
5. **Secrets**: Guardar tokens en variables de entorno

## 10. Mejoras Futuras

- Notificaciones en tiempo real con WebSockets
- Tracking GPS del repartidor
- Estimación de tiempo de entrega
- Sistema de calificaciones
- Programa de lealtad
- Cupones y descuentos
- Múltiples métodos de pago
