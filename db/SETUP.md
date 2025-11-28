# Dataspace Database Setup Guide

**PostgreSQL Local Setup (No Docker)**

---

## 📋 Prerequisites

- PostgreSQL 15+ installed locally
- psql command-line tool available
- Username: `postgres`
- Password: `postgres`
- Port: `5432`

---

## ⚡ Quick Start

### 1. Create Database

```bash
createdb -U postgres dataspace_dev
```

### 2. Initialize Schema

```bash
psql -U postgres -d dataspace_dev -f db/schema/01-core-tables.sql
```

### 3. Run Migrations (if any)

```bash
psql -U postgres -d dataspace_dev -f db/migrations/001_initial_setup.sql
```

### 4. Load Sample Data (Optional)

```bash
psql -U postgres -d dataspace_dev -f db/seeds/001_sample_data.sql
```

### 5. Verify Installation

```bash
psql -U postgres -d dataspace_dev -c "SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = 'public';"
```

Expected output: `table_count: 15`

---

## 🔍 Verification Steps

### Check Database Connection

```bash
psql -U postgres -d dataspace_dev -c "SELECT version();"
```

### List All Tables

```bash
psql -U postgres -d dataspace_dev -c "\dt"
```

Expected tables:
```
                        List of relations
 Schema |             Name              | Type  |  Owner
--------+-------------------------------+-------+----------
 public | apps                          | table | postgres
 public | audit_logs                    | table | postgres
 public | clearing_records              | table | postgres
 public | compliance_records            | table | postgres
 public | connectors                    | table | postgres
 public | datasets                      | table | postgres
 public | policies                      | table | postgres
 public | policy_rules                  | table | postgres
 public | participants                  | table | postgres
 public | schemas                       | table | postgres
 public | service_health                | table | postgres
 public | system_config                 | table | postgres
 public | transactions                  | table | postgres
 public | vocabularies                  | table | postgres
(14 rows)
```

### Check Row Counts

```bash
psql -U postgres -d dataspace_dev -c "SELECT table_name, row_count FROM (
  SELECT 'participants' as table_name, COUNT(*) as row_count FROM participants
  UNION ALL SELECT 'datasets', COUNT(*) FROM datasets
  UNION ALL SELECT 'schemas', COUNT(*) FROM schemas
  UNION ALL SELECT 'policies', COUNT(*) FROM policies
  UNION ALL SELECT 'contracts', COUNT(*) FROM contracts
  UNION ALL SELECT 'transactions', COUNT(*) FROM transactions
  UNION ALL SELECT 'clearing_records', COUNT(*) FROM clearing_records
  UNION ALL SELECT 'compliance_records', COUNT(*) FROM compliance_records
  UNION ALL SELECT 'connectors', COUNT(*) FROM connectors
  UNION ALL SELECT 'apps', COUNT(*) FROM apps
  UNION ALL SELECT 'audit_logs', COUNT(*) FROM audit_logs
) counts ORDER BY table_name;"
```

---

## 📁 Directory Structure

```
db/
├── config/
│   ├── database.ts              # Database connection configuration
│   └── index.ts                 # Config exports
├── schema/
│   ├── 01-core-tables.sql       # Main schema definition
│   └── SCHEMA_DOCUMENTATION.md  # Schema details and relationships
├── migrations/
│   └── 001_initial_setup.sql    # Migration scripts
├── seeds/
│   └── 001_sample_data.sql      # Sample data for development
├── SETUP.md                     # This file
└── DATABASE_CONFIG_ANALYSIS.md  # Configuration analysis
```

---

## 🔐 Connection Configuration

### Environment Variables (`.env`)

```
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

### Node.js Connection

```typescript
import { initializePool } from './db/config';

// Initialize with environment variables
const pool = initializePool();

// Or with explicit config
const pool = initializePool({
  host: 'localhost',
  port: 5432,
  database: 'dataspace_dev',
  user: 'postgres',
  password: 'postgres',
  max: 20
});
```

---

## 📊 Database Statistics

### Table Sizes

```bash
psql -U postgres -d dataspace_dev << EOF
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
EOF
```

### Index Usage

```bash
psql -U postgres -d dataspace_dev << EOF
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
EOF
```

---

## 🛠️ Maintenance

### Backup Database

```bash
pg_dump -U postgres dataspace_dev > backup_dataspace_dev.sql
```

### Restore Database

```bash
# Drop existing database
dropdb -U postgres dataspace_dev

