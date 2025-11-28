# Dataspace Platform - Setup Guide

## Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm/pnpm**: v9.0.0 or higher
- **Docker**: Latest version
- **Docker Compose**: v2.0 or higher
- **VS Code**: (recommended) with extensions listed in `.vscode/extensions.json`

## Installation

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd dataspace

# Install dependencies
npm install
# or with pnpm
pnpm install
```

### 2. Start Development Environment

```bash
# Start PostgreSQL and Adminer
npm run dev:up

# Wait for services to be healthy
# Check: http://localhost:8080 (Adminer)
```

### 3. Database Initialization

```bash
# Run migrations (when implemented)
npm run migrate:latest

# Seed initial data (when implemented)
npm run seed:initial
```

## Running Services

### Option 1: Run All Services at Once

```bash
# Terminal 1: Start CTS services
npm run dev:cts

# Terminal 2: Start Connector
npm run dev:connector
```

### Option 2: Run Individual Services

Each service can be run independently:

```bash
# IDP Service
npm run dev --workspace=services/cts/idp

# Broker Service
npm run dev --workspace=services/cts/broker

# Hub Service
npm run dev --workspace=services/cts/hub

# TrustCore Policy
npm run dev --workspace=services/cts/trustcore-policy

# TrustCore Contract
npm run dev --workspace=services/cts/trustcore-contract

# TrustCore Compliance
npm run dev --workspace=services/cts/trustcore-compliance

# TrustCore Ledger
npm run dev --workspace=services/cts/trustcore-ledger

# Clearing Service
npm run dev --workspace=services/cts/clearing

# AppStore Service
npm run dev --workspace=services/cts/appstore

# Connector
npm run dev --workspace=services/connector
```

## Service Health Checks

Verify all services are running:

```bash
# IDP
curl http://localhost:3000/health

# Broker
curl http://localhost:3001/health

# Hub
curl http://localhost:3002/health

# TrustCore Policy
curl http://localhost:3003/health

# TrustCore Contract
curl http://localhost:3004/health

# TrustCore Compliance
curl http://localhost:3005/health

# TrustCore Ledger
curl http://localhost:3006/health

# Clearing
curl http://localhost:3007/health

# AppStore
curl http://localhost:3008/health

# Connector
curl http://localhost:3009/connector/health
```

## Database Management

### Using Adminer

1. Open http://localhost:8080
2. Login with:
   - Server: `postgres`
   - Username: `dataspace`
   - Password: `dataspace-dev-password`
   - Database: `dataspace_dev`

### Using psql

```bash
# Connect to database
psql -h localhost -U dataspace -d dataspace_dev

# Common commands
\dt                    # List tables
\d table_name          # Describe table
SELECT * FROM table;   # Query data
```

## Code Quality

### Linting

```bash
npm run lint
```

### Code Formatting

```bash
npm run fmt
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests for specific service
npm test --workspace=services/cts/idp

# Watch mode
npm test -- --watch
```

## Building for Production

### Build All Services

```bash
npm run build
```

### Build Specific Service

```bash
npm run build --workspace=services/cts/idp
```

## Stopping Services

### Stop Database Services

```bash
npm run dev:down
```

### Kill All Node Processes

```bash
# Unix/Linux/macOS
pkill -f "node --loader tsx"

# Windows
taskkill /F /IM node.exe
```

## Environment Configuration

Create a `.env` file in the root directory:

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dataspace_dev
DB_USER=dataspace
DB_PASSWORD=dataspace-dev-password

# Services
NODE_ENV=development
LOG_LEVEL=debug

# Feature flags
ENABLE_TRACING=false
ENABLE_METRICS=true
```

## Troubleshooting

### Port Already in Use

If a port is already in use, you can either:

1. Change the port in the service's `src/index.ts`
2. Kill the process using that port:
   ```bash
   # Unix/Linux/macOS
   lsof -ti :3000 | xargs kill -9

   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   ```

### Database Connection Errors

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Check logs
docker logs dataspace-postgres

# Restart PostgreSQL
npm run dev:down
npm run dev:up
```

### Module Not Found Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

### TypeScript Compilation Errors

```bash
# Clear build cache and rebuild
rm -rf dist
npm run build
```

## VS Code Setup

1. Install recommended extensions:
   ```bash
   # Extensions are listed in .vscode/extensions.json
   ```

2. VS Code should automatically suggest installing them

3. Verify settings in `.vscode/settings.json` are applied

## Next Steps

- Read [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
- Check individual service README files in their directories
- Review schema definitions in `/schema/`
- See [API Documentation](#) for endpoint specifications

---

For issues or questions, please refer to the troubleshooting section or create an issue in the repository.
