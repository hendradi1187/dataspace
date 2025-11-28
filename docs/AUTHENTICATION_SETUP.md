# Dataspace Platform - Authentication & Login Setup Guide

## 📋 Overview

The Dataspace Platform uses **OAuth2 Client Credentials Flow** for authentication. This guide will help you set up login functionality and manage user credentials.

## 🗄️ Database Schema

### Tables Created

The following PostgreSQL tables are created for user and role management:

| Table | Purpose |
|-------|---------|
| `roles` | Define roles (admin, manager, analyst, viewer, guest) |
| `permissions` | Define granular permissions |
| `role_permissions` | Map permissions to roles |
| `users` | Store user accounts |
| `credentials` | Store OAuth2 client credentials |
| `api_keys` | Store API keys for programmatic access |
| `sessions` | Track active user sessions |
| `audit_log` | Log all system activities |

## 🔐 Default Credentials

### Admin User (Full Access)

```
Client ID:     admin-client
Client Secret: admin-secret-123
Scopes:        read:all, write:all, admin:system
Role:          ADMIN
```

**Permissions:**
- Full system access
- User management
- Role management
- Audit log viewing
- System administration

### Test User (Limited Access)

```
Client ID:     test_client
Client Secret: test_secret
Scopes:        read:data, write:data, read:datasets
Role:          USER
```

**Permissions:**
- View dashboard
- Read/write datasets
- Read participants
- Export data

## 🚀 Quick Start

### 1. Database Setup

```bash
# Navigate to database directory
cd D:/BMAD-METHOD/dataspace/database

# Run database setup script
bash setup-db.sh

# This will:
# ✓ Create PostgreSQL database
# ✓ Create all tables and indexes
# ✓ Insert roles and permissions
# ✓ Create admin user
```

**Configuration (optional):**
```bash
# Use custom database credentials
DB_HOST=your-host DB_PORT=5432 DB_NAME=dataspace_db \
DB_USER=dataspace_user DB_PASSWORD=your_password \
bash setup-db.sh
```

### 2. Admin Credentials Setup

```bash
# From database directory
bash admin-setup.sh

# This will:
# ✓ Create admin credentials in IDP service
# ✓ Create test credentials
# ✓ Verify authentication works
# ✓ Display login instructions
```

### 3. Frontend Login

Navigate to frontend:
```
http://localhost:5174
(or http://localhost:5173 if 5174 is not available)
```

Login with admin credentials:
- **Client ID:** `admin-client`
- **Client Secret:** `admin-secret-123`

## 🔑 Login Flow

### OAuth2 Client Credentials Flow

```
┌─────────────┐
│  Frontend   │
│  Login Form │
└──────┬──────┘
       │
       │ POST /token
       │ { clientId, clientSecret, grantType }
       ▼
┌─────────────┐
│   IDP       │
│  Service    │ ✓ Validate credentials
│ (Port 3000) │ ✓ Generate JWT token
└──────┬──────┘
       │
       │ Return token response
       │ { accessToken, refreshToken, expiresIn }
       ▼
┌─────────────┐
│  Frontend   │
│  Stores in  │
│ localStorage│
└──────┬──────┘
       │
       │ GET /users/me
       │ Header: X-Client-ID: admin-client
       ▼
┌─────────────┐
│   IDP       │
│  Returns    │
│  User Info  │
└──────┬──────┘
       │
       │ User profile data
       ▼
┌─────────────┐
│  Frontend   │
│  Redirect   │
│  to          │
│  Dashboard  │
└─────────────┘
```

## 📱 Frontend Components

### Login Page
**Location:** `apps/frontend/src/pages/Login.tsx`

Features:
- Clean, professional UI
- OAuth2 client credentials input
- Error handling and validation
- Loading states
- Demo credentials display

### Protected Routes
**Location:** `apps/frontend/src/components/ProtectedRoute.tsx`

Features:
- JWT token validation
- Automatic redirect to login
- Role-based access control
- Permission checking

### Auth Store (Zustand)
**Location:** `apps/frontend/src/stores/auth-store.ts`

Manages:
- User profile
- Auth tokens
- Loading states
- Error messages

### RBAC Store (Zustand)
**Location:** `apps/frontend/src/stores/rbac-store.ts`

Manages:
- User roles
- Permissions
- Permission checking methods

## 🔌 IDP Service Endpoints

**Base URL:** `http://localhost:3000`

### Authentication Endpoints

#### POST /token
Request OAuth2 token

