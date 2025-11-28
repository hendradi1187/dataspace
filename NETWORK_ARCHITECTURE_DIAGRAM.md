# Network Architecture Diagram - Dataspace Platform

## Server: 45.158.126.171

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           External Network (Internet)                        │
│                                                                              │
│  ┌──────────────┐         ┌──────────────┐         ┌──────────────┐       │
│  │   Browser    │         │ API Client   │         │ External App │       │
│  │  (User PC)   │         │              │         │              │       │
│  └──────┬───────┘         └──────┬───────┘         └──────┬───────┘       │
│         │                        │                        │                │
│         │ HTTP Requests          │                        │                │
│         └────────────────────────┴────────────────────────┘                │
│                                  │                                          │
└──────────────────────────────────┼──────────────────────────────────────────┘
                                   │
                                   │ Port 5174, 3000-3011
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      Docker Host (45.158.126.171)                           │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    Port Bindings (0.0.0.0)                           │   │
│  │                                                                       │   │
│  │  0.0.0.0:5174 → Container:5174  (Frontend)                          │   │
│  │  0.0.0.0:3000 → Container:3000  (IDP)                               │   │
│  │  0.0.0.0:3001 → Container:3001  (Broker)                            │   │
│  │  0.0.0.0:3002 → Container:3002  (Hub)                               │   │
│  │  0.0.0.0:3003-3011 → Container:3003-3011  (Other Services)          │   │
│  │  0.0.0.0:5432 → Container:5432  (PostgreSQL)                        │   │
│  │  0.0.0.0:6379 → Container:6379  (Redis)                             │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                   │                                          │
│                                   ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │              Docker Network: dataspace-net (172.20.0.0/16)           │   │
│  │                                                                       │   │
│  │  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐      │   │
│  │  │   Frontend   │      │     IDP      │      │    Broker    │      │   │
│  │  │  Container   │      │  Container   │      │  Container   │      │   │
│  │  │              │      │              │      │              │      │   │
│  │  │ Port: 5174   │      │ Port: 3000   │      │ Port: 3001   │      │   │
│  │  │              │      │              │      │              │      │   │
│  │  │ API Calls:   │──┐   │              │      │              │      │   │
│  │  │ 45.158...    │  │   │              │      │              │      │   │
│  │  │ :3000-3011   │  │   │              │      │              │      │   │
│  │  └──────────────┘  │   └──────┬───────┘      └──────┬───────┘      │   │
│  │                    │          │                     │               │   │
│  │                    │          │ Internal Calls:     │               │   │
│  │                    │          │ http://broker:3001  │               │   │
│  │                    │          └─────────────────────┘               │   │
│  │                    │                                                 │   │
│  │  ┌──────────────┐ │   ┌──────────────┐      ┌──────────────┐      │   │
│  │  │     Hub      │ │   │    Policy    │      │  Contract    │      │   │
│  │  │  Container   │ │   │  Container   │      │  Container   │      │   │
│  │  │ Port: 3002   │ │   │ Port: 3003   │      │ Port: 3004   │      │   │
│  │  └──────┬───────┘ │   └──────┬───────┘      └──────┬───────┘      │   │
│  │         │         │          │                     │               │   │
│  │         │         │          │ All services can    │               │   │
│  │         │         │          │ reach each other    │               │   │
│  │         │         │          │ via service names   │               │   │
│  │  ┌──────┴───────┐ │   ┌──────┴───────┐      ┌─────┴────────┐     │   │
│  │  │  Compliance  │ │   │   Ledger     │      │  Clearing    │     │   │
│  │  │  Container   │ │   │  Container   │      │  Container   │     │   │
│  │  │ Port: 3005   │ │   │ Port: 3006   │      │ Port: 3007   │     │   │
│  │  └──────┬───────┘ │   └──────┬───────┘      └──────┬───────┘     │   │
│  │         │         │          │                     │               │   │
│  │         └─────────┴──────────┴─────────────────────┘               │   │
│  │                    │                                                │   │
│  │  ┌──────────────┐ │   ┌──────────────┐      ┌──────────────┐     │   │
│  │  │  AppStore    │ │   │  Connector   │      │ TC Clearing  │     │   │
│  │  │  Container   │ │   │  Container   │      │  Container   │     │   │
│  │  │ Port: 3008   │ │   │ Port: 3009   │      │ Port: 3010   │     │   │
│  │  └──────┬───────┘ │   └──────┬───────┘      └──────┬───────┘     │   │
│  │         │         │          │                     │               │   │
│  │         └─────────┴──────────┴─────────────────────┘               │   │
│  │                    │                                                │   │
│  │  ┌──────────────┐ │   ┌──────────────┐      ┌──────────────┐     │   │
│  │  │TC Connector  │ │   │  PostgreSQL  │      │    Redis     │     │   │
│  │  │  Container   │ │   │  Container   │      │  Container   │     │   │
│  │  │ Port: 3011   │ │   │ Port: 5432   │      │ Port: 6379   │     │   │
│  │  └──────┬───────┘ │   └──────┬───────┘      └──────┬───────┘     │   │
│  │         │         │          │                     │               │   │
│  │         └─────────┴──────────┴─────────────────────┘               │   │
│  │                    │                                                │   │
│  │                    │   Internal Communication:                     │   │
│  │                    │   - DB: postgres:5432                         │   │
│  │                    │   - Cache: redis:6379                         │   │
│  │                    │   - Services: service-name:port               │   │
│  │                    │                                                │   │
│  │                    └─ External Calls go back to Host ─┐            │   │
│  │                                                        │            │   │
│  └────────────────────────────────────────────────────────┼────────────┘   │
│                                                           │                │
└───────────────────────────────────────────────────────────┼────────────────┘
                                                            │
                                                            ▼
                                                   (Routes through
                                                    external network
                                                    then back in)
