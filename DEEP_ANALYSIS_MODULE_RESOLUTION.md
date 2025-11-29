# Deep Analysis: Module Resolution Error in pnpm Workspace

## Problem Summary

Error persists across multiple services:
```
Cannot find module '/app/services/cts/trustcore-policy/node_modules/@dataspace/db/dist/index.js'
Cannot find module '/app/services/cts/trustcore-compliance/node_modules/@dataspace/db/dist/index.js'
```

This is happening even after Dockerfile fix because the ROOT CAUSE is different.

---

## Root Cause Analysis 🔍

### How pnpm Workspace Resolution Works

1. **Build Time (TypeScript Compilation)**
   ```typescript
   // In service source code
   import { pool } from '@dataspace/db'

   // tsconfig.json paths mapping:
   "paths": {
     "@dataspace/db": ["./libs/db/src"]
   }

   // TypeScript compiler resolves to: ./libs/db/src/index.ts
   // Compiles to: ./libs/db/dist/index.js
   ```

2. **Runtime (Node.js Execution)**
   ```
   Node.js looks for @dataspace/db in:
   1. node_modules/@dataspace/db/package.json
   2. Reads package.json "exports" or "main"
   3. Loads the actual file

   BUT: Node.js DOES NOT read tsconfig.json paths!
   Paths are ONLY for TypeScript compilation!
   ```

### The Real Issue

**pnpm workspace symlinks NOT created properly in Docker**

When you run `pnpm install` in a workspace:
```
/app/node_modules/.pnpm/@dataspace+db@1.0.0/
  ├── node_modules/
  │   └── @dataspace/
  │       └── db/ (symlink to dist folder)
  └── package/ (actual library)

/app/services/cts/trustcore-policy/node_modules/@dataspace/db/
  └── (symlink to /app/node_modules/.pnpm/@dataspace+db@1.0.0/node_modules/@dataspace/db)
```

**In Docker**, these symlinks NOT being created because:
1. ❌ Services getting individual node_modules
2. ❌ Libs not properly symlinked in workspace
3. ❌ pnpm install not running in correct context

---

## The Fix: Three-Part Solution

### Part 1: Root tsconfig.json paths MUST match package.json exports

**Current (WRONG)**:
```json
{
  "paths": {
    "@dataspace/db": ["./libs/db/src"]  // Points to SOURCE
  }
}
```

**Should be (CORRECT)**:
```json
{
  "paths": {
    "@dataspace/db": ["./libs/db"]  // Points to PACKAGE, not src
  }
}
```

Why? Because pnpm resolves via package.json "main" or "exports", not direct paths!

### Part 2: Dockerfile MUST preserve pnpm symlinks

**Current (PROBLEMATIC)**:
```dockerfile
# Copies node_modules but loses symlink structure
COPY --from=builder /app/node_modules ./node_modules
```

**Should be (CORRECT)**:
```dockerfile
# Keep full .pnpm cache to preserve symlinks
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.pnpm-store ./.pnpm-store  # NOT APPLICABLE in pnpm v8+

# OR better: Use pnpm install --prod --no-frozen in runtime
# to rebuild symlinks properly
```

### Part 3: Ensure libs are in node_modules AND built

**Current (MIGHT BE MISSING)**:
```dockerfile
# Libs might not be linked in node_modules
```

**Should ensure**:
```bash
# After pnpm install, check:
ls /app/node_modules/@dataspace/

# Should show symlinks:
@dataspace/db -> ../../libs/db
@dataspace/validation -> ../../libs/validation
```

---

## Complete Fix Implementation

### Step 1: Fix Root tsconfig.json

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "moduleResolution": "node",
    "paths": {
      "@dataspace/*": ["./libs/*/src"]  // Better: use glob
      // OR be more explicit:
      // "@dataspace/db": ["./libs/db"]
      // "@dataspace/validation": ["./libs/validation"]
    }
  }
}
```

### Step 2: Ensure Service tsconfig properly extends

```json
{
  "extends": "../../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "baseUrl": "../../../",  // IMPORTANT: Set correct baseUrl!
    "paths": {}  // Let parent tsconfig handle it
  }
}
```

### Step 3: Fix Dockerfile for proper workspace installation

```dockerfile
# Stage 1: Builder
FROM node:20-alpine AS builder

RUN npm install -g pnpm@latest

