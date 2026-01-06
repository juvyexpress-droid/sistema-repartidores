# Guía de Inicio Rápido

Esta guía te ayudará a poner en marcha el sistema en menos de 10 minutos.

## ⚡ Inicio Rápido

### Prerrequisitos Mínimos
- Node.js 16+
- PostgreSQL 12+

### 1️⃣ Configurar Base de Datos (2 minutos)

```bash
# Crear base de datos
createdb sistema_repartidores

# O si prefieres usar psql:
psql -U postgres -c "CREATE DATABASE sistema_repartidores;"
```

### 2️⃣ Configurar Backend (3 minutos)

```bash
# Navegar al directorio backend
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
```

**Editar `.env`** con tus credenciales de PostgreSQL:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sistema_repartidores
DB_USER=postgres
DB_PASSWORD=tu_password
JWT_SECRET=un_secreto_muy_seguro_123456
```

```bash
# Crear tablas
npm run migrate

# Cargar datos de prueba
npm run seed

# Iniciar servidor
npm run dev
```

✅ Backend corriendo en: `http://localhost:3000`

### 3️⃣ Configurar Frontend (3 minutos)

Abre una **nueva terminal**:

```bash
# Navegar al directorio frontend
cd frontend

# Instalar dependencias
npm install

# Iniciar aplicación
npm run dev
```

✅ Frontend corriendo en: `http://localhost:3001`

### 4️⃣ Probar el Sistema (2 minutos)

1. Abre tu navegador en `http://localhost:3001`
2. Inicia sesión con:
   - **Admin:** admin@sistema.com / password123
   - **Repartidor:** juan@repartidor.com / password123

## 🎯 ¿Qué puedo hacer ahora?

### Como Administrador
- ✅ Ver dashboard con estadísticas
- ✅ Gestionar menús (crear, editar, eliminar productos)
- ✅ Gestionar usuarios (repartidores y clientes)
- ✅ Ver todos los pedidos
- ✅ Ver reportes detallados

### Como Repartidor
- ✅ Ver pedidos asignados
- ✅ Actualizar estado de pedidos
- ✅ Ver detalles de cada pedido

### Probar API con cURL

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sistema.com","password":"password123"}'

# Obtener menús (público)
curl http://localhost:3000/api/menus

# Crear pedido vía webhook (simular n8n)
curl -X POST http://localhost:3000/api/pedidos/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "direccion_entrega": "Calle Test 123",
    "productos": [{"id":1,"nombre":"Hamburguesa","cantidad":2,"precio":8.50}],
    "total": 17.00,
    "telefono_cliente": "5551234567",
    "cliente_nombre": "Cliente Test",
    "metodo_pago": "efectivo"
  }'
```

## 🔧 Solución de Problemas Comunes

### Error: "Cannot connect to database"
- Verifica que PostgreSQL esté corriendo: `pg_isready`
- Verifica las credenciales en `.env`
- Verifica que la base de datos exista: `psql -l | grep sistema_repartidores`

### Error: "Port 3000 already in use"
- Cambia el puerto en backend/.env: `PORT=3001`
- O mata el proceso: `lsof -ti:3000 | xargs kill`

### Error: "Module not found"
- Re-instala dependencias: `rm -rf node_modules && npm install`

### Frontend no se conecta al backend
- Verifica que el backend esté corriendo en el puerto correcto
- Revisa la configuración en `frontend/.env`

## 📱 Próximos Pasos

1. **Integrar con ManyChat**: Lee `docs/INTEGRATION.md`
2. **Configurar n8n**: Sigue la guía en `docs/INTEGRATION.md`
3. **Personalizar**: Modifica colores, logos, y textos según tu marca
4. **Desplegar**: Sigue la sección de despliegue en `README.md`

## 📚 Documentación Adicional

- **README.md**: Documentación completa del proyecto
- **docs/API.md**: Referencia completa de la API
- **docs/INTEGRATION.md**: Guía de integración con ManyChat y n8n

## 💡 Tips

- Los datos de prueba incluyen menús y pedidos de ejemplo
- Puedes resetear la base de datos ejecutando `migrate` y `seed` nuevamente
- Usa Postman o cURL para probar la API directamente
- El sistema asigna repartidores automáticamente al crear pedidos

## 🆘 ¿Necesitas Ayuda?

- Revisa los logs del servidor en la terminal
- Consulta la documentación de la API
- Abre un issue en GitHub

¡Listo! Ahora tienes un sistema completo de gestión de pedidos funcionando. 🎉
