# Dataspace Database Configuration

## 📌 Overview

Konfigurasi database PostgreSQL untuk aplikasi Dataspace **tanpa Docker**, menggunakan kredensial lokal Anda:

```
Host:     localhost
Port:     5432
Database: dataspace_dev
Username: postgres
Password: postgres
```

---

## 📁 Struktur Folder

```
db/
│
├── config/                          # Database connection configuration
│   ├── database.ts                  # Pool initialization & connection logic
│   └── index.ts                     # Exports
│
├── schema/                          # Database schema definitions
│   ├── 01-core-tables.sql          # Main schema (15 tables)
│   └── SCHEMA_DOCUMENTATION.md     # Detailed schema docs with ERD
│
├── migrations/                      # Database migrations
│   └── 001_initial_setup.sql       # Initial schema setup
│
├── seeds/                           # Sample data
│   └── 001_sample_data.sql         # Test data (5 participants, 4 datasets, etc.)
│
├── SETUP.md                         # Setup & installation guide
└── README.md                        # This file
```

---

## 🚀 Quick Start (3 Steps)

### Step 1: Create Database
```bash
createdb -U postgres dataspace_dev
```

### Step 2: Initialize Schema
```bash
psql -U postgres -d dataspace_dev -f db/schema/01-core-tables.sql
```

### Step 3: Load Sample Data (Optional)
```bash
psql -U postgres -d dataspace_dev -f db/seeds/001_sample_data.sql
```

✅ **Done!** Your database is ready.

---

## 📊 Database Tables (15 Core Tables)

### Core Management
| Table | Purpose | Rows |
|-------|---------|------|
| **participants** | Organizations in dataspace | 5 |
| **datasets** | Data assets | 4 |
| **schemas** | Data structure definitions | 3 |
| **policies** | Access control rules | 3 |
| **policy_rules** | Individual rules | 4 |
| **contracts** | Data sharing agreements | 3 |

### Transactions & Settlement
| Table | Purpose | Rows |
|-------|---------|------|
| **transactions** | Immutable ledger | 4 |
| **clearing_records** | Settlement records | 2 |

### Compliance & Monitoring
| Table | Purpose | Rows |
|-------|---------|------|
| **compliance_records** | Audit findings | 2 |
| **service_health** | System health | 6 |

### Data Connections
| Table | Purpose | Rows |
|-------|---------|------|
| **connectors** | Data source connections | 3 |
| **apps** | Connector applications | 3 |

### References
| Table | Purpose | Rows |
|-------|---------|------|
| **vocabularies** | Semantic terms | 0 |
| **audit_logs** | Activity logs | 4 |
| **system_config** | Settings | 3 |

---

## 🔗 Entity Relationships

```
┌─────────────────┐
│  Participants   │  (Organizations)
└────────┬────────┘
         │
    ┌────┼────┬─────────┬──────────┐
    │    │    │         │          │
    ▼    ▼    ▼         ▼          ▼
┌────────┐ ┌────────┐ ┌──────────┐ ┌──────────┐
│Datasets│ │Contract│ │Connector │ │Audit Log │
└────────┘ └────────┘ └──────────┘ └──────────┘
    │          │ │        │
    ▼          │ │        ▼
  ┌───┐        │ │      ┌─────┐
  │Tx │        │ │      │ App │
  └───┘        │ │      └─────┘
               │ │
               ▼ ▼
         ┌─────────────┐
         │  Clearing   │
         │  Records    │
         └─────────────┘

Legend:
Tx = Transactions (Ledger)
```

---

## 💾 Data Model

### Participant (Organization)
```sql
id, did, name, description, endpoint_url, public_key, status
```
**Status:** active, inactive, suspended

### Dataset (Data Asset)
```sql
id, participant_id (owns), name, description,
schema_id (references), status
```
**Status:** draft, published, archived

### Contract (Data Sharing Agreement)
```sql
id, provider_id, consumer_id, dataset_id,
policy_id, status, terms (JSONB), expires_at
```
**Status:** draft, negotiating, active, expired, terminated

### Policy (Access Rules)
```sql
id, name, description, version, status
```
**Contains:** policy_rules (condition, effect, priority)

### Transaction (Ledger)
```sql
id, dataset_id, participant_id, contract_id,
action, amount, created_at (immutable)
```
**Actions:** DATA_ACCESS, DATA_SHARE, DATA_EXPORT, etc.

### Clearing Record (Settlement)
```sql
id, contract_id, provider_id, consumer_id,
amount, status, clearing_date
```
**Status:** pending, cleared, failed

### Compliance Record (Audit)
```sql
id, dataset_id, audit_id, status,
findings, risk_level
```
**Risk:** low, medium, high

### Connector (Data Source Connection)
```sql
id, participant_id, name, url, data_source_type,
status, configuration (JSONB)
```
**Types:** relational_db, cloud_storage, api, etc.

### Audit Log (Activity Tracking)
```sql
id, user_id, user_name, action, resource_type,
resource_id, status, created_at
```
**Actions:** CREATE, READ, UPDATE, DELETE, EXPORT, IMPORT, LOGIN, etc.

---

## 🔍 Environment Configuration

