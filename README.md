# Sistema de Gestión de Pedidos y Repartidores - Juvy Express

Sistema completo para la gestión de pedidos, repartidores, y administrador con paneles separados y controles avanzados.

## 🚀 Características Principales

### Panel de Repartidor (Juvy Repartidor)
- **Encabezado fijo** con estado del repartidor y horario asignado
- **Interruptor de disponibilidad** que solo opera dentro del horario configurado
- Sistema de aceptación/rechazo de pedidos con justificación obligatoria
- Visualización de ganancias calculadas según porcentaje asignado
- Historial personal de entregas completadas
- Auditoría personal con multas acumuladas y motivos
- Notificaciones en tiempo real
- Inhabilitación automática tras marcarse indisponible repetidamente

### Panel de Administrador (Juvy Administrador)
- **Gestión de pedidos**: Creación, asignación y seguimiento
- **Gestión de repartidores**: Actualización de porcentajes, horarios y estados
- **Gestión de zonas y sectores**: Configuración de tarifas de envío
- **Gestión de establecimientos**: Registro por categorías y sectores
- **Gestión de promociones**: Descuentos y envíos gratuitos
- **Sistema de multas**: Registro automático con notificaciones
- **Reportes avanzados**: Análisis de ingresos y rendimiento
- Reasignación automática de pedidos rechazados
- Control manual de disponibilidad de repartidores

### Funcionalidades Avanzadas
- ✅ Cálculo automático de tarifas según zona y sector
- ✅ Porcentajes de ganancia configurables por repartidor
- ✅ Sistema de notificaciones automáticas
- ✅ Auditoría detallada con clasificación de multas
- ✅ Historial completo de asignaciones y rechazos
- ✅ Chat directo entre administrador y repartidor
- ✅ Restricción de disponibilidad por horario
- ✅ Inhabilitación automática por indisponibilidad repetida

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js** con Express.js
- **MongoDB** con Mongoose
- **JWT** para autenticación
- **bcryptjs** para encriptación de contraseñas
- **Socket.io** para notificaciones en tiempo real

### Frontend
- **React** con Hooks
- **React Router** para navegación
- **Axios** para peticiones HTTP
- **Vite** para desarrollo y build
- CSS puro con diseño responsivo

## 📋 Requisitos Previos

- Node.js (v14 o superior)
- MongoDB (v4.4 o superior)
- npm o yarn

## 🔧 Instalación

### 1. Clonar el repositorio
```bash
git clone https://github.com/juvyexpress-droid/sistema-repartidores.git
cd sistema-repartidores
```

### 2. Configurar variables de entorno
Crea un archivo `.env` en la raíz del proyecto:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/sistema-repartidores
JWT_SECRET=tu-clave-secreta-muy-segura
NODE_ENV=development
```

### 3. Instalar dependencias del servidor
```bash
npm install
```

### 4. Instalar dependencias del cliente
```bash
cd client
npm install
cd ..
```

### 5. Iniciar MongoDB
```bash
# Linux/Mac
sudo systemctl start mongodb

# Windows (como servicio)
net start MongoDB
```

### 6. Iniciar el servidor backend
```bash
npm run dev
```
El servidor estará corriendo en `http://localhost:5000`

### 7. Iniciar el cliente frontend (en otra terminal)
```bash
cd client
npm run dev
```
El cliente estará corriendo en `http://localhost:3000`

## 👤 Uso del Sistema

### Registro e Inicio de Sesión

1. **Crear cuenta de administrador:**
   - Navega a `http://localhost:3000/login`
   - Haz clic en "¿No tienes cuenta? Regístrate"
   - Selecciona rol "Administrador"
   - Completa el registro

2. **Crear cuenta de repartidor:**
   - Igual que administrador pero selecciona rol "Repartidor"

### Flujo de Trabajo

#### Como Administrador:
1. **Configurar zonas y sectores** con tarifas de envío
2. **Registrar establecimientos** por zonas
3. **Configurar horarios y porcentajes** de repartidores
4. **Crear pedidos** y asignarlos a repartidores disponibles
5. **Monitorear entregas** en tiempo real
6. **Revisar reportes** de ingresos y rendimiento
7. **Gestionar multas** cuando sea necesario

#### Como Repartidor:
1. **Activar disponibilidad** (dentro del horario asignado)
2. **Recibir pedidos** asignados por el administrador
3. **Aceptar o rechazar** con justificación
4. **Actualizar estado** del pedido (en tránsito, entregado)
5. **Consultar ganancias** y porcentaje asignado
6. **Revisar historial** de entregas
7. **Ver auditoría** personal con multas

