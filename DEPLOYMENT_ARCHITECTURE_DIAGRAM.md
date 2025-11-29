# Docker Deployment Architecture - Visual Guide

## Port Allocation Before vs After

### ❌ BEFORE (Broken - Causes Port Conflict)

```
┌─────────────────────────────────────────────────────────────┐
│ docker-compose.production.yml (Old Config)                  │
└─────────────────────────────────────────────────────────────┘

broker service:
  replicas: 2              ← Tries to start 2 containers
  ports:
    - "0.0.0.0:3001:3001"  ← BOTH replicas map to same port!

Result:
┌──────────────────┐         ┌──────────────────┐
│   Replica 1      │         │   Replica 2      │
│   PID: broker_1  │         │   PID: broker_2  │
│   Port: 3001 ✅  │         │   Port: 3001 ❌  │
│   Status: Up     │         │   ERROR! FAIL    │
└──────────────────┘         └──────────────────┘
      ↓
"Bind for 0.0.0.0:3001 failed: port is already allocated" ❌
```

### ✅ AFTER (Fixed - Port Range Allocation)

```
┌─────────────────────────────────────────────────────────────┐
│ docker-compose.production.yml (New Config)                  │
└─────────────────────────────────────────────────────────────┘

broker service:
  replicas: 2              ← Starts 2 containers
  ports:
    - "0.0.0.0:3001-3002:3001"  ← Port range for replicas

Result:
┌──────────────────┐         ┌──────────────────┐
│   Replica 1      │         │   Replica 2      │
│   PID: broker_1  │         │   PID: broker_2  │
│   Port: 3001 ✅  │         │   Port: 3002 ✅  │
│   Status: Up     │         │   Status: Up     │
└──────────────────┘         └──────────────────┘
      ↓                            ↓
All services starting normally ✅
```

---

## Health Check Timeout Before vs After

### ❌ BEFORE (Broken - Container Marked Unhealthy)

```
Docker Health Check Timeline (15s start_period)

0s
│   Container starts
│   pnpm install begins
├─→ 5s: pnpm resolving workspace
├─→ 10s: Building libraries (TypeScript)
├─→ 15s: ⏱️ FIRST HEALTH CHECK
│        ❌ Service not ready (still compiling)
│        ❌ Health check fails
├─→ 20s: Still building libraries
├─→ 25s: Creating workspace symlinks
├─→ 30s: Second health check
│        ✅ Service finally ready
│        But already marked unhealthy after 3 failures
│
└─→ Container RESTARTED by Docker 🔄

Result: "Container is unhealthy" ❌
```

### ✅ AFTER (Fixed - Proper Startup Time)

```
Docker Health Check Timeline (45s start_period)

0s
│   Container starts
│   pnpm install begins
├─→ 5s: pnpm resolving workspace
├─→ 10s: Building libraries (TypeScript)
├─→ 20s: Still building libraries
├─→ 30s: Creating workspace symlinks
├─→ 45s: ⏱️ FIRST HEALTH CHECK
│        ✅ Service fully initialized
│        ✅ Health check passes
│
└─→ Container marked HEALTHY ✅

Allowed buffer: 45s startup + (10s timeout × 5 retries) = 95s total
Normal startup: 30-45s
Safe margin: 50+ seconds ✅

Result: Container stays healthy and running ✅
```

---

## Build Process Timeline

### Complete Docker Build Flow

