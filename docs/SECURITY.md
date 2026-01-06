# Notas de Seguridad

## Consideraciones de Seguridad Actuales

### ⚠️ Almacenamiento de Tokens JWT

**Implementación Actual:**
El sistema actualmente almacena tokens JWT y datos de usuario en `localStorage`.

**Riesgos:**
- Vulnerable a ataques XSS (Cross-Site Scripting)
- Los tokens son accesibles desde JavaScript en el navegador

**Mejoras Recomendadas para Producción:**

1. **Usar httpOnly Cookies**
   ```javascript
   // Backend: Configurar cookie httpOnly
   res.cookie('token', token, {
     httpOnly: true,
     secure: true, // Solo HTTPS
     sameSite: 'strict',
     maxAge: 24 * 60 * 60 * 1000 // 24 horas
   });
   ```

2. **Implementar Refresh Tokens**
   - Access token de corta duración (15-30 minutos)
   - Refresh token de larga duración (7 días)
   - Renovación automática de tokens

3. **Content Security Policy (CSP)**
   ```html
   <meta http-equiv="Content-Security-Policy" 
         content="default-src 'self'; script-src 'self'">
   ```

### 🔐 Otras Mejoras de Seguridad Recomendadas

#### 1. Rate Limiting
```javascript
// Instalar express-rate-limit
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // límite de requests
});

app.use('/api/', limiter);
```

#### 2. Helmet para Headers de Seguridad
```javascript
const helmet = require('helmet');
app.use(helmet());
```

#### 3. Validación de Entrada
```javascript
const { body, validationResult } = require('express-validator');

app.post('/api/pedidos', [
  body('direccion_entrega').trim().escape(),
  body('total').isFloat({ min: 0 }),
  // ... más validaciones
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // ... continuar
});
```

#### 4. HTTPS en Producción
- Siempre usar HTTPS en producción
- Configurar redirección automática HTTP → HTTPS
- Usar certificados SSL/TLS válidos

#### 5. Sanitización de Datos
```javascript
// Instalar express-mongo-sanitize o similar
const mongoSanitize = require('express-mongo-sanitize');
app.use(mongoSanitize());
```

#### 6. Configurar CORS Apropiadamente
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL, // URL específica, no '*'
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

#### 7. Ocultar Información del Servidor
```javascript
app.disable('x-powered-by');
```

#### 8. Timeouts de Sesión
- Implementar timeout automático después de inactividad
- Cerrar sesión automáticamente después de cierto tiempo

#### 9. Logging y Monitoreo
```javascript
// Usar Winston o similar para logging
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

#### 10. Validación del Origen del Webhook
```javascript
// Webhook de n8n - agregar validación
app.post('/api/pedidos/webhook', (req, res, next) => {
  const allowedIPs = process.env.N8N_IPS.split(',');
  const clientIP = req.ip;
  
  if (!allowedIPs.includes(clientIP)) {
    return res.status(403).json({ error: 'IP no autorizada' });
  }
  next();
});
```

### 🛡️ Checklist de Seguridad para Producción

- [ ] Cambiar JWT_SECRET a un valor fuerte y aleatorio
- [ ] Implementar httpOnly cookies en lugar de localStorage
- [ ] Reducir expiración de tokens (1-2 horas + refresh token)
- [ ] Agregar rate limiting
- [ ] Instalar y configurar Helmet
- [ ] Configurar CORS con origen específico
- [ ] Implementar validación de entrada robusta
- [ ] Agregar sanitización de datos
- [ ] Usar HTTPS exclusivamente
- [ ] Implementar logging y monitoreo
- [ ] Configurar firewalls y VPCs
- [ ] Realizar auditoría de dependencias (`npm audit`)
- [ ] Implementar backups automáticos de BD
- [ ] Configurar variables de entorno seguras
- [ ] Revisar permisos de base de datos
- [ ] Implementar 2FA para administradores
- [ ] Agregar captcha en login
- [ ] Implementar detección de bots
- [ ] Configurar alertas de seguridad
- [ ] Realizar pentesting

### 📝 Buenas Prácticas Implementadas

✅ Contraseñas hasheadas con bcryptjs (salt rounds: 10)
✅ JWT para autenticación
✅ Control de acceso basado en roles
✅ Validación de permisos en cada endpoint
✅ Prepared statements (prevención de SQL injection)
✅ CORS configurado
✅ Variables sensibles en .env
✅ .gitignore para archivos sensibles
✅ Separación de concerns (MVC)
✅ Validación de datos en backend

### 🔄 Mejoras para la Siguiente Iteración

1. Migrar de localStorage a httpOnly cookies
2. Implementar refresh tokens
3. Agregar rate limiting
4. Instalar Helmet
5. Mejorar validación de entrada con express-validator
6. Implementar logging centralizado
7. Agregar monitoreo en tiempo real
8. Implementar sistema de alertas

## Notas Adicionales

Este documento debe actualizarse a medida que se implementen mejoras de seguridad. La seguridad es un proceso continuo, no un estado final.

Para ambientes de desarrollo/testing, la configuración actual es aceptable. Para producción, se deben implementar todas las mejoras recomendadas.