## 📊 Modelos de Datos

### Usuario (User)
- Información básica (nombre, email, contraseña)
- Rol (admin/repartidor)
- Horario asignado
- Porcentaje de ganancia
- Estadísticas de entregas y multas

### Pedido (Order)
- Información del cliente
- Productos y montos
- Repartidor asignado
- Estado del pedido
- Historial de asignaciones
- Cálculo de ganancias

### Zona (Zone)
- Nombre y descripción
- Sectores con tarifas específicas
- Estado activo/inactivo

### Establecimiento (Establishment)
- Información básica
- Categoría y ubicación
- Zona y sector
- Menú de productos

### Multa (Fine)
- Repartidor afectado
- Tipo y monto
- Descripción y estado
- Pedido relacionado

### Promoción (Promotion)
- Tipo de descuento
- Establecimiento o zona
- Vigencia y condiciones

### Notificación (Notification)
- Usuario destinatario
- Tipo y mensaje
- Estado de lectura

### Mensaje de Chat (ChatMessage)
- Emisor y receptor
- Mensaje y pedido relacionado

## 🔐 Seguridad

- Autenticación mediante JWT
- Contraseñas encriptadas con bcrypt
- Validación de roles en rutas protegidas
- Restricciones de horario para disponibilidad
- Sistema de auditoría integrado

## 🚧 Características Futuras

- [ ] Notificaciones push para móviles
- [ ] Exportación de reportes a PDF/Excel
- [ ] Geolocalización en tiempo real
- [ ] Sistema de calificaciones de clientes
- [ ] Integración con pasarelas de pago
- [ ] Panel de métricas con gráficos
- [ ] Aplicación móvil nativa
- [ ] Sistema de bonificaciones

## 📝 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `GET /api/auth/profile` - Obtener perfil
- `PUT /api/auth/profile` - Actualizar perfil

### Pedidos
- `POST /api/orders` - Crear pedido (Admin)
- `POST /api/orders/assign` - Asignar pedido (Admin)
- `POST /api/orders/:id/accept` - Aceptar pedido (Repartidor)
- `POST /api/orders/:id/reject` - Rechazar pedido (Repartidor)
- `POST /api/orders/:id/deliver` - Entregar pedido (Repartidor)
- `GET /api/orders` - Listar pedidos
- `GET /api/orders/history` - Historial (Repartidor)

### Repartidor
- `POST /api/repartidor/availability` - Cambiar disponibilidad
- `GET /api/repartidor/earnings` - Obtener ganancias
- `GET /api/repartidor/fines` - Obtener multas
- `GET /api/repartidor/available` - Listar disponibles

### Administrador
- `GET /api/admin/repartidores` - Listar repartidores
- `PUT /api/admin/repartidores/:id` - Actualizar repartidor
- `POST /api/admin/fines` - Crear multa
- `GET /api/admin/fines` - Listar multas
- `GET /api/admin/reports` - Obtener reportes

### Zonas
- `POST /api/admin/zones` - Crear zona
- `GET /api/admin/zones` - Listar zonas
- `PUT /api/admin/zones/:id` - Actualizar zona
- `DELETE /api/admin/zones/:id` - Eliminar zona

### Establecimientos
- `POST /api/admin/establishments` - Crear establecimiento
- `GET /api/admin/establishments` - Listar establecimientos
- `PUT /api/admin/establishments/:id` - Actualizar
- `DELETE /api/admin/establishments/:id` - Eliminar

### Promociones
- `POST /api/admin/promotions` - Crear promoción
- `GET /api/admin/promotions` - Listar promociones
- `PUT /api/admin/promotions/:id` - Actualizar
- `DELETE /api/admin/promotions/:id` - Eliminar

### Notificaciones
- `GET /api/notifications` - Listar notificaciones
- `PUT /api/notifications/:id/read` - Marcar como leída
- `PUT /api/notifications/read-all` - Marcar todas

### Chat
- `POST /api/messages` - Enviar mensaje
- `GET /api/messages` - Obtener conversación
- `POST /api/messages/read` - Marcar como leído

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia ISC.

## 📧 Contacto

Para preguntas o soporte, contacta al equipo de desarrollo.

---

**Juvy Express** - Sistema de Gestión de Repartidores © 2024
