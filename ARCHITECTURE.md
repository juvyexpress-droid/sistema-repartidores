# Arquitectura del Sistema - Diagrama Visual

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         SISTEMA DE REPARTIDORES                          │
│                             Juvy Express                                 │
└─────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────────┐
│                            FRONTEND (React)                               │
│                          Port: 3000 (Vite)                                │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌─────────────────────┐           ┌─────────────────────┐             │
│  │   Login Page        │           │   AuthContext       │             │
│  │                     │◄──────────┤   (Global State)    │             │
│  │ - Register          │           │                     │             │
│  │ - Login             │           │ - User State        │             │
│  │ - Role Selection    │           │ - Authentication    │             │
│  └─────────────────────┘           └─────────────────────┘             │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────┐           │
│  │         Repartidor Dashboard                             │           │
│  ├──────────────────────────────────────────────────────────┤           │
│  │  Fixed Header:                                           │           │
│  │  - Nombre, Horario, Toggle Disponibilidad               │           │
│  ├──────────────────────────────────────────────────────────┤           │
│  │  Stats Cards:                                            │           │
│  │  - Porcentaje | Entregas | Ganancias | Multas           │           │
│  ├──────────────────────────────────────────────────────────┤           │
│  │  Tabs:                                                   │           │
│  │  1. Pedidos Activos (Accept/Reject/Update)              │           │
│  │  2. Historial (Delivered/Rejected)                      │           │
│  │  3. Ganancias (Daily/Weekly/Monthly)                    │           │
│  │  4. Auditoría (Fines by Type)                           │           │
│  │  5. Notificaciones (Unread Count)                       │           │
│  └──────────────────────────────────────────────────────────┘           │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────┐           │
│  │            Admin Dashboard                               │           │
│  ├──────────────────────────────────────────────────────────┤           │
│  │  Stats Cards:                                            │           │
│  │  - Pedidos Activos | Disponibles | Total | Zonas        │           │
│  ├──────────────────────────────────────────────────────────┤           │
│  │  Tabs:                                                   │           │
│  │  1. Pedidos (Create, Assign, List)                      │           │
│  │  2. Repartidores (Update %, Schedule, Enable/Disable)   │           │
│  │  3. Zonas y Tarifas (CRUD Zones & Sectors)              │           │
│  │  4. Establecimientos (CRUD by Category)                 │           │
│  │  5. Promociones (Create with Validation)                │           │
│  │  6. Multas (Create, List, Update Status)                │           │
│  │  7. Reportes (Analytics & Performance)                  │           │
│  └──────────────────────────────────────────────────────────┘           │
│                                                                           │
│  ┌─────────────────────┐                                                │
│  │   API Service       │                                                │
│  │   (Axios)           │                                                │
│  │                     │                                                │
│  │ - authService       │                                                │
│  │ - orderService      │                                                │
│  │ - repartidorService │                                                │
│  │ - adminService      │                                                │
│  │ - notificationSrv   │                                                │
│  └─────────────────────┘                                                │
│            │                                                              │
└────────────┼──────────────────────────────────────────────────────────────┘
             │
             │  HTTP/HTTPS (REST API)
             │  JSON + JWT Bearer Token
             ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                          BACKEND (Node.js + Express)                      │