```
Phase 1: Base Image (1-2 min)
┌─────────────────────────┐
│ FROM node:20-alpine     │
│ RUN npm install -g pnpm │
│ RUN apk add --no-cache  │
└────────────┬────────────┘
             ↓
        ✅ Done (1-2 min)

Phase 2: Dependencies (3-5 min)
┌──────────────────────────────────────┐
│ COPY pnpm-workspace.yaml             │
│ COPY pnpm-lock.yaml                  │
│ COPY package.json                    │
│ COPY libs/*/package.json             │
│ COPY services/cts/*/package.json     │
│ RUN pnpm install --frozen-lockfile   │
│   ├─ Resolving @dataspace/* packages │
│   ├─ Installing 100+ npm packages    │
│   └─ pnpm-lock.yaml validation       │
└────────────┬─────────────────────────┘
             ↓
        ✅ Done (3-5 min)

Phase 3: Library Build (3-5 min)
┌──────────────────────────────────────┐
│ FOR EACH lib IN libs/:               │
│   - libs/db                          │
│     └─ tsc TypeScript → JavaScript   │
│     └─ Creates dist/index.js         │
│   - libs/validation                  │
│   - libs/clients                     │
│   - libs/messages                    │
│                                      │
│ RUN pnpm -C libs/db run build        │
│ RUN pnpm -C libs/validation run build│
│ ... etc                              │
└────────────┬─────────────────────────┘
             ↓
        ✅ Done (3-5 min)

Phase 4: Service Build (2-3 min)
┌──────────────────────────────────────┐
│ FOR SERVICE: idp                     │
│                                      │
│ RUN pnpm -C services/cts/idp         │
│      run build                       │
│                                      │
│ Compiles service TypeScript          │
└────────────┬─────────────────────────┘
             ↓
        ✅ Done (2-3 min)

Phase 5: Workspace Setup (1-2 min)
┌──────────────────────────────────────┐
│ Runtime Stage:                       │
│                                      │
│ COPY node_modules from builder       │
│ RUN pnpm install --prod              │
│   ├─ Recreate workspace symlinks     │
│   ├─ Link: @dataspace/db             │
│   ├─ Link: @dataspace/validation     │
│   ├─ Link: @dataspace/clients        │
│   └─ Link: @dataspace/messages       │
│                                      │
│ Verify symlinks & entry points       │
│   ├─ Check lib/db/dist/index.js      │
│   ├─ Create fallback symlinks        │
│   └─ Report verification results     │
└────────────┬─────────────────────────┘
             ↓
        ✅ Done (1-2 min)

Phase 6: Finalization (1 min)
┌──────────────────────────────────────┐
│ SET HEALTHCHECK                      │
│ SET ENTRYPOINT                       │
│ EXPOSE PORT                          │
│ Layer squashing/optimization         │
└────────────┬─────────────────────────┘
             ↓
        ✅ TOTAL: 12-18 min

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CACHED BUILD (subsequent changes):
Usually 2-3 minutes (reuses layers 1-5)

REBUILD (no changes):
Usually 30-60 seconds (all layers cached)
```

---

## Service Health Status Timeline

### Complete Startup Sequence

```
Time    Event                          Status
────────────────────────────────────────────────────────

0s      Docker container created       🟡 Starting
        Entry point: docker-entrypoint.sh
        pnpm -C services/cts/idp start

5s      Waiting for dependencies       🟡 Initializing
        - Checking postgres: 5432
        - Checking redis: 6379
        - Checking kafka: 29092

10s     Connecting to services         🟡 Connecting
        - Database connection init
        - Redis connection init
        - Kafka client init

20s     Application bootstrap          🟡 Loading
        - NestJS module initialization
        - Route registration
        - Service startup

30s     Service ready for connections  🟢 Ready
        - Health endpoint available
        - API endpoints available

45s     ⏱️ FIRST HEALTH CHECK          🟢 HEALTHY ✅
        curl http://localhost:3000/health
        Response: 200 OK

        If health check fails here:
        Retry 1 (timeout 10s)
        Retry 2 (timeout 10s)
        Retry 3 (timeout 10s)
        Retry 4 (timeout 10s)
        Retry 5 (timeout 10s)
        Max wait: 45s + (10s × 5) = 95s

95s     Container marked HEALTHY      🟢 RUNNING ✅
        docker-compose ps shows:
        "Up (healthy)"
```

---

## Port Mapping Visual

### Broker Service (replicas: 2)