**Request:**
```json
{
  "clientId": "admin-client",
  "clientSecret": "admin-secret-123",
  "grantType": "client_credentials",
  "scope": "read:all write:all"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "refresh_...",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "scope": "read:all write:all"
}
```

#### POST /token/refresh
Refresh access token

**Request:**
```json
{
  "refreshToken": "refresh_..."
}
```

#### POST /token/revoke
Revoke a token

**Request:**
```json
{
  "token": "eyJhbGc..."
}
```

### User Endpoints

#### GET /users/me
Get current user profile

**Headers:**
```
Authorization: Bearer <accessToken>
X-Client-ID: admin-client
```

**Response:**
```json
{
  "id": "user-id",
  "clientId": "admin-client",
  "participantId": "admin",
  "email": "admin@dataspace.local",
  "name": "admin",
  "role": "admin",
  "scopes": ["read:all", "write:all"],
  "permissions": [
    "read:all",
    "write:all",
    "admin:system",
    ...
  ]
}
```

#### GET /users
List all users (admin only)

**Query Parameters:**
- `page` - Page number (default: 1)
- `pageSize` - Items per page (default: 10)

**Response:**
```json
{
  "data": [
    {
      "id": "...",
      "clientId": "admin-client",
      "status": "active",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 2,
    "totalPages": 1
  }
}
```

#### POST /users
Create new user/credential

**Request:**
```json
{
  "clientId": "new-user",
  "participantId": "participant-123",
  "scope": ["read:data", "write:data"]
}
```

**Response:**
```json
{
  "id": "...",
  "clientId": "new-user",
  "clientSecret": "generated-secret-...",
  "status": "active",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

## 🧪 Testing Authentication

### Test with cURL

#### 1. Get Token
```bash
curl -X POST http://localhost:3000/token \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "admin-client",
    "clientSecret": "admin-secret-123",
    "grantType": "client_credentials"
  }'
```

#### 2. Get User Profile
```bash
curl http://localhost:3000/users/me \
  -H "X-Client-ID: admin-client"
```

#### 3. List All Users
```bash
curl "http://localhost:3000/users?pageSize=10"
```

#### 4. Create New User
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "new-client",
    "participantId": "participant-456",
    "scope": ["read:data"]
  }'
```

### Frontend Testing

1. Open browser: `http://localhost:5174`
2. Click "Demo Credentials" section
3. Enter admin credentials:
   - Client ID: `admin-client`
   - Client Secret: `admin-secret-123`
4. Click "Sign In"
5. Should redirect to Dashboard with user data

## 🛡️ Security Best Practices

### For Development
- ✓ Using sample credentials
- ✓ Tokens stored in localStorage (acceptable for dev)
- ✓ CORS enabled on IDP service
- ✓ Demo credentials displayed on login page

### For Production
- ❌ Use strong, randomly generated secrets
- ❌ Store tokens in localStorage (XSS vulnerable)
- ✓ Use httpOnly cookies instead
- ✓ Implement CSRF protection
- ✓ Add rate limiting on token endpoints
- ✓ Use HTTPS for all communications
- ✓ Implement token rotation
- ✓ Add audit logging
- ✓ Use JWT signing with proper algorithms
- ✓ Implement token blacklisting

## 🔄 Token Lifecycle

### Token Generation
```javascript
// Token expires in 1 hour (3600 seconds)
expiresIn: 3600

// Check in localStorage
localStorage.getItem('authToken')
localStorage.getItem('refreshToken')
```

### Token Refresh
```javascript
// Automatic refresh before expiration
// Frontend checks token expiration on app load
// If expired or expiring soon, request new token
```

### Token Revocation
```javascript
// Called on logout
authService.revokeToken(token)

// Clears localStorage
localStorage.removeItem('authToken')
localStorage.removeItem('refreshToken')
```

## 👥 Role-Based Access Control (RBAC)

### Available Roles

| Role | Permissions | Use Case |
|------|-------------|----------|
| **Admin** | All | System administrators |
| **Manager** | Most (except admin) | Team leaders, department heads |
| **Analyst** | Read, analyze, export | Data analysts, researchers |
| **Viewer** | Read-only | Stakeholders, auditors |
| **Guest** | Minimal | New users, limited preview |

### Permissions

