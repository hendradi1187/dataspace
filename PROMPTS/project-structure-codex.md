# Dataspace Project Structure - CodeX Generator Prompt

## Context

This prompt is used to generate and manage the Dataspace platform project structure using CodeX, KiloCode, or BMAD generators.

## Source Specification

**Reference Document**: `DS-project-structure.md`

This specification defines a scalable, schema-first monorepo architecture for a Dataspace platform with Core Trust Services (CTS) and Connector edge nodes.

## Generation Instructions

### 1. Folder Structure

Generate complete folder hierarchy exactly as specified:
- **services/cts/** - 9 microservices (IDP, Broker, Hub, TrustCore×4, Clearing, AppStore)
- **services/connector/** - 5 subcomponents (Metadata, Policy-Contract, Auth-Protocol, App-Management, Delivery)
- **libs/** - 4 shared libraries (validation, db, clients, messages)
- **schema/** - 4 schema directories (openapi, jsonschema, jsonld, shacl)
- **db/** - DDL and migrations
- **infra/** - Docker, Kubernetes
- **ops/** - CI/CD and observability
- **tools/** - Generators and scripts
- **docs/** - Documentation
- **PROMPTS/** - Generator prompts

### 2. Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Fastify
- **Language**: TypeScript
- **Database**: PostgreSQL
- **Validation**: AJV (JSON Schema)
- **Containerization**: Docker
- **Orchestration**: Docker Compose (dev)

### 3. Core Files to Generate

#### Root Level

- `package.json` - workspace configuration with all services and libraries
- `tsconfig.json` - TypeScript configuration with path aliases
- `docker-compose.dev.yml` - PostgreSQL + Adminer setup
- `README.md` - Project overview and quick start
- `.eslintrc.json` - Linting rules
- `.prettierrc` - Code formatting
- `.gitignore` - Git exclusions

#### Per Service

Each service MUST include:
```
services/<service>/
├── src/
│   ├── index.ts              # Fastify bootstrap with /health endpoint
│   ├── routes/               # API endpoints
│   ├── services/             # Business logic
│   ├── repositories/         # Database layer
│   ├── models/               # Domain types
│   ├── validators/           # AJV schema validation
│   ├── events/               # Event publishers/subscribers
│   ├── config/               # Configuration management
│   └── plugins/              # Fastify plugins (db, validation, etc)
├── test/
│   ├── health.spec.ts        # Health endpoint test
│   ├── routes.spec.ts        # Route tests
│   └── integration.spec.ts    # Integration tests
├── package.json              # Dependencies (Fastify, AJV, pg, etc)
└── tsconfig.json             # TypeScript config
```

### 4. Service Port Mapping (Dev)

| Service | Port | Path |
|---------|------|------|
| IDP | 3000 | `/idp` |
| Broker | 3001 | `/broker` |
| Hub | 3002 | `/hub` |
| TrustCore-Policy | 3003 | `/trustcore-policy` |
| TrustCore-Contract | 3004 | `/trustcore-contract` |
| TrustCore-Compliance | 3005 | `/trustcore-compliance` |
| TrustCore-Ledger | 3006 | `/trustcore-ledger` |
| Clearing | 3007 | `/clearing` |
| AppStore | 3008 | `/appstore` |
| Connector | 3009 | `/connector` |

### 5. Schema Structure

- **OpenAPI**: `/schema/openapi/dataspace-openapi-components-v1.1.yaml`
- **JSON Schema**: `/schema/jsonschema/per-message/` (1 file per message type)
- **Master Bundle**: `/schema/jsonschema/master/` (combined schemas)
- **JSON-LD**: `/schema/jsonld/` (context files)
- **SHACL**: `/schema/shacl/` (RDF validation)

### 6. Database

**DDL** (`/db/ddl/`):
- `00-initial-schema.sql` - Initial schema with audit, config, participants, datasets, policies, contracts

**Migrations** (`/db/migrations/`):
- Flyway/Liquibase compatible format
- Version-controlled: `NNN_description.sql`
- Include rollback instructions

### 7. Package Configuration

All `package.json` files must include:

```json
{
  "type": "module",
  "scripts": {
    "dev": "node --loader tsx src/index.ts",
    "build": "tsc",
    "test": "vitest",
    "lint": "eslint src test",
    "fmt": "prettier -w src test"
  },
  "dependencies": {
    "fastify": "^4.25.2",
    "@fastify/cors": "^8.4.2",
    "@fastify/helmet": "^11.1.1",
    "pino": "^8.17.2"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "tsx": "^4.7.0",
    "vitest": "^1.1.0",
    "eslint": "^8.56.0",
    "prettier": "^3.1.1"
  }
}
```

### 8. VS Code Setup

`.vscode/extensions.json` - Recommended extensions:
- dbaeumer.vscode-eslint
- esbenp.prettier-vscode
- rangav.vscode-thunder-client
- ms-vscode.vscode-typescript-next
- GitHub.copilot
- eamodio.gitlens
- ms-docker.docker
- cweijan.vscode-database-client2
- redhat.vscode-yaml
- 42Crunch.vscode-openapi

### 9. Documentation

Create comprehensive docs:
- `docs/ARCHITECTURE.md` - System design and component descriptions
- `docs/SETUP.md` - Installation and running guide
- `docs/API.md` - API endpoints and examples
- `README.md` - Quick start and overview
- `CONTRIBUTING.md` - Contribution guidelines

### 10. Scripts in Root package.json

```json
{
  "scripts": {
    "dev:up": "docker compose -f docker-compose.dev.yml up -d",
    "dev:down": "docker compose -f docker-compose.dev.yml down -v",
    "lint": "eslint .",
    "fmt": "prettier -w .",
    "gen:clients": "openapi-generator-cli generate -i schema/openapi/dataspace-openapi-components-v1.1.yaml -g typescript-axios -o libs/clients"
  }
}
```

## Output Validation Checklist

- [ ] All folder paths match specification
- [ ] All services have required source structure
- [ ] All services expose `/health` endpoint
- [ ] All package.json files configured correctly
- [ ] TypeScript configuration includes path aliases
- [ ] Database schema and migrations present
- [ ] Documentation complete and accurate
- [ ] .vscode configuration ready
- [ ] Project can run: `npm install && npm run dev:up`
- [ ] All services start on correct ports

## Post-Generation Steps

1. **Run installation**:
   ```bash
   npm install
   ```

2. **Start development environment**:
   ```bash
   npm run dev:up
   ```

3. **Verify all services**:
   ```bash
   curl http://localhost:3000/health  # IDP
   curl http://localhost:3001/health  # Broker
   # ... etc
   ```

4. **Integrate with PRD**: Ready for Iteration 1 development per PRD-CodeX-v1.2.md

## Notes

- Structure is schema-first: all APIs must align with `/schema/openapi/`
- Structure is migration-first: all DB changes via `/db/migrations/`
- Connector can run as unified process (default, port 3009) or split into multiple services
- All TypeScript must be strict mode
- All code must pass linting and formatting checks

---

**Generated for**: Dataspace Platform v1.0.0
**Architecture Owner**: GhanemTech (Fendi Yuniawan Aditya)
**Last Updated**: 2024
