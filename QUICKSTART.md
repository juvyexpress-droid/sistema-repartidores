# Guía de Inicio Rápido - Sistema Repartidores

Esta guía te ayudará a tener el sistema funcionando en menos de 10 minutos.

## ⚡ Inicio Rápido (Linux/Mac)

### Opción 1: Script Automático

```bash
# Clonar repositorio
git clone https://github.com/juvyexpress-droid/sistema-repartidores.git
cd sistema-repartidores

# Ejecutar script de setup
chmod +x setup.sh
./setup.sh

# Configurar .env
cp .env.example .env
nano .env  # Edita las variables necesarias

# Iniciar MongoDB (si aún no está corriendo)
sudo systemctl start mongodb

# Terminal 1: Iniciar servidor backend
npm run dev

# Terminal 2: Iniciar cliente frontend
cd client && npm run dev
```

### Opción 2: Manual

```bash
# 1. Clonar e instalar
git clone https://github.com/juvyexpress-droid/sistema-repartidores.git
cd sistema-repartidores
npm install
cd client && npm install && cd ..

# 2. Configurar entorno
cp .env.example .env
# Edita .env con tus configuraciones

# 3. Iniciar MongoDB
sudo systemctl start mongodb

# 4. Iniciar backend (Terminal 1)
npm run dev

# 5. Iniciar frontend (Terminal 2)
cd client && npm run dev
```

## 🪟 Windows

```bash
# 1. Clonar e instalar
git clone https://github.com/juvyexpress-droid/sistema-repartidores.git
cd sistema-repartidores
npm install
cd client
npm install
cd ..

# 2. Configurar entorno
copy .env.example .env
notepad .env

# 3. Iniciar MongoDB
net start MongoDB

# 4. Iniciar backend (Terminal 1)
npm run dev

# 5. Iniciar frontend (Terminal 2)
cd client
npm run dev
```

## 🐳 Docker (Más Rápido)

```bash
# Clonar repositorio
git clone https://github.com/juvyexpress-droid/sistema-repartidores.git
cd sistema-repartidores

# Iniciar con Docker Compose
docker-compose up -d

# Ver logs
docker-compose logs -f
```

Accede en: http://localhost:5000

## 🎯 Primer Uso

### 1. Acceder a la Aplicación

Abre tu navegador en: http://localhost:3000

### 2. Crear Cuenta de Administrador

1. Haz clic en "¿No tienes cuenta? Regístrate"
2. Completa el formulario:
   - Nombre: Admin Principal
   - Email: admin@juvyexpress.com
   - Contraseña: (tu contraseña)
   - Rol: **Administrador**
3. Haz clic en "Registrarse"

### 3. Configurar el Sistema (Como Admin)

#### a) Crear Zonas
1. Ve a la pestaña "Zonas y Tarifas"
2. Completa el formulario:
   - Nombre: Zona Centro
   - Sector: Centro Norte
   - Tarifa: 5.00
3. Clic en "Crear Zona"

#### b) Registrar un Establecimiento
1. Ve a "Establecimientos"
2. Completa:
   - Nombre: Restaurante Demo
   - Categoría: Restaurant
   - Dirección: Calle Principal 123
   - Zona: Zona Centro
3. Clic en "Crear Establecimiento"

#### c) Configurar un Repartidor
1. **Primero, registra un repartidor**:
   - Cierra sesión
   - Regístrate con rol "Repartidor"
   - Email: repartidor@juvyexpress.com
   
2. **Vuelve a iniciar sesión como admin**
3. Ve a "Repartidores"
4. Configura el repartidor:
   - Porcentaje: 70%
   - Guarda los cambios

### 4. Crear un Pedido (Como Admin)

1. Ve a la pestaña "Pedidos"
2. Completa el formulario:
   - Cliente: Juan Pérez
   - Teléfono: 1234567890
   - Dirección: Avenida Norte 456
   - Zona: (selecciona la zona creada)
   - Subtotal: 25.00
3. Clic en "Crear Pedido"

### 5. Asignar Pedido a Repartidor

1. En la lista de pedidos, busca el pedido creado
2. En "Acciones", selecciona el repartidor del dropdown
3. El pedido se asignará automáticamente

### 6. Probar como Repartidor

1. Cierra sesión del admin
2. Inicia sesión como repartidor
3. Verás el encabezado con tu disponibilidad
4. Activa el interruptor de "Disponible" (solo funciona en horario)
5. En "Pedidos Activos" verás el pedido asignado
6. Opciones:
   - **Aceptar**: Acepta el pedido
   - **Rechazar**: Requiere justificación (mínimo 10 caracteres)