```

## Communication Flows

### 1. Browser → Frontend (Static Files)
```
User Browser
  └─→ http://45.158.126.171:5174
      └─→ Docker Host: 0.0.0.0:5174 → Container:5174
          └─→ Frontend Container serves static files
```

### 2. Browser → Backend API (from Frontend JavaScript)
```
Browser JavaScript (in Frontend)
  └─→ fetch('http://45.158.126.171:3000/api/users')
      └─→ Docker Host: 0.0.0.0:3000 → Container:3000
          └─→ IDP Container handles request
              └─→ Returns JSON response
```

### 3. Backend → Backend (Internal Service Calls)
```
IDP Container needs data from Broker
  └─→ fetch('http://broker:3001/api/datasets')
      └─→ Docker DNS resolves 'broker' to container IP
          └─→ Direct container-to-container communication
              └─→ Broker Container handles request
                  └─→ Returns data
```

### 4. Backend → Database (Internal)
```
Any Backend Service needs database
  └─→ PostgreSQL client connects to 'postgres:5432'
      └─→ Docker DNS resolves to postgres container
          └─→ Direct database connection
```

## Environment Variable Usage

### Frontend Container (Build Time)
```javascript
// These are baked into the built JavaScript during docker build
const API_URL = import.meta.env.VITE_IDP_API_URL;
// Becomes: "http://45.158.126.171:3000"

// When browser loads the app:
fetch(`${API_URL}/api/users`)
// Calls: http://45.158.126.171:3000/api/users
```

### Backend Container (Runtime)
```javascript
// These are read from environment at runtime
const dbHost = process.env.DB_HOST;        // "postgres"
const brokerUrl = process.env.BROKER_URL;  // "http://broker:3001"

// When service makes internal call:
fetch(`${brokerUrl}/api/datasets`)
// Calls: http://broker:3001/api/datasets (internal Docker network)
```

## Key Principles

### ✅ Correct Configurations

1. **Port Bindings:** Always use `0.0.0.0` or omit IP
   ```yaml
   ports:
     - "0.0.0.0:3000:3000"  # ✅ Correct
     - "3000:3000"          # ✅ Also correct (defaults to 0.0.0.0)
   ```

2. **Internal Service URLs:** Use Docker service names
   ```env
   DB_HOST=postgres           # ✅ Correct
   IDP_URL=http://idp:3000    # ✅ Correct
   ```

3. **External URLs (Frontend):** Use server IP
   ```env
   VITE_IDP_API_URL=http://45.158.126.171:3000  # ✅ Correct
   ```

### ❌ Incorrect Configurations

1. **Port Bindings:** Don't bind to specific IP
   ```yaml
   ports:
     - "45.158.126.171:3000:3000"  # ❌ WRONG - service won't start
   ```

2. **Internal URLs:** Don't use external IP internally
   ```env
   DB_HOST=45.158.126.171          # ❌ WRONG - slower, goes through external network
   IDP_URL=http://45.158.126.171:3000  # ❌ WRONG - for internal calls
   ```

3. **External URLs:** Don't use localhost in production frontend
   ```env
   VITE_IDP_API_URL=http://localhost:3000  # ❌ WRONG - won't work from browser
   ```

## Network Security

### Firewall Configuration
```bash
# Required open ports on server:
- 80/tcp    (HTTP)
- 443/tcp   (HTTPS)
- 5174/tcp  (Frontend)
- 3000-3011/tcp  (Backend Services)

# Internal only (not exposed externally):
- 5432/tcp  (PostgreSQL) - consider restricting
- 6379/tcp  (Redis) - consider restricting
- 9092/tcp  (Kafka) - consider restricting
```

### Docker Network Isolation
- All containers are on `dataspace-net` (172.20.0.0/16)
- Containers can only reach each other if on same network
- Host firewall controls external access
- Use Traefik or nginx for additional security layer

## Performance Considerations

### Internal Communication (Fast)
- Direct container-to-container
- No external routing
- Low latency (~1ms)
- No bandwidth limits

### External Communication (Normal)
- Goes through host network stack
- Subject to network latency
- Bandwidth dependent on server connection
- May be subject to firewall inspection

## Troubleshooting

### Service Can't Start
```
Check: Port binding configuration
Look for: "address already in use" or "cannot bind"
Fix: Ensure using 0.0.0.0 not specific IP
```

### Service Can't Reach Database
```
Check: Environment variable DB_HOST
Look for: Connection refused or DNS errors
Fix: Should be "postgres" not "localhost" or IP
```

### Frontend Can't Call Backend
```
Check: Browser console for CORS or network errors
Look for: Calls to localhost instead of server IP
Fix: Verify VITE_*_API_URL uses server IP
```

### Services Can't Find Each Other
```
Check: Docker network configuration
Look for: DNS resolution failures
Fix: Verify all services on same network (dataspace-net)
```

---

**Last Updated:** 2025-11-28
**Server:** 45.158.126.171
**Network:** dataspace-net (172.20.0.0/16)