### .env File
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dataspace_dev
DB_USER=postgres
DB_PASSWORD=postgres
DB_MAX_CONNECTIONS=20
```

### Connection String
```
postgresql://postgres:postgres@localhost:5432/dataspace_dev
```

---

## 📖 Documentation Files

| File | Purpose |
|------|---------|
| `SETUP.md` | Installation & setup instructions |
| `schema/SCHEMA_DOCUMENTATION.md` | Detailed schema docs with ERD & field descriptions |
| `DATABASE_CONFIG_ANALYSIS.md` | Comparison of your config vs system default |
| `README.md` | This file - quick reference |

---

## ✨ Key Features

✅ **Complete Schema** - 15 tables covering all dataspace operations
✅ **Relationships** - Foreign keys with cascading deletes
✅ **Indexing** - Performance-optimized indexes on commonly queried fields
✅ **Audit Trail** - Every change tracked in audit_logs
✅ **Immutable Ledger** - Transactions table is append-only
✅ **JSONB Support** - Flexible schemas for evolution
✅ **Type Safety** - CHECK constraints on status fields
✅ **Sample Data** - 30+ records for testing
✅ **UUID Primary Keys** - Distributed ID generation
✅ **Timestamps** - All tables have created_at/updated_at (except immutable transactions)

---

## 🧪 Testing Queries

### View All Participants
```sql
SELECT id, did, name, status FROM participants;
```

### View Active Contracts
```sql
SELECT c.*, p1.name as provider, p2.name as consumer
FROM contracts c
JOIN participants p1 ON c.provider_id = p1.id
JOIN participants p2 ON c.consumer_id = p2.id
WHERE c.status = 'active';
```

### View Transaction History
```sql
SELECT * FROM transactions
ORDER BY created_at DESC
LIMIT 20;
```

### View Pending Clearing Records
```sql
SELECT * FROM clearing_records
WHERE status = 'pending'
ORDER BY created_at;
```

### Check Service Health
```sql
SELECT service_name, status, response_time_ms
FROM service_health
ORDER BY last_check DESC;
```

---

## ⚙️ Node.js Integration

### Initialize Database Connection

```typescript
import { initializePool, getPool, query } from './db/config';

// 1. Initialize on app startup
const pool = initializePool();

// 2. Execute queries
const result = await query('SELECT * FROM participants');
console.log(result.rows);

// 3. Close on shutdown
process.on('SIGINT', async () => {
  await pool.end();
  process.exit(0);
});
```

### Example Repository

```typescript
import { query } from './db/config';

export const participantRepository = {
  async getAll() {
    const result = await query('SELECT * FROM participants');
    return result.rows;
  },

  async getById(id: string) {
    const result = await query(
      'SELECT * FROM participants WHERE id = $1',
      [id]
    );
    return result.rows[0];
  },

  async create(did: string, name: string, description?: string) {
    const result = await query(
      `INSERT INTO participants (did, name, description)
       VALUES ($1, $2, $3) RETURNING *`,
      [did, name, description]
    );
    return result.rows[0];
  }
};
```

---

## 🔒 Security Considerations

1. **Credentials** - Store in `.env` file (not committed to git)
2. **Audit Logs** - All changes tracked for compliance
3. **Immutable Ledger** - Transactions cannot be deleted
4. **Timestamps** - Full timezone awareness for audit trails
5. **Encryption** - Connector configuration should be encrypted at rest
6. **Public Keys** - Stored for digital signatures

---

## 🛠️ Maintenance

### Backup
```bash
pg_dump -U postgres dataspace_dev > backup.sql
```

### Restore
```bash
psql -U postgres dataspace_dev < backup.sql
```

### Optimize
```bash
psql -U postgres -d dataspace_dev -c "VACUUM ANALYZE;"
```

---

## 📝 Sample Data Included

When you load `001_sample_data.sql`, you get:

- **5 Participants** - From DataHub to Startup Innovations
- **4 Datasets** - Customer, Transaction, Product, Market data
- **3 Schemas** - Customer, Transaction, Product schemas
- **3 Policies** - Public Access, Restricted, Research Partners
- **3 Contracts** - Active agreements between participants
- **4 Transactions** - Ledger entries for data access
- **2 Clearing Records** - Settlement records
- **3 Connectors** - PostgreSQL, S3, REST API
- **3 Apps** - Data Extractor, S3 Sync, Analytics Aggregator
- **Audit Logs** - Activity history
- **Service Health** - System status monitoring

---

## 🚀 Next Steps

1. **Run the setup commands above**
2. **Verify the database** with `SETUP.md` verification steps
3. **Integrate into your services** using Node.js examples
4. **Add your own data** by creating SQL INSERT scripts
5. **Monitor the database** with health checks and backups

---

## 📚 Detailed Documentation

For more detailed information:
- **Schema Details** → See `schema/SCHEMA_DOCUMENTATION.md`
- **Setup & Troubleshooting** → See `SETUP.md`
- **Configuration Analysis** → See `DATABASE_CONFIG_ANALYSIS.md`

---

## ✅ Configuration Validation

Your configuration:
- ✅ Host: `localhost` (local testing)
- ✅ Port: `5432` (default PostgreSQL)
- ✅ Database: `dataspace_dev` (matches system)
- ✅ Username: `postgres` (your local user)
- ✅ Password: `postgres` (your local password)

This is a **complete and correct** configuration for local PostgreSQL without Docker.

