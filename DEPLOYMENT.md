# Guía de Despliegue - Sistema Repartidores

Esta guía explica cómo desplegar el sistema en diferentes entornos.

## 📋 Tabla de Contenidos

1. [Preparación para Producción](#preparación-para-producción)
2. [Despliegue en VPS (Linux)](#despliegue-en-vps-linux)
3. [Despliegue en Heroku](#despliegue-en-heroku)
4. [Despliegue con Docker](#despliegue-con-docker)
5. [Variables de Entorno](#variables-de-entorno)
6. [Seguridad](#seguridad)
7. [Monitoreo](#monitoreo)

---

## Preparación para Producción

### 1. Build del Cliente

```bash
cd client
npm run build
```

Esto generará los archivos estáticos en `client/dist/`

### 2. Configurar el Servidor para Servir el Cliente

Actualiza `server/server.js` para servir los archivos estáticos:

```javascript
const path = require('path');

// ... después de definir las rutas API

// Servir archivos estáticos en producción
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}
```

### 3. Variables de Entorno de Producción

Crea un archivo `.env.production`:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://usuario:contraseña@tu-servidor:27017/sistema-repartidores
JWT_SECRET=clave-secreta-muy-larga-y-segura-generada-aleatoriamente
```

---

## Despliegue en VPS (Linux)

### Requisitos

- Ubuntu 20.04 o superior
- Node.js v14+
- MongoDB
- PM2 (gestor de procesos)
- Nginx (servidor web)

### Paso 1: Configurar el Servidor

```bash
# Actualizar el sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org

# Iniciar MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Instalar PM2
sudo npm install -g pm2

# Instalar Nginx
sudo apt install -y nginx
```

### Paso 2: Clonar y Configurar la Aplicación

```bash
# Clonar el repositorio
cd /var/www
sudo git clone https://github.com/juvyexpress-droid/sistema-repartidores.git
cd sistema-repartidores

# Instalar dependencias
npm install
cd client && npm install && npm run build && cd ..

# Configurar variables de entorno
sudo nano .env
# (Pega tu configuración de producción)
```

### Paso 3: Configurar PM2

```bash
# Iniciar la aplicación con PM2
pm2 start server/server.js --name "sistema-repartidores"

# Configurar PM2 para inicio automático
pm2 startup systemd
pm2 save

# Ver logs
pm2 logs sistema-repartidores
```

### Paso 4: Configurar Nginx

```bash
sudo nano /etc/nginx/sites-available/sistema-repartidores
```

Añade la siguiente configuración:

```nginx
server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Habilitar el sitio
sudo ln -s /etc/nginx/sites-available/sistema-repartidores /etc/nginx/sites-enabled/

# Verificar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

### Paso 5: Configurar SSL con Let's Encrypt

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtener certificado SSL
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com

# Renovación automática
sudo certbot renew --dry-run
```

---

## Despliegue en Heroku

### Paso 1: Preparar la Aplicación

Crea un archivo `Procfile` en la raíz:

```
web: node server/server.js
```

Actualiza `package.json`:

```json
{
  "scripts": {
    "start": "node server/server.js",
    "build": "cd client && npm install && npm run build",
    "heroku-postbuild": "npm run build"
  },
  "engines": {
    "node": "18.x",
    "npm": "9.x"
  }
}
```

### Paso 2: Desplegar

```bash
# Instalar Heroku CLI
curl https://cli-assets.heroku.com/install.sh | sh

# Login
heroku login

# Crear aplicación
heroku create tu-app-repartidores

# Añadir MongoDB (Atlas o addon)
heroku addons:create mongolab:sandbox
# O configurar variable de entorno para MongoDB Atlas

# Configurar variables de entorno
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=tu-clave-secreta-aqui

# Desplegar
git push heroku main

# Ver logs
heroku logs --tail
```

---

## Despliegue con Docker

### Paso 1: Crear Dockerfile

Crea `Dockerfile` en la raíz:

```dockerfile
# Build stage para el cliente
FROM node:18-alpine AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Build stage para el servidor
FROM node:18-alpine
WORKDIR /app

# Copiar package.json del servidor
COPY package*.json ./
RUN npm ci --only=production

# Copiar código del servidor
COPY server/ ./server/

# Copiar build del cliente
COPY --from=client-build /app/client/dist ./client/dist

# Exponer puerto
EXPOSE 5000

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=5000

# Iniciar aplicación
CMD ["node", "server/server.js"]
```

### Paso 2: Crear docker-compose.yml

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:6.0
    container_name: repartidores-mongodb
    restart: always
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: contraseña-segura
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

  app:
    build: .
    container_name: repartidores-app
    restart: always
    ports:
      - "5000:5000"
    environment:
      NODE_ENV: production
      PORT: 5000
      MONGODB_URI: mongodb://admin:contraseña-segura@mongodb:27017/sistema-repartidores?authSource=admin
      JWT_SECRET: clave-secreta-muy-larga-y-segura
    depends_on:
      - mongodb

volumes:
  mongodb_data:
```

### Paso 3: Construir y Ejecutar

```bash
# Construir imagen
docker-compose build

# Iniciar contenedores
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener
docker-compose down

# Detener y eliminar volúmenes
docker-compose down -v
```

---

## Variables de Entorno

### Requeridas

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `NODE_ENV` | Entorno de ejecución | `production` |
| `PORT` | Puerto del servidor | `5000` |
| `MONGODB_URI` | URI de conexión a MongoDB | `mongodb://...` |
| `JWT_SECRET` | Clave secreta para JWT | `clave-muy-segura` |

### Opcionales

| Variable | Descripción | Default |
|----------|-------------|---------|
| `CORS_ORIGIN` | Origen permitido para CORS | `*` |
| `LOG_LEVEL` | Nivel de logging | `info` |

---

## Seguridad

### Checklist de Seguridad

- [ ] JWT_SECRET fuerte y único (mínimo 32 caracteres)
- [ ] HTTPS habilitado (certificado SSL)
- [ ] MongoDB con autenticación activada
- [ ] Firewall configurado (solo puertos necesarios)
- [ ] Rate limiting implementado
- [ ] Validación de entrada en todas las rutas
- [ ] Helmet.js para headers de seguridad
- [ ] Variables de entorno protegidas
- [ ] Backups automáticos de base de datos
- [ ] Logs de auditoría activados

### Implementar Helmet y Rate Limiting

```bash
npm install helmet express-rate-limit
```

Actualiza `server/server.js`:

```javascript
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Seguridad
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // límite de 100 peticiones por ventana
});
app.use('/api/', limiter);
```

---

## Monitoreo

### PM2 Monitoring

```bash
# Instalar PM2
npm install -g pm2

# Monitoreo en tiempo real
pm2 monit

# Dashboard web
pm2 plus
```

### Logs

```bash
# Ver logs en tiempo real
pm2 logs sistema-repartidores

# Logs de errores únicamente
pm2 logs sistema-repartidores --err

# Limpiar logs
pm2 flush
```

### Health Check

Implementa un endpoint de health check:

```javascript
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: Date.now()
  });
});
```

Configura un monitor externo (como UptimeRobot) para verificar este endpoint.

---

## Respaldo y Recuperación

### Backup de MongoDB

```bash
# Crear backup
mongodump --uri="mongodb://usuario:contraseña@servidor:27017/sistema-repartidores" --out=/backups/$(date +%Y%m%d)

# Restaurar backup
mongorestore --uri="mongodb://usuario:contraseña@servidor:27017/sistema-repartidores" /backups/20240101
```

### Automatizar Backups

Crea un cron job:

```bash
crontab -e
```

Añade:

```
0 2 * * * /usr/bin/mongodump --uri="mongodb://..." --out=/backups/$(date +\%Y\%m\%d)
0 3 * * 0 find /backups -type d -mtime +30 -exec rm -rf {} +
```

---

## Troubleshooting

### Puerto en uso

```bash
# Encontrar proceso usando el puerto
lsof -i :5000

# Matar proceso
kill -9 PID
```

### MongoDB no conecta

```bash
# Verificar estado
sudo systemctl status mongod

# Ver logs
sudo tail -f /var/log/mongodb/mongod.log

# Reiniciar
sudo systemctl restart mongod
```

### PM2 no inicia

```bash
# Eliminar y volver a iniciar
pm2 delete sistema-repartidores
pm2 start server/server.js --name sistema-repartidores

# Ver logs detallados
pm2 logs sistema-repartidores --lines 100
```

---

## Actualizaciones

```bash
# En el servidor
cd /var/www/sistema-repartidores

# Detener la aplicación
pm2 stop sistema-repartidores

# Actualizar código
git pull origin main

# Instalar dependencias
npm install
cd client && npm install && npm run build && cd ..

# Reiniciar
pm2 restart sistema-repartidores
```

---

## Soporte

Para problemas o preguntas, contacta al equipo de desarrollo.