# Recreate
createdb -U postgres dataspace_dev

# Restore backup
psql -U postgres dataspace_dev < backup_dataspace_dev.sql
```

### Vacuum and Analyze (Optimization)

```bash
psql -U postgres -d dataspace_dev -c "VACUUM ANALYZE;"
```

### Reset Database (Development Only)

```bash
# Drop all tables
psql -U postgres -d dataspace_dev -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Reinitialize
psql -U postgres -d dataspace_dev -f db/schema/01-core-tables.sql
psql -U postgres -d dataspace_dev -f db/seeds/001_sample_data.sql
```

---

## 🐛 Troubleshooting

### Problem: "psql: could not connect to server"

**Solution:** Ensure PostgreSQL is running
```bash
# On Windows
pg_isready -h localhost -p 5432

# On macOS/Linux
brew services list
sudo service postgresql status
```

### Problem: "FATAL: password authentication failed"

**Solution:** Verify credentials in `.env` file
```bash
# Test connection
psql -U postgres -h localhost -c "SELECT 1"
```

### Problem: "Database 'dataspace_dev' does not exist"

**Solution:** Create the database first
```bash
createdb -U postgres dataspace_dev
```

### Problem: "Relation does not exist"

**Solution:** Ensure schema is initialized
```bash
psql -U postgres -d dataspace_dev -f db/schema/01-core-tables.sql
```

### Check PostgreSQL Logs

```bash
# Locate log file (varies by OS)
tail -f /var/log/postgresql/postgresql.log

# Or from psql
psql -U postgres -d dataspace_dev -c "SELECT * FROM pg_log LIMIT 10;"
```

---

## 📝 Common SQL Queries

### Get All Participants

```sql
SELECT id, did, name, status, created_at FROM participants ORDER BY created_at DESC;
```

### Get Contracts with Details

```sql
SELECT
  c.id,
  p1.name AS provider,
  p2.name AS consumer,
  d.name AS dataset,
  c.status,
  c.expires_at
FROM contracts c
JOIN participants p1 ON c.provider_id = p1.id
JOIN participants p2 ON c.consumer_id = p2.id
JOIN datasets d ON c.dataset_id = d.id
ORDER BY c.created_at DESC;
```

### Get Recent Transactions

```sql
SELECT
  t.id,
  d.name AS dataset,
  p.name AS participant,
  t.action,
  t.amount,
  t.created_at
FROM transactions t
JOIN datasets d ON t.dataset_id = d.id
JOIN participants p ON t.participant_id = p.id
ORDER BY t.created_at DESC
LIMIT 20;
```

### Check Audit Trail for Specific Entity

```sql
SELECT
  al.action,
  al.user_name,
  al.resource_name,
  al.status,
  al.created_at
FROM audit_logs al
WHERE al.resource_type = 'contract'
  AND al.resource_id = '<contract-id>'
ORDER BY al.created_at DESC;
```

### Get Clearing Records Pending Settlement

```sql
SELECT
  cr.id,
  p1.name AS provider,
  p2.name AS consumer,
  cr.amount,
  cr.status,
  cr.created_at
FROM clearing_records cr
JOIN participants p1 ON cr.provider_id = p1.id
JOIN participants p2 ON cr.consumer_id = p2.id
WHERE cr.status = 'pending'
ORDER BY cr.created_at;
```

---

## 🚀 Next Steps

1. **Application Integration:**
   - Update service connection strings to use database pool
   - Replace in-memory repositories with SQL repositories
   - Implement transaction management

2. **Add More Features:**
   - Implement user roles and permissions table
   - Add row-level security (RLS)
   - Create materialized views for reporting

3. **Performance Tuning:**
   - Add partitioning for large tables (transactions, audit_logs)
   - Create additional indexes based on query patterns
   - Implement caching strategy

4. **Security:**
   - Encrypt sensitive fields (public_key, connector configuration)
   - Implement password hashing for credentials
   - Add role-based access control at database level

---

## 📚 References

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Schema Documentation](./schema/SCHEMA_DOCUMENTATION.md)
- [Configuration Analysis](./DATABASE_CONFIG_ANALYSIS.md)

---

## 📞 Support

For issues or questions about the database setup:
1. Check the troubleshooting section above
2. Review PostgreSQL logs
3. Verify connection credentials
4. Ensure all .sql files are present in correct directories