7. Una vez aceptado:
   - Marca como "En Tránsito"
   - Marca como "Entregado"
8. Revisa tus ganancias en la pestaña "Ganancias"

## 📊 Datos de Prueba

### Usuarios de Ejemplo

**Administrador:**
- Email: admin@juvyexpress.com
- Password: admin123

**Repartidor:**
- Email: repartidor@juvyexpress.com
- Password: repartidor123

### Crear Datos de Prueba con cURL

```bash
# 1. Registrar Admin
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin Principal",
    "email": "admin@juvyexpress.com",
    "password": "admin123",
    "role": "admin"
  }'

# 2. Registrar Repartidor
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez",
    "email": "repartidor@juvyexpress.com",
    "password": "repartidor123",
    "role": "repartidor"
  }'

# 3. Login como Admin (guarda el token)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@juvyexpress.com",
    "password": "admin123"
  }'

# Usa el token en las siguientes peticiones...
```

## 🔍 Verificar que Todo Funciona

### Health Check del Servidor

```bash
curl http://localhost:5000/api/health
```

Deberías ver:
```json
{
  "status": "OK",
  "message": "Sistema Repartidores API is running"
}
```

### Verificar MongoDB

```bash
# Conectar a MongoDB
mongosh

# Listar bases de datos
show dbs

# Usar la base de datos
use sistema-repartidores

# Listar colecciones
show collections

# Ver usuarios
db.users.find().pretty()
```

## 🐛 Solución de Problemas Comunes

### "Puerto 5000 ya en uso"

```bash
# Linux/Mac
lsof -ti:5000 | xargs kill -9

# Windows
netstat -ano | findstr :5000
taskkill /PID [PID] /F
```

### "MongoDB connection failed"

```bash
# Verificar que MongoDB esté corriendo
# Linux
sudo systemctl status mongod

# Windows
net start MongoDB

# Si no está instalado, instálalo:
# Linux (Ubuntu)
sudo apt install mongodb

# Mac
brew install mongodb-community

# Windows
# Descarga desde: https://www.mongodb.com/try/download/community
```

### "Cannot find module"

```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install

cd client
rm -rf node_modules package-lock.json
npm install
```

### Frontend no carga

```bash
# Verificar que el backend esté corriendo
curl http://localhost:5000/api/health

# Limpiar caché del navegador
# Chrome/Edge: Ctrl+Shift+Delete
# Firefox: Ctrl+Shift+Del

# Reconstruir cliente
cd client
npm run build
```

## 📱 Siguientes Pasos

1. **Explora las funcionalidades:**
   - Crea múltiples zonas con diferentes tarifas
   - Registra varios repartidores
   - Prueba el sistema de multas
   - Revisa los reportes

2. **Personaliza el sistema:**
   - Modifica los estilos en `client/src/styles/App.css`
   - Ajusta los porcentajes por defecto
   - Añade campos personalizados a los modelos

3. **Lee la documentación completa:**
   - `README.md` - Documentación general
   - `API_TESTING.md` - Pruebas de API
   - `DEPLOYMENT.md` - Guía de despliegue

4. **Explora el código:**
   - Backend: `server/`
   - Frontend: `client/src/`
   - Modelos: `server/models/`

## 💡 Consejos

- **Usa dos navegadores diferentes** para probar admin y repartidor simultáneamente
- **Prueba en modo incógnito** para sesiones separadas
- **Revisa las notificaciones** después de cada acción
- **Consulta los logs** si algo no funciona como esperas:
  ```bash
  # Backend logs (en la terminal donde corre npm run dev)
  # Frontend logs (en la consola del navegador - F12)
  ```

## 🆘 ¿Necesitas Ayuda?

1. Revisa la [documentación completa](README.md)
2. Consulta los [ejemplos de API](API_TESTING.md)
3. Revisa los logs del servidor
4. Abre un issue en GitHub

## ✅ Lista de Verificación Rápida

- [ ] Node.js instalado (v14+)
- [ ] MongoDB instalado y corriendo
- [ ] Dependencias instaladas (`npm install`)
- [ ] Archivo `.env` configurado
- [ ] Backend corriendo en :5000
- [ ] Frontend corriendo en :3000
- [ ] Usuario admin creado
- [ ] Zona creada
- [ ] Repartidor registrado y configurado
- [ ] Pedido de prueba creado

¡Listo! Ya tienes el sistema funcionando. 🎉
