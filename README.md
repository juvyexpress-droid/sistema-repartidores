# Sistema de Gestión de Pedidos y Repartidores

Sistema completo para la gestión de pedidos desde WhatsApp hasta la entrega, con paneles para administradores y repartidores.

## 📋 Características

### Para el Cliente (vía WhatsApp)
- Interacción mediante ManyChat
- Selección de productos del menú
- Proporcionar datos de entrega
- Confirmación de pedidos

### Para Repartidores
- Login con autenticación JWT
- Ver pedidos asignados
- Actualizar estados: Pendiente → En proceso → Entregado
- Información detallada de cada pedido

### Para Administradores
- Gestión completa de menús (CRUD)
- Gestión de usuarios (repartidores y clientes)
- Visualización de todos los pedidos
- Reportes y estadísticas
- Asignación automática de repartidores

## 🚀 Tecnologías

### Backend
- Node.js + Express
- PostgreSQL
- JWT para autenticación
- bcryptjs para encriptación

### Frontend
- React.js con Vite
- React Router para navegación
- Tailwind CSS para estilos
- Axios para peticiones HTTP

### Integraciones
- ManyChat (diseño de flujos WhatsApp)
- n8n (automatización de webhooks)

## 📦 Estructura del Proyecto

```
sistema-repartidores/
├── backend/
│   ├── config/          # Configuración de BD
│   ├── controllers/     # Lógica de negocio
│   ├── middleware/      # Autenticación y permisos
│   ├── models/          # Modelos de datos
│   ├── routes/          # Rutas de la API
│   ├── scripts/         # Migración y seed
│   └── server.js        # Punto de entrada
├── frontend/
│   ├── src/
│   │   ├── components/  # Componentes reutilizables
│   │   ├── context/     # Context API
│   │   ├── pages/       # Páginas de la aplicación
│   │   ├── services/    # Servicios API
│   │   └── App.jsx      # Componente principal
│   └── package.json
└── docs/
    └── README.md
```

## 🛠️ Instalación

### Requisitos Previos
- Node.js 16+ 
- PostgreSQL 12+
- npm o yarn

### 1. Configurar Base de Datos

```bash
# Crear base de datos
createdb sistema_repartidores

# O usando psql
psql -U postgres
CREATE DATABASE sistema_repartidores;
\q
```

### 2. Backend

```bash
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Ejecutar migración
npm run migrate

# Ejecutar seed (datos de prueba)
npm run seed

# Iniciar servidor
npm start
# O en modo desarrollo:
npm run dev
```

El backend estará disponible en `http://localhost:3000`

### 3. Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env si es necesario

# Iniciar aplicación
npm run dev
```

El frontend estará disponible en `http://localhost:3001`

## 📚 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `GET /api/auth/profile` - Obtener perfil (requiere auth)

### Pedidos
- `GET /api/pedidos` - Listar pedidos (requiere auth)
- `GET /api/pedidos/:id` - Obtener pedido (requiere auth)
- `POST /api/pedidos` - Crear pedido (requiere auth)
- `POST /api/pedidos/webhook` - Webhook para n8n (público)
- `PUT /api/pedidos/:id/estado` - Actualizar estado (requiere auth)
- `PUT /api/pedidos/:id` - Actualizar pedido (admin)
- `DELETE /api/pedidos/:id` - Eliminar pedido (admin)
- `GET /api/pedidos/estadisticas` - Obtener estadísticas (admin)

### Menús
- `GET /api/menus` - Listar menús (público)
- `GET /api/menus/categorias` - Listar categorías (público)
- `GET /api/menus/:id` - Obtener menú (público)
- `POST /api/menus` - Crear menú (admin)
- `PUT /api/menus/:id` - Actualizar menú (admin)
- `DELETE /api/menus/:id` - Eliminar menú (admin)

### Usuarios
- `GET /api/usuarios` - Listar usuarios (admin)
- `GET /api/usuarios/:id` - Obtener usuario (admin)
- `POST /api/usuarios` - Crear usuario (admin)
- `PUT /api/usuarios/:id` - Actualizar usuario (admin)
- `DELETE /api/usuarios/:id` - Eliminar usuario (admin)

## 👥 Usuarios de Prueba

Después de ejecutar el seed, puedes usar estos usuarios:

### Administrador
- Email: `admin@sistema.com`
- Contraseña: `password123`

### Repartidor
- Email: `juan@repartidor.com`
- Contraseña: `password123`

## 🔄 Integración con n8n y ManyChat

### Configuración de n8n

1. Crear un workflow en n8n
2. Agregar trigger de ManyChat
3. Procesar datos del cliente
4. Hacer POST a `/api/pedidos/webhook` con:

```json
{
  "direccion_entrega": "Calle Principal 123",
  "productos": [
    {
      "id": 1,
      "nombre": "Hamburguesa",
      "cantidad": 2,
      "precio": 8.50
    }
  ],
  "total": 17.00,
  "telefono_cliente": "1234567890",
  "cliente_nombre": "Juan Pérez",
  "notas": "Sin cebolla",
  "metodo_pago": "efectivo"
}
```

### Configuración de ManyChat

1. Crear flujo de conversación
2. Mostrar menú disponible (consultar `/api/menus`)
3. Recopilar selección de productos
4. Recopilar datos de entrega
5. Enviar a n8n para procesamiento

## 🎨 Funcionalidades de la Interfaz

### Panel de Login
Permite a usuarios autenticarse con email y contraseña.

### Panel Repartidor
- Lista de pedidos asignados
- Información detallada (dirección, productos, total)
- Botones para actualizar estado del pedido

### Panel Administrador
- Dashboard con estadísticas
- Gestión de pedidos, menús y usuarios
- Reportes detallados

## 🔐 Seguridad

- Contraseñas encriptadas con bcryptjs
- Autenticación mediante JWT
- Middleware de autorización por roles
- Validación de datos en backend
- CORS configurado

## 📊 Base de Datos

### Tabla: usuarios
- Almacena clientes, repartidores y administradores
- Roles: `cliente`, `repartidor`, `admin`
- Contraseñas encriptadas

### Tabla: menus
- Productos disponibles
- Precios y categorías
- Estado de disponibilidad

### Tabla: pedidos
- Información completa del pedido
- Relación con cliente y repartidor
- Estados: `pendiente`, `en_proceso`, `entregado`, `cancelado`
- Productos en formato JSON

## 🚀 Despliegue

### Backend (Heroku/Railway/Render)

```bash
# Configurar variables de entorno en la plataforma
DB_HOST=...
DB_PORT=5432
DB_NAME=...
DB_USER=...
DB_PASSWORD=...
JWT_SECRET=...
PORT=3000
```

### Frontend (Vercel/Netlify)

```bash
# Configurar variable de entorno
VITE_API_URL=https://tu-api.com/api
```

## 📝 Flujo General del Sistema

1. **Cliente en WhatsApp** → Interactúa con ManyChat
2. **ManyChat** → Cliente selecciona productos y confirma
3. **n8n** → Procesa datos y envía webhook al backend
4. **Backend** → Registra pedido y asigna repartidor automáticamente
5. **Repartidor** → Ve pedido en su panel y actualiza estados
6. **Admin** → Gestiona todo desde panel administrativo

## 🤝 Contribución

Para contribuir al proyecto:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la Licencia ISC.
