# Dataspace Platform Architecture

## Overview

The Dataspace Platform is a distributed system composed of:

1. **Core Trust Services (CTS)**: Centralized control plane providing governance, identity, policy, contracts, compliance, and settlement functions
2. **Connector**: Distributed edge nodes representing data providers and consumers

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Dataspace Ecosystem                          │
└─────────────────────────────────────────────────────────────────┘
       │                          │                          │
       ▼                          ▼                          ▼
  ┌─────────┐            ┌──────────────┐            ┌─────────┐
  │ CTS     │            │ CTS Services │            │CTS Auth │
  │ Control │            │ (9 modules)  │            │ Center  │
  │  Plane  │            │              │            │         │
  └─────────┘            └──────────────┘            └─────────┘
       │                          │                          │
       └──────────────┬───────────┴──────────────┬───────────┘
                      │                          │
        ┌─────────────┴──────────┬───────────────┴────────┐
        │                        │                        │
        ▼                        ▼                        ▼
    ┌────────────┐         ┌──────────┐         ┌────────────┐
    │ Connector  │         │Connector │         │ Connector  │
    │  Provider  │         │ Consumer │         │  Broker    │
    │ Node 1     │         │ Node 1   │         │            │
    └────────────┘         └──────────┘         └────────────┘
```

## CTS Services (9 Modules)

### 1. Identity Provider (IDP) - Port 3000
- DAPS-compatible authentication
- Certificate and token issuance
- Identity management

### 2. Broker - Port 3001
- Participant discovery
- Dataset registry and search
- Service catalog

### 3. Hub - Port 3002
- Vocabulary and ontology management
- Schema registry
- Context definitions

### 4. TrustCore Policy - Port 3003
- Policy definition and management
- Policy enforcement rules
- Access control policies

### 5. TrustCore Contract - Port 3004
- Contract templates
- Contract negotiation
- Contract versioning

### 6. TrustCore Compliance - Port 3005
- Compliance rule management
- Obligation tracking
- Usage monitoring

### 7. TrustCore Ledger - Port 3006
- Delivery attestation
- Settlement records
- Audit trail

### 8. Clearing - Port 3007
- Pricing and metering
- Invoice generation
- Payment processing

### 9. AppStore - Port 3008
- Application catalog
- Entitlement management
- App deployment and updates

## Connector (Edge Node) - Port 3009

### Subcomponents

#### Metadata (A+B)
- Asset cataloging and profiling
- Schema profiling
- Vocabulary alignment
- Publication policies
- Self-description generation
- Version management

#### Policy & Contract (C)
- Draft contract management
- CTS mirror synchronization
- Contract fulfillment
- Authorization and token management

#### Authentication Protocol (D)
- OIDC/OAuth2 support
- DAPS/Verifiable Credential support
- mTLS keystore management
- Token caching

#### App Management (E)
- Local application registry
- Entitlement verification
- Application updates and rollback
- App lifecycle management

#### Delivery (UC5)
- Data delivery gateway
- Provenance tracking
- Evidence collection
- Data transfer orchestration

## Data Flow

### Data Exchange Flow

```
1. Discovery Phase
   Connector → Broker (search datasets)

2. Contract Negotiation Phase
   Connector ↔ TrustCore-Contract (draft & sign)

3. Policy Evaluation Phase
   Connector → TrustCore-Policy (check access)

4. Authentication Phase
   Connector → IDP (request token)

5. Data Transfer Phase
   Provider Connector → Consumer Connector (transfer data)

6. Settlement Phase
   Connectors → Clearing (metering & billing)
   Connectors → TrustCore-Ledger (attestation)
```

## Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Fastify
- **Language**: TypeScript
- **Database**: PostgreSQL

### Validation
- **JSON Schema**: AJV
- **API Spec**: OpenAPI 3.1
- **RDF Validation**: SHACL

### Deployment
- **Containerization**: Docker
- **Orchestration**: Docker Compose (dev), Kubernetes (prod)
- **CI/CD**: GitHub Actions / GitLab CI

## Design Principles

1. **Schema-First**: All APIs and messages defined via schemas
2. **Migration-First**: Database changes tracked and versioned
3. **Contract-Safe**: Strong typing and validation
4. **Extensible**: Plugin-based architecture
5. **Observable**: Comprehensive logging and monitoring

## Security Considerations

- mTLS for inter-service communication
- JWT/VC for identity and authorization
- Policy-based access control
- Encrypted data transfer
- Audit logging of all operations
- Compliance with GDPR/Data Protection regulations

---

For detailed information on specific services, see the service-specific documentation in their respective `/docs` folders.