WORKDIR /app

# Copy workspace files FIRST
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./

# Copy all package.json files
COPY services/cts/*/package.json ./services/cts/
COPY libs/*/package.json ./libs/

# CRITICAL: Install with --recursive to ensure symlinks
RUN pnpm install --frozen-lockfile

# Check symlinks were created
RUN ls -la /app/node_modules/@dataspace/ || echo "Warning: no @dataspace symlinks"

# Copy all source
COPY services ./services
COPY libs ./libs

# Build libs in order
RUN pnpm -C libs/db run build && \
    pnpm -C libs/validation run build && \
    pnpm -C libs/clients run build && \
    pnpm -C libs/messages run build

# Build service
RUN pnpm -C services/cts/$SERVICE_NAME run build

# Stage 2: Runtime
FROM node:20-alpine

RUN npm install -g pnpm@latest

WORKDIR /app

# Copy workspace files
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./

# Copy all source (needed for pnpm to create symlinks)
COPY --from=builder /app/services ./services
COPY --from=builder /app/libs ./libs

# Copy node_modules from builder
COPY --from=builder /app/node_modules ./node_modules

# CRITICAL: Recreate pnpm symlinks for workspace packages
RUN pnpm install --prod --frozen-lockfile

# Verify symlinks exist
RUN ls -la /app/node_modules/@dataspace/
# Should show: db -> ../../libs/db, validation -> ../../libs/validation, etc

USER nodejs

ENTRYPOINT ["dumb-init", "--"]
EXPOSE $PORT
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:$PORT/health || exit 1

CMD ["pnpm", "-C", "services/cts/$SERVICE_NAME", "start"]
```

---

## Key Insights

### Why Original Fix Didn't Work Completely

1. ✅ We fixed lib build order
2. ❌ But didn't account for pnpm workspace symlink resolution
3. ❌ tsconfig.json paths are ONLY for TypeScript, not runtime!
4. ❌ Runtime needs actual symlinks in node_modules

### How pnpm.lock Resolves Workspaces

```yaml
# pnpm-lock.yaml
dependencies:
  '@dataspace/db': workspace:*

# This tells pnpm:
# "Find @dataspace/db in the workspace, not npm registry"
# Create symlinks so Node.js can find it
```

### Why Docker Makes It Harder

```
Local development:
  pnpm install
  ↓
  Creates node_modules with workspace symlinks
  ↓
  Both TS and Node.js work

Docker build:
  COPY pnpm-lock.yaml
  RUN pnpm install
  ↓
  Creates node_modules with workspace symlinks
  ↓
  Both work... UNLESS we:
  - Don't copy source before install (symlinks fail)
  - Don't preserve symlinks when copying
  - Don't recreate symlinks in runtime stage
```

---

## Debugging Checklist

### In Docker Build, After `pnpm install`:

```bash
# Check if workspace packages are symlinked
ls -la /app/node_modules/@dataspace/

# Expected output:
# lrwxrwxrwx  1 root root   19 Nov 29 10:00 db -> ../../libs/db
# lrwxrwxrwx  1 root root   31 Nov 29 10:00 validation -> ../../libs/validation

# If not symlinks, pnpm install didn't work!
```

### In Runtime Container:

```bash
# Check symlinks survived copy
docker-compose exec trustcore-policy ls -la /app/node_modules/@dataspace/

# Check if built libs exist
docker-compose exec trustcore-policy ls -la /app/libs/db/dist/

# Check what @dataspace/db points to
docker-compose exec trustcore-policy readlink /app/node_modules/@dataspace/db
```

---

## Solution Priority

1. **MUST DO**: Verify pnpm symlinks created during `pnpm install`
2. **SHOULD DO**: Fix tsconfig.json paths (better practice)
3. **SHOULD DO**: Ensure source files copied before install

---

## Summary

| Issue | Root Cause | Fix |
|-------|-----------|-----|
| Module not found | pnpm symlinks not created | Ensure source copied before install |
| Runtime resolution | Node.js uses symlinks not tsconfig | Don't rely on tsconfig paths at runtime |
| Docker lost symlinks | COPY doesn't preserve symlinks | Recreate with `pnpm install --prod` |

The key: **pnpm workspace resolution REQUIRES symlinks in node_modules AND source code present for pnpm to create those symlinks**.

