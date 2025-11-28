# Dataspace Database Schema Documentation

**Version:** 1.0.0
**Created:** November 2024
**Database:** PostgreSQL 15+
**Credentials:** postgres/postgres@localhost:5432/dataspace_dev

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Entity Relationship Diagram](#entity-relationship-diagram)
3. [Table Definitions](#table-definitions)
4. [Field Descriptions](#field-descriptions)
5. [Relationships and Foreign Keys](#relationships-and-foreign-keys)
6. [Indexes](#indexes)
7. [Setup Instructions](#setup-instructions)

---

## Overview

The Dataspace Database Schema consists of **15 core tables** organized into logical groups:

### **Core Management Tables** (1-8)
- `participants` - Organizations in the dataspace
- `datasets` - Data assets
- `schemas` - Data structure definitions
- `policies` & `policy_rules` - Access control rules
- `contracts` - Data sharing agreements
- `audit_logs` - Activity tracking

### **Transaction & Settlement Tables** (9-10)
- `transactions` - Immutable ledger of data access
- `clearing_records` - Settlement records between parties

### **Compliance & Monitoring Tables** (11-12)
- `compliance_records` - Audit findings
- `service_health` - System health monitoring

### **Data Connection Tables** (13-14)
- `connectors` - Data source connections
- `apps` - Connector applications

### **Reference Tables** (15-16)
- `vocabularies` - Semantic vocabularies
- `system_config` - System settings

---

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     DATASPACE ARCHITECTURE                       │
└─────────────────────────────────────────────────────────────────┘

                         ┌──────────────┐
                         │ Participants │ (organizations)
                         │              │
                         │ • id (PK)    │
                         │ • did        │ ◄─────┐
                         │ • name       │       │
                         │ • status     │       │
                         └──────────────┘       │
                            │   │   │           │
               ┌────────────┬┘   │   └─────┬───────┬─────────┐
               │            │    │         │       │         │
               ▼            ▼    ▼         ▼       ▼         ▼
          ┌────────┐  ┌────────────┐ ┌─────────┐ ┌──────────┐
          │Datasets│  │Contracts   │ │Clearing │ │Connectors│
          │        │  │            │ │Records  │ │          │
          │• id    │  │• id        │ │         │ │• id      │
          │• name  │  │• provider  │ │• contract│ │• name    │
          │• status│  │• consumer  │ │• amount │ │• status  │
          │• schema├──┤• dataset   │ │• status │ │          │
          │  ref   │  │• policy    │ │         │ │          │
          │        │  │• status    │ │         │ │          │
          │        │  │• expires   │ │         │ │          │
          └────────┘  └────────────┘ └─────────┘ └──────────┘
               │            │  │           │
               │            │  │           │
               ▼            ▼  ▼           ▼
          ┌──────────┐ ┌──────────┐ ┌────────┐
          │Schemas   │ │Policies  │ │ Audit  │
          │          │ │          │ │ Logs   │
          │• id (PK) │ │• id (PK) │ │        │
          │• name    │ │• name    │ │• action│
          │• version │ │• rules[] │ │• status│
          │• format  │ │• status  │ │        │
          │• content │ │          │ │        │
          └──────────┘ └──────────┘ └────────┘
                             │
                             ▼
                     ┌─────────────────┐
                     │ Policy Rules    │
                     │                 │
                     │• id             │
                     │• condition      │
                     │• effect (allow/ │
                     │  deny)          │
                     │• priority       │
                     └─────────────────┘

          ┌──────────────────┐    ┌──────────────────┐
          │Transactions      │    │Compliance Records│
          │(Ledger)          │    │                  │
          │                  │    │• id              │
          │• id              │    │• dataset_id      │
          │• dataset_id      │    │• findings        │
          │• participant_id  │    │• risk_level      │
          │• action          │    │• status          │
          │• amount          │    │                  │
          │• timestamp       │    │                  │
          └──────────────────┘    └──────────────────┘

          ┌─────────────────┐      ┌──────────────────┐
          │Vocabularies     │      │Service Health    │
          │                 │      │                  │
          │• id             │      │• id              │
          │• namespace      │      │• service_name    │
          │• version        │      │• status          │
          │• format         │      │• port            │
          │• content        │      │• last_check      │
          └─────────────────┘      └──────────────────┘

          ┌──────────────┐         ┌──────────────┐
          │Connectors    │         │Apps          │
          │              │         │              │
          │• id          │────────►│• id          │
          │• name        │         │• name        │
          │• source_type │         │• version     │
          │• status      │         │• status      │
          └──────────────┘         └──────────────┘
```

---

## Table Definitions

### 1. **audit_logs**
Activity and change tracking for compliance and security.

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,                           -- User performing the action
  user_name VARCHAR(255),                 -- Username for audit trail
  action VARCHAR(50) NOT NULL,            -- CREATE, UPDATE, DELETE, etc.
  resource_type VARCHAR(100) NOT NULL,    -- Table/entity type affected
  resource_id UUID,                       -- ID of affected entity
  resource_name VARCHAR(255),             -- Name of affected entity
  details TEXT,                           -- Additional context
  status VARCHAR(20) DEFAULT 'success',   -- success or failure
  ip_address VARCHAR(45),                 -- Source IP
  created_at TIMESTAMP WITH TIME ZONE     -- When action occurred
);
```

**Indexed Fields:** user_id, resource_type, resource_id, action, status, created_at

---

### 2. **participants**
Organizations and entities participating in the dataspace.

```sql
CREATE TABLE participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  did VARCHAR(255) UNIQUE NOT NULL,       -- W3C Decentralized Identity
  name VARCHAR(255) NOT NULL,             -- Organization name
  description TEXT,                       -- Organization description
  endpoint_url VARCHAR(255),              -- API endpoint for this participant
  public_key TEXT,                        -- For digital signatures
  status VARCHAR(50) DEFAULT 'active',    -- active, inactive, suspended
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);
```

**Indexed Fields:** did, status, name

**Used by:** datasets, contracts (provider/consumer), clearing_records

---

### 3. **datasets**
Data assets owned by participants, available for sharing.

```sql
CREATE TABLE datasets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_id UUID NOT NULL,           -- Owner/Publisher
  name VARCHAR(255) NOT NULL,             -- Dataset name
  description TEXT,                       -- What the data contains
  schema_id UUID,                         -- Reference to data structure
  status VARCHAR(50) DEFAULT 'draft',     -- draft, published, archived
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);
```

**Indexed Fields:** participant_id, schema_id, status, name

**Foreign Keys:**
- `participant_id` → participants.id (CASCADE DELETE)
- `schema_id` → schemas.id (SET NULL on delete)

**Used by:** contracts, transactions, compliance_records

---

### 4. **schemas**
Data structure definitions in multiple formats (JSON-Schema, SHACL, JSON-LD).

```sql
CREATE TABLE schemas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  namespace VARCHAR(255) NOT NULL,       -- e.g., 'com.example.customer'
  version VARCHAR(50) NOT NULL,          -- Semantic versioning
  format VARCHAR(50) NOT NULL,           -- json-schema, shacl, jsonld
  content JSONB NOT NULL,                -- Actual schema definition
  status VARCHAR(50) DEFAULT 'draft',    -- draft, published, deprecated
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);
```

**Indexed Fields:** namespace, status, format
**Unique Constraint:** (namespace, name, version)

**Used by:** datasets (schema_id)

---

### 5. **policies**
Access control and usage policies.

```sql
CREATE TABLE policies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  version VARCHAR(20),
  status VARCHAR(50) DEFAULT 'draft',    -- draft, active, deprecated
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);
```

**Indexed Fields:** status, name

**Used by:** contracts, policy_rules

---

### 6. **policy_rules**
Individual rules within policies (allow/deny based on conditions).

```sql
CREATE TABLE policy_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  policy_id UUID NOT NULL,               -- Parent policy
  name VARCHAR(255) NOT NULL,            -- Rule name/description
  condition TEXT NOT NULL,               -- ABAC condition (e.g., role=admin)
  effect VARCHAR(10) NOT NULL,           -- allow or deny
  priority INTEGER NOT NULL DEFAULT 0,   -- Evaluation order
  created_at TIMESTAMP WITH TIME ZONE
);
```

**Indexed Fields:** policy_id, priority

**Foreign Keys:** policy_id → policies.id (CASCADE Delete)

---

### 7. **contracts**
Data sharing agreements between providers and consumers.

```sql
CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID NOT NULL,             -- Data provider (participant)
  consumer_id UUID NOT NULL,             -- Data consumer (participant)
  dataset_id UUID NOT NULL,              -- Which dataset is shared
  policy_id UUID,                        -- Which policy applies
  status VARCHAR(50) DEFAULT 'draft',    -- draft, negotiating, active, expired, terminated
  terms JSONB,                           -- Contract terms and conditions
  expires_at TIMESTAMP WITH TIME ZONE,   -- Contract expiration
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);
```

**Indexed Fields:** provider_id, consumer_id, dataset_id, policy_id, status, expires_at

**Foreign Keys:**
- `provider_id` → participants.id
- `consumer_id` → participants.id
- `dataset_id` → datasets.id
- `policy_id` → policies.id (SET NULL)

**Used by:** transactions, clearing_records

---

### 8. **transactions**
Immutable ledger of data access, sharing, and export activities.

```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dataset_id UUID NOT NULL,              -- Which dataset
  participant_id UUID NOT NULL,          -- Who accessed it
  contract_id UUID,                      -- Under which contract
  action VARCHAR(50) NOT NULL,           -- DATA_ACCESS, DATA_SHARE, DATA_EXPORT, etc.
  amount NUMERIC(19, 2),                 -- Quantity/fee amount
  transaction_hash VARCHAR(255),         -- For blockchain compatibility
  created_at TIMESTAMP WITH TIME ZONE    -- Immutable timestamp
);
```

**Indexed Fields:** dataset_id, participant_id, contract_id, action, created_at

**Foreign Keys:**
- `dataset_id` → datasets.id (CASCADE Delete)
- `participant_id` → participants.id (CASCADE Delete)
- `contract_id` → contracts.id (SET NULL)

**Note:** This table is append-only for audit trail integrity.

---

### 9. **clearing_records**
Settlement and clearing records between providers and consumers.

```sql
CREATE TABLE clearing_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id UUID NOT NULL,             -- Associated contract
  provider_id UUID NOT NULL,             -- Service provider
  consumer_id UUID NOT NULL,             -- Service consumer
  amount NUMERIC(19, 2) NOT NULL,        -- Amount to clear/settle
  status VARCHAR(50) DEFAULT 'pending',  -- pending, cleared, failed
  clearing_date DATE,                    -- When cleared
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);
```

**Indexed Fields:** contract_id, provider_id, consumer_id, status, clearing_date

**Foreign Keys:**
- `contract_id` → contracts.id (CASCADE Delete)
- `provider_id` → participants.id (CASCADE Delete)
- `consumer_id` → participants.id (CASCADE Delete)

---

### 10. **compliance_records**
Audit findings, risk assessments, and compliance tracking.

```sql
CREATE TABLE compliance_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dataset_id UUID NOT NULL,              -- Dataset being audited
  audit_id UUID,                         -- External audit reference
  status VARCHAR(50) DEFAULT 'draft',    -- draft, pending, approved, rejected
  findings TEXT,                         -- Audit findings and issues
  risk_level VARCHAR(20) DEFAULT 'low',  -- low, medium, high
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);
```

**Indexed Fields:** dataset_id, status, risk_level

**Foreign Keys:** dataset_id → datasets.id (CASCADE Delete)

---

### 11. **connectors**
Data source connections and integration points.

```sql
CREATE TABLE connectors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_id UUID NOT NULL,          -- Which organization owns this
  name VARCHAR(255) NOT NULL,            -- Connector name
  url VARCHAR(255) NOT NULL,             -- Connection endpoint
  data_source_type VARCHAR(100) NOT NULL,-- relational_db, cloud_storage, api, etc.
  status VARCHAR(50) DEFAULT 'inactive', -- active, inactive, pending, maintenance
  configuration JSONB,                   -- Connection config (secrets encrypted)
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);
```

**Indexed Fields:** participant_id, status, data_source_type

**Foreign Keys:** participant_id → participants.id (CASCADE Delete)

**Used by:** apps

---

### 12. **apps**
Applications and plugins that run in connectors.

```sql
CREATE TABLE apps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  connector_id UUID,                     -- Which connector runs this
  name VARCHAR(255) NOT NULL,            -- App name
  description TEXT,
  version VARCHAR(50) NOT NULL,          -- Semantic versioning
  status VARCHAR(50) DEFAULT 'draft',    -- draft, published, deprecated
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);
```

**Indexed Fields:** connector_id, status, name

**Foreign Keys:** connector_id → connectors.id (SET NULL)

---

### 13. **vocabularies**
Semantic vocabularies and ontologies for data interoperability.

```sql
CREATE TABLE vocabularies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  namespace VARCHAR(255) NOT NULL,      -- RDF namespace
  version VARCHAR(50) NOT NULL,         -- Version
  format VARCHAR(50) NOT NULL,          -- json, rdf, owl
  description TEXT,
  content JSONB NOT NULL,               -- Vocabulary content
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);
```

**Indexed Fields:** namespace, format

**Unique Constraint:** (namespace, name, version)

---

### 14. **service_health**
Real-time monitoring of system services and health status.

```sql
CREATE TABLE service_health (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_name VARCHAR(100) NOT NULL,    -- IDP, Broker, Hub, etc.
  status VARCHAR(50) NOT NULL,           -- healthy, unhealthy, checking
  port INTEGER,                          -- Service port
  last_check TIMESTAMP WITH TIME ZONE,   -- Last health check
  response_time_ms INTEGER,              -- Response time
  error_message TEXT,                    -- Error details if unhealthy
  created_at TIMESTAMP WITH TIME ZONE    -- Record creation time
);
```

**Indexed Fields:** service_name, status, last_check

---

### 15. **system_config**
Key-value configuration store for system settings.

```sql
CREATE TABLE system_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(255) NOT NULL UNIQUE,
  value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);
```

**Indexed Fields:** key

---

## Relationships and Foreign Keys

### Participant-Centric Relationships

```
┌─ Participant owns → Datasets
├─ Participant provides → Contracts (as provider)
├─ Participant consumes ← Contracts (as consumer)
├─ Participant operates → Connectors
├─ Participant generates → Transactions
├─ Participant receives ← Clearing Records (as consumer)
└─ Participant pays ← Clearing Records (as provider)
```

### Contract Workflow

```
Contract connects:
  Provider (participant) ──┐
  Consumer (participant) ──┼──► Contract ──┐
  Dataset (data asset) ─────┘              ├──► Transactions (ledger)
  Policy (access rules) ────────────────────┘
                              │
                              ▼
                        Clearing Records (settlement)
```

### Data Flow

```
Dataset ◄──── Schema (structure)
    │
    ├──────┬──────────────────┐
    │      │                  │
    ▼      ▼                  ▼
 Contract Transactions  Compliance Records
    │         │              │
    │         └──────┬───────┘
    │                │
    ▼                ▼
 Clearing      Audit Logs
 Records
```

---

## Indexes

### Performance Optimization Indexes

| Table | Columns | Type | Purpose |
|-------|---------|------|---------|
| audit_logs | (created_at DESC) | DESC | Fast log retrieval |
| audit_logs | (user_id, created_at) | COMPOSITE | User activity tracking |
| participants | (status) | B-TREE | Filter by status |
| datasets | (participant_id, status) | COMPOSITE | Find datasets by owner |
| contracts | (provider_id, consumer_id) | COMPOSITE | Find agreements |
| contracts | (expires_at) | B-TREE | Expiration tracking |
| transactions | (created_at DESC) | DESC | Ledger queries |
| clearing_records | (status, clearing_date) | COMPOSITE | Settlement reports |
| compliance_records | (risk_level) | B-TREE | Risk assessment |
| service_health | (last_check DESC) | DESC | Latest health status |

---

## Setup Instructions

### 1. Create Database

```bash
# As PostgreSQL superuser
createdb -U postgres dataspace_dev
```

### 2. Initialize Schema

```bash
# Execute the schema file
psql -U postgres -d dataspace_dev -f db/schema/01-core-tables.sql
```

### 3. Verify Installation

```bash
# Connect to database
psql -U postgres -d dataspace_dev

# List tables
\dt

# Check table structure
\d participants
```

### 4. Connection String for Applications

```
postgresql://postgres:postgres@localhost:5432/dataspace_dev
```

---

## Data Types and Constraints

### UUIDs
- All primary keys use `UUID` type with `uuid_generate_v4()` default
- Ensures distributed ID generation without central authority

### Timestamps
- All timestamps use `TIMESTAMP WITH TIME ZONE`
- Facilitates multi-timezone operations

### JSONB
- Used for flexible schema fields: policies (terms), schemas (content), vocabularies (content)
- Indexed for fast queries
- Allows evolution without schema migrations

### Enums as Checks
- Status fields use `CHECK` constraints for valid values
- Example: `status IN ('active', 'inactive', 'suspended')`

### Numeric Precision
- Money fields: `NUMERIC(19, 2)` for exact decimal arithmetic
- Supports up to 999,999,999,999,999,999.99

---

## Backup and Maintenance

### Backup Full Database
```bash
pg_dump -U postgres dataspace_dev > backup.sql
```

### Restore Database
```bash
psql -U postgres -d dataspace_dev < backup.sql
```

### Vacuum and Analyze (Maintenance)
```bash
psql -U postgres -d dataspace_dev -c "VACUUM ANALYZE;"
```

---

## Security Considerations

1. **Audit Logs** - All changes tracked in `audit_logs` table
2. **Immutable Transactions** - Ledger entries are append-only
3. **Role-Based Access** - Implement via application layer (not in DB)
4. **Encryption** - Connector configuration should be encrypted at rest
5. **Public Keys** - Stored in participants table for digital signatures

---

## Future Enhancements

- [ ] Add user roles and permissions table
- [ ] Implement row-level security (RLS)
- [ ] Add full-text search indexes
- [ ] Create materialized views for reporting
- [ ] Add time-series data for analytics
- [ ] Implement partitioning for large tables (transactions, audit_logs)