```typescript
// View permissions
'view:dashboard'
'view:participants'
'view:datasets'
'view:schemas'
'view:policies'
'view:contracts'
'view:compliance'
'view:audit'
'view:health'

// Create/Edit/Delete permissions
'create:participants' | 'edit:participants' | 'delete:participants'
'create:datasets' | 'edit:datasets' | 'delete:datasets'
'create:schemas' | 'edit:schemas' | 'delete:schemas'
'create:policies' | 'edit:policies' | 'delete:policies'
'create:contracts' | 'edit:contracts' | 'delete:contracts'

// Data operations
'export:data'
'import:data'

// Admin operations
'manage:users'
'manage:roles'
'admin:system'
```

## 📊 Database Schema Details

### Roles Table
```sql
CREATE TABLE roles (
  id UUID PRIMARY KEY,
  name VARCHAR(50) UNIQUE,       -- 'admin', 'manager', etc.
  description TEXT,
  created_at TIMESTAMP
);
```

### Permissions Table
```sql
CREATE TABLE permissions (
  id UUID PRIMARY KEY,
  name VARCHAR(100) UNIQUE,      -- 'read:data', 'write:all', etc.
  description TEXT,
  created_at TIMESTAMP
);
```

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  username VARCHAR(100) UNIQUE,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  full_name VARCHAR(255),
  role_id UUID REFERENCES roles,
  participant_id UUID,
  status VARCHAR(20),            -- 'active', 'inactive', 'suspended'
  last_login TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Credentials Table
```sql
CREATE TABLE credentials (
  id UUID PRIMARY KEY,
  client_id VARCHAR(100) UNIQUE,
  client_secret_hash VARCHAR(255),
  user_id UUID REFERENCES users,
  participant_id UUID,
  scope TEXT[],
  status VARCHAR(20),            -- 'active', 'revoked', 'expired'
  created_at TIMESTAMP,
  expires_at TIMESTAMP
);
```

## 🔧 Configuration

### Environment Variables

```bash
# IDP Service
IDP_URL=http://localhost:3000
IDP_PORT=3000

# Frontend
VITE_API_URL=http://localhost:3001
VITE_IDP_URL=http://localhost:3000
VITE_TOKEN_TIMEOUT=60000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dataspace_db
DB_USER=dataspace_user
DB_PASSWORD=dataspace_password
```

## 🐛 Troubleshooting

### Login Not Working

**Problem:** "Invalid credentials" error
- **Solution:** Verify credentials exist with `curl http://localhost:3000/credentials`
- **Solution:** Check IDP service is running: `curl http://localhost:3000/health`

**Problem:** "Network Error" on login
- **Solution:** Check CORS settings in IDP service
- **Solution:** Verify IDP service URL in frontend API client

**Problem:** Token expired immediately
- **Solution:** Check server time synchronization
- **Solution:** Verify token expiration settings (default: 3600 seconds)

### Database Issues

**Problem:** "Cannot connect to PostgreSQL"
- **Solution:** Verify PostgreSQL is running
- **Solution:** Check connection parameters in setup script
- **Solution:** Verify user has database creation permissions

**Problem:** "Tables not found"
- **Solution:** Run `bash setup-db.sh` to initialize schema
- **Solution:** Check database was created: `\l` in psql

## 📚 Additional Resources

- OAuth2 Client Credentials: https://tools.ietf.org/html/rfc6749#section-4.4
- JWT (JSON Web Tokens): https://jwt.io
- FastifyJS: https://www.fastify.io
- React Router: https://reactrouter.com
- Zustand State Management: https://github.com/pmndrs/zustand

## ✅ Verification Checklist

- [ ] PostgreSQL is running
- [ ] Database setup script completed successfully
- [ ] Admin user created with admin-client credentials
- [ ] Test user created with test_client credentials
- [ ] IDP service is running on port 3000
- [ ] All other services running (ports 3001-3009)
- [ ] Frontend can access http://localhost:5174
- [ ] Can login with admin-client / admin-secret-123
- [ ] Dashboard displays after successful login
- [ ] Can access protected routes
- [ ] Can logout and redirect to login page

## 🎯 Next Steps

1. **Customize Roles & Permissions**
   - Edit schema.sql to add custom permissions
   - Assign permissions to roles as needed

2. **Integrate with Database**
   - Replace in-memory credential storage with PostgreSQL
   - Update IDP service to query database

3. **Add Password Authentication**
   - Extend login to support username/password
   - Implement password hashing with bcrypt

4. **Implement Multi-Factor Authentication**
   - Add TOTP/SMS verification
   - Update login flow to include MFA

5. **Setup Audit Logging**
   - Log all authentication events
   - Create audit dashboard

---

**Last Updated:** 2024-01-01
**Version:** 1.0
**Status:** Ready for Testing