```
HOST (0.0.0.0)
│
├─ Port 3001 ──→ Docker Network ──→ broker_1:3001 ✅
│
└─ Port 3002 ──→ Docker Network ──→ broker_2:3001 ✅
                (container port 3001 shared, external ports differ)

Configuration:
ports:
  - "0.0.0.0:3001-3002:3001"
      ↑       ↑    ↑   ↑
      HOST    HOST  START CONTAINER
      IP      PORT  PORT
                RANGE
```

### Hub Service (replicas: 2)

```
HOST (0.0.0.0)
│
├─ Port 3002 ──→ Docker Network ──→ hub_1:3002 ✅
│
└─ Port 3003 ──→ Docker Network ──→ hub_2:3002 ✅

Configuration:
ports:
  - "0.0.0.0:3002-3003:3002"
```

### Complete Network Topology

```
                    ┌─────────────────────────────────┐
                    │      HOST MACHINE               │
                    │   45.158.126.171                │
                    └──────────────┬──────────────────┘
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         │                         │                         │
    Port 3000                   Port 3001-3002          Port 5174-5175
         │                         │                         │
      ┌──▼───┐              ┌──────▼──────┐          ┌─────────┐
      │ idp  │              │ broker      │          │frontend │
      │      │              │             │          │         │
      │ :3000│              │  Replica 1  │          │Replica 1│
      │      │              │  :3001  ✅  │          │ :5174✅ │
      │      │              │             │          │         │
      │ 2    │              │  Replica 2  │          │Replica 2│
      │replicas              │  :3002  ✅  │          │ :5175✅ │
      └──┬───┘              └──────┬──────┘          └────┬────┘
         │                         │                     │
         └─────────────────────────┼─────────────────────┘
                                   │
                    ┌──────────────▼───────────────┐
                    │    Docker Network           │
                    │  dataspace-net              │
                    │                             │
                    │ ┌─────────────────────────┐ │
                    │ │  postgres (5432)        │ │
                    │ │  redis (6379)           │ │
                    │ │  kafka (9092)           │ │
                    │ │  zookeeper (2181)       │ │
                    │ │  trustcore-policy       │ │
                    │ │  trustcore-contract     │ │
                    │ │  ... all services       │ │
                    │ └─────────────────────────┘ │
                    └─────────────────────────────┘
```

---

## Health Check Configuration Comparison

### ❌ Before: 15 Second Start Period

```
|─ 15s ─|─ 10s ─|─ 10s ─|─ 10s ─|
|startup| retry | retry | retry | UNHEALTHY ❌
|period │  1    │  2    │  3    |
       health health health
       check  check  check
       FAIL   FAIL   FAIL
```

**Problem:** Service still initializing at 15s, health checks fail

### ✅ After: 45 Second Start Period

```
|─────── 45s startup period ─────│
|Service initializing             |
|TypeScript building              |
|Symlinks creating                |
|Libraries verifying              |
                                  |
                                  |─ 10s ─|─ 10s ─|─ 10s ─|
                                  | retry | retry | retry | HEALTHY ✅
                                  |  1    │  2    │  3    |
                                  health health health
                                  check  check  check
                                  PASS   PASS   PASS
```

**Solution:** Allows proper initialization before first health check

---

## Summary of Changes

### Docker Compose Changes

```yaml
# Service with Replicas (OLD - BROKEN)
broker:
  replicas: 2
  ports:
    - "0.0.0.0:3001:3001"  ❌ Both replicas → same port
  healthcheck:
    start_period: 15s       ❌ Too short for build
    retries: 3              ❌ Not enough attempts

# Service with Replicas (NEW - FIXED)
broker:
  replicas: 2
  ports:
    - "0.0.0.0:3001-3002:3001"  ✅ Range for replicas
  healthcheck:
    start_period: 45s           ✅ Sufficient for build
    retries: 5                  ✅ More tolerance
```

---

**Visual guide complete!** 📊

For deployment instructions: `SERVER_DEPLOYMENT_QUICK_GUIDE.md`

