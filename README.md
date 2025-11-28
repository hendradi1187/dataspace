# Dataspace Platform

A scalable, schema-first monorepo for managing Core Trust Services (CTS) and Connector edge nodes in a federated dataspace ecosystem.

## Architecture Overview

**Core Components:**
- **Core Trust Services (CTS)**: Centralized control plane managing identity, policy, contracts, compliance, and settlement
  - IDP (Identity Provider)
  - Broker (Participant & Dataset Discovery)
  - Hub (Vocabulary & Schema Registry)
  - TrustCore Policy Authority
  - TrustCore Contract Authority
  - TrustCore Compliance & Obligation
  - TrustCore Ledger (Delivery & Settlement)
  - Clearing (Pricing, Metering, Invoice, Payment)
  - AppStore (App Catalog & Entitlement)

- **Connector**: Edge node (data plane) supporting providers and consumers
  - Metadata Management
  - Policy & Contract Handling
  - Authentication Protocol
  - App Management
  - Delivery Gateway

## Project Structure

```
dataspace/
├── services/                    # Microservices
│   ├── cts/                     # Core Trust Services
│   │   ├── idp/
│   │   ├── broker/
│   │   ├── hub/
│   │   ├── trustcore-policy/
│   │   ├── trustcore-contract/
│   │   ├── trustcore-compliance/
│   │   ├── trustcore-ledger/
│   │   ├── clearing/
│   │   └── appstore/
│   └── connector/               # Connector (unified process)
│       ├── metadata/
│       ├── policy-contract/
│       ├── auth-protocol/
│       ├── app-management/
│       └── delivery/
├── apps/
│   └── frontend/                # React Dashboard
│       ├── src/
│       │   ├── components/      # Reusable UI components
│       │   ├── pages/           # Page components
│       │   ├── layouts/         # Layout components
│       │   ├── stores/          # Zustand state management
│       │   ├── services/        # API service layer
│       │   ├── types/           # TypeScript types
│       │   ├── utils/           # Utility functions
│       │   └── styles/          # CSS and Tailwind
│       └── public/              # Static assets
├── libs/                        # Shared libraries
│   ├── validation/              # AJV validators
│   ├── db/                      # Database utilities
│   ├── clients/                 # OpenAPI clients
│   └── messages/                # Type definitions
├── schema/                      # Schema definitions
│   ├── openapi/                 # API specifications
│   ├── jsonschema/              # JSON Schema definitions
│   ├── jsonld/                  # JSON-LD contexts
│   └── shacl/                   # RDF validation
├── db/                          # Database
│   ├── ddl/                     # DDL scripts
│   └── migrations/              # Database migrations
├── infra/                       # Infrastructure
│   ├── docker/                  # Docker configurations
│   └── k8s/                     # Kubernetes manifests
├── ops/                         # Operations
│   ├── ci/                      # CI/CD pipelines
│   └── observability/           # Monitoring configs
├── tools/                       # Utilities
│   ├── generators/              # Code generation tools
│   └── scripts/                 # Helper scripts
├── docs/                        # Documentation
├── PROMPTS/                     # AI generation prompts
├── .vscode/                     # VS Code configuration
└── docker-compose.dev.yml       # Development Docker Compose
```

## Quick Start

### Prerequisites
- Node.js >= 18.0.0
- Docker & Docker Compose
- npm/pnpm

### Setup

1. **Install dependencies**
```bash
npm install
```

2. **Start PostgreSQL and Adminer**
```bash
npm run dev:up
```

Database will be available at:
- **PostgreSQL**: `localhost:5432`
- **Adminer**: `http://localhost:8080`

Default credentials:
- User: `dataspace`
- Password: `dataspace-dev-password`
- Database: `dataspace_dev`

3. **Start Frontend (React Dashboard)**
```bash
npm run dev --workspace=apps/frontend
```

Frontend will be available at: `http://localhost:5173`

4. **Start Backend Services**

In separate terminals:
```bash
# Terminal 1: Start IDP
npm run dev --workspace=services/cts/idp

# Terminal 2: Start Broker
npm run dev --workspace=services/cts/broker

# Terminal 3: Start Connector (or run all at once)
npm run dev --workspace=services/connector
```

5. **Stop services**
```bash
npm run dev:down
```

## Development

### Service Ports (Dev)

| Service | Port | Path |
|---------|------|------|
| IDP | 3000 | `/idp` |
| Broker | 3001 | `/broker` |
| Hub | 3002 | `/hub` |
| TrustCore Policy | 3003 | `/trustcore-policy` |
| TrustCore Contract | 3004 | `/trustcore-contract` |
| TrustCore Compliance | 3005 | `/trustcore-compliance` |
| TrustCore Ledger | 3006 | `/trustcore-ledger` |
| Clearing | 3007 | `/clearing` |
| AppStore | 3008 | `/appstore` |
| Connector | 3009 | `/connector` |

### Scripts

```bash
# Linting
npm run lint

# Format code
npm run fmt

# Generate OpenAPI clients
npm run gen:clients
```

## Frontend

### React Dashboard

Modern, responsive web dashboard for managing the Dataspace platform.

**Location**: `/apps/frontend/`

**Technology Stack**:
- React 18 + TypeScript
- Vite (fast build)
- React Router (routing)
- Zustand (state management)
- Tailwind CSS (styling)
- Lucide React (icons)

**Features**:
- Real-time service status monitoring
- Participant management
- Dataset catalog
- Policy and contract management
- Connector configuration
- Toast notifications
- Responsive design

**Development**:
```bash
# Start dev server (http://localhost:5173)
npm run dev --workspace=apps/frontend

# Build for production
npm run build --workspace=apps/frontend

# Type checking
npm run type-check --workspace=apps/frontend
```

**Documentation**: See [apps/frontend/README.md](./apps/frontend/README.md) and [apps/frontend/DEVELOPMENT.md](./apps/frontend/DEVELOPMENT.md)

## Schema-First Design

All payloads and contracts follow a schema-first approach:

- **OpenAPI**: `/schema/openapi/dataspace-openapi-components-v1.1.yaml`
- **JSON Schema**: `/schema/jsonschema/per-message/`
- **Validation**: AJV validators in `/libs/validation`

## Database

Database migrations and DDL scripts are located in `/db/`:
- **DDL**: `/db/ddl/` - Authoritative schema definitions
- **Migrations**: `/db/migrations/` - Version-controlled migrations

## Contributing

Each service must include:
- `/src/index.ts` - Fastify bootstrap
- `/src/routes/` - Feature routes
- `/src/plugins/` - Plugin configurations
- `/src/repositories/` - Database access layer
- `/src/validators/` - Schema validation
- `/src/models/` - Domain types
- `/src/events/` - Message publishers/subscribers
- `/src/config/` - Configuration management
- `/test/` - Tests and Thunder collections

## Extensibility

- **New Service**: Create folder in `/services/` with standard structure
- **New Schema**: Add JSON Schema in `/schema/jsonschema/per-message/`
- **New Table**: Add DDL in `/db/ddl/` and migration
- **Naming Convention**: `trustcore-*` for CTS, `connector-*` for edge

## License

MIT

## Maintainer

GhanemTech Architecture Team

---

**Version**: 1.0.0
**Last Updated**: 2024
# dataspace