│                              Port: 5000                                   │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌─────────────────────────────────────────────────────────┐            │
│  │                    Middleware Layer                      │            │
│  ├─────────────────────────────────────────────────────────┤            │
│  │  - CORS                                                  │            │
│  │  - express.json()                                        │            │
│  │  - express.urlencoded()                                  │            │
│  │  - auth (JWT verification)                               │            │
│  │  - isAdmin (role check)                                  │            │
│  │  - isRepartidor (role check)                             │            │
│  └─────────────────────────────────────────────────────────┘            │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────┐            │
│  │                      Routes Layer                        │            │
│  ├─────────────────────────────────────────────────────────┤            │
│  │  /api/auth           - Authentication endpoints         │            │
│  │  /api/orders         - Order management endpoints       │            │
│  │  /api/repartidor     - Repartidor-specific endpoints    │            │
│  │  /api/admin          - Admin-only endpoints             │            │
│  │  /api/notifications  - Notification endpoints           │            │
│  │  /api/messages       - Chat endpoints                   │            │
│  │  /api/health         - Health check                     │            │
│  └─────────────────────────────────────────────────────────┘            │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────┐            │
│  │                   Controllers Layer                      │            │
│  ├─────────────────────────────────────────────────────────┤            │
│  │  authController                                          │            │
│  │  - register, login, getProfile, updateProfile            │            │
│  │                                                          │            │
│  │  orderController                                         │            │
│  │  - create, assign, accept, reject, deliver, getOrders    │            │
│  │                                                          │            │
│  │  repartidorController                                    │            │
│  │  - toggleAvailability, getEarnings, getFines             │            │
│  │                                                          │            │
│  │  adminController                                         │            │
│  │  - zones, establishments, promotions, fines, reports     │            │
│  │                                                          │            │
│  │  notificationController                                  │            │
│  │  - notifications, messages, chat                         │            │
│  └─────────────────────────────────────────────────────────┘            │
│                                                                           │
│                              │                                            │
│                              ▼                                            │
┌───────────────────────────────────────────────────────────────────────────┐
│                         DATABASE (MongoDB)                                │
│                           Port: 27017                                     │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │    Users     │  │    Orders    │  │    Zones     │                  │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤                  │
│  │ - Admin      │  │ - Customer   │  │ - Name       │                  │
│  │ - Repartidor │  │ - Items      │  │ - Sectors[]  │                  │
│  │ - Schedule   │  │ - Repartidor │  │ - Delivery   │                  │
│  │ - Percentage │  │ - Status     │  │   Fees       │                  │
│  │ - Earnings   │  │ - History[]  │  │              │                  │
│  │ - Fines[]    │  │ - Fees       │  │              │                  │
│  └──────────────┘  └──────────────┘  └──────────────┘                  │
│                                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │Establishments│  │     Fines    │  │  Promotions  │                  │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤                  │
│  │ - Name       │  │ - Repartidor │  │ - Name       │                  │
│  │ - Category   │  │ - Type       │  │ - Type       │                  │
│  │ - Zone       │  │ - Amount     │  │ - Value      │                  │
│  │ - Menu[]     │  │ - Status     │  │ - Dates      │                  │
│  │              │  │              │  │              │                  │
│  └──────────────┘  └──────────────┘  └──────────────┘                  │
│                                                                           │
│  ┌──────────────┐  ┌──────────────┐                                     │
│  │Notifications │  │ ChatMessages │                                     │
│  ├──────────────┤  ├──────────────┤                                     │
│  │ - User       │  │ - Sender     │                                     │
│  │ - Type       │  │ - Receiver   │                                     │
│  │ - Message    │  │ - Message    │                                     │
│  │ - isRead     │  │ - Order      │                                     │
│  └──────────────┘  └──────────────┘                                     │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────────┐
│                           BUSINESS LOGIC FLOW                             │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  1. ORDEN CREATION:                                                      │
│     Admin → Create Order → Calculate Delivery Fee (Zone/Sector)         │
│                         → Save to DB (status: pending)                   │
│                                                                           │
│  2. ASSIGNMENT:                                                          │
│     Admin → Select Available Repartidor → Calculate Earning (%)         │
│           → Update Order (status: assigned)                              │
│           → Create Notification → Send to Repartidor                     │
│                                                                           │
│  3. ACCEPTANCE:                                                          │
│     Repartidor → Accept Order → Update Status (accepted)                │
│                              → Update Timestamps                         │
│                                                                           │
│  4. REJECTION:                                                           │
│     Repartidor → Enter Reason (min 10 chars) → Update History           │
│                                               → Reset Order (pending)    │
│                                               → Notify Admin             │
│                                               → Ready for Reassignment   │
│                                                                           │
│  5. DELIVERY:                                                            │
│     Repartidor → In Transit → Delivered → Update Repartidor Stats       │
│                                         → Add to History                 │
│                                         → Calculate Final Earnings       │
│                                                                           │
│  6. AVAILABILITY:                                                        │
│     Repartidor → Toggle Switch → Validate Schedule (time + days)        │
│                                → Update isAvailable                      │
│                                → Track unavailableCount                  │
│                                → Auto-disable at 5 times                 │
│                                                                           │
│  7. FINES:                                                               │
│     Admin → Create Fine → Add to Repartidor.fines[]                     │
│                        → Update totalFines                               │
│                        → Create Notification                             │
│                                                                           │
│  8. REPORTS:                                                             │
│     Admin → Select Period → Query Orders (filtered by date)             │
│                          → Calculate Aggregates                          │
│                          → Group by Repartidor                           │
│                          → Return Analytics                              │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────────┐
│                         SECURITY & AUTHENTICATION                         │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  1. User registers → Password hashed with bcrypt (10 rounds)            │
│  2. User logs in → Credentials validated → JWT token generated (7d exp) │
│  3. Token stored in localStorage                                         │
│  4. Each request includes: Authorization: Bearer <token>                 │
│  5. Middleware verifies token → Decodes userId → Loads user             │
│  6. Role-based access control (Admin vs Repartidor)                     │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────────┐
│                         DEPLOYMENT ARCHITECTURE                           │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  OPTION 1: Traditional VPS                                               │
│  ┌────────────────────────────────────────────────────┐                 │
│  │  Nginx (Reverse Proxy + SSL)                       │                 │
│  │         │                                           │                 │
│  │         ▼                                           │                 │
│  │  PM2 → Node.js (Express) → MongoDB                 │                 │
│  │         │                                           │                 │
│  │         └─ Serves: React Build (Static Files)      │                 │
│  └────────────────────────────────────────────────────┘                 │
│                                                                           │
│  OPTION 2: Docker                                                        │
│  ┌────────────────────────────────────────────────────┐                 │
│  │  Container 1: Node.js App (Port 5000)              │                 │
│  │  Container 2: MongoDB (Port 27017)                 │                 │
│  │  Volume: mongodb_data (Persistence)                │                 │
│  └────────────────────────────────────────────────────┘                 │
│                                                                           │
│  OPTION 3: Heroku                                                        │
│  ┌────────────────────────────────────────────────────┐                 │
│  │  Heroku Dyno → Node.js                             │                 │
│  │  MongoDB Atlas → Cloud Database                    │                 │
│  │  Heroku Build → React Build Included               │                 │
│  └────────────────────────────────────────────────────┘                 │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────────┐
│                            KEY METRICS                                    │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  Backend:                                                                │
│  - 8 Database Models                                                     │
│  - 5 Controllers                                                         │
│  - 5 Route Files                                                         │
│  - 40+ API Endpoints                                                     │
│  - JWT Authentication                                                    │
│                                                                           │
│  Frontend:                                                               │
│  - 3 Main Pages                                                          │
│  - 1 Context Provider                                                    │
│  - Complete API Integration                                              │
│  - Responsive Design                                                     │
│                                                                           │
│  Features:                                                               │
│  - 100% Spec Compliance                                                  │
│  - Role-Based Access                                                     │
│  - Real-time Notifications                                               │
│  - Advanced Analytics                                                    │
│  - Automated Business Logic                                              │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
```
