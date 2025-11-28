-- ============================================================================
-- DATASPACE CORE SCHEMA
-- Version: 1.0.0
-- Description: Core tables for the dataspace management platform
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. AUDIT LOG TABLE
-- Tracks all system activities and changes
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  user_name VARCHAR(255),
  action VARCHAR(50) NOT NULL,
  resource_type VARCHAR(100) NOT NULL,
  resource_id UUID,
  resource_name VARCHAR(255),
  details TEXT,
  status VARCHAR(20) DEFAULT 'success' CHECK (status IN ('success', 'failure')),
  ip_address VARCHAR(45),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Indexes
  CONSTRAINT valid_action CHECK (action IN (
    'CREATE', 'READ', 'UPDATE', 'DELETE', 'EXPORT', 'IMPORT',
    'LOGIN', 'LOGOUT', 'PERMISSION_CHANGE', 'ROLE_CHANGE',
    'POLICY_CHANGE', 'SEARCH', 'ACTIVATE', 'DEACTIVATE'
  ))
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_status ON audit_logs(status);

-- ============================================================================
-- 2. SYSTEM CONFIGURATION TABLE
-- Key-value store for system settings
-- ============================================================================
CREATE TABLE IF NOT EXISTS system_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(255) NOT NULL UNIQUE,
  value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_system_config_key ON system_config(key);

-- ============================================================================
-- 3. PARTICIPANTS TABLE
-- Organizations/entities in the dataspace
-- ============================================================================
CREATE TABLE IF NOT EXISTS participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  did VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  endpoint_url VARCHAR(255),
  public_key TEXT,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_participants_did ON participants(did);
CREATE INDEX idx_participants_status ON participants(status);
CREATE INDEX idx_participants_name ON participants(name);

-- ============================================================================
-- 4. SCHEMAS TABLE
-- Data structure definitions (JSON-Schema, SHACL, JSON-LD)
-- ============================================================================
CREATE TABLE IF NOT EXISTS schemas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  namespace VARCHAR(255) NOT NULL,
  version VARCHAR(50) NOT NULL,
  format VARCHAR(50) NOT NULL CHECK (format IN ('json-schema', 'shacl', 'jsonld')),
  content JSONB NOT NULL,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'deprecated')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_schemas_namespace ON schemas(namespace);
CREATE INDEX idx_schemas_status ON schemas(status);
CREATE INDEX idx_schemas_format ON schemas(format);
CREATE UNIQUE INDEX idx_schemas_unique_version ON schemas(namespace, name, version);

-- ============================================================================
-- 5. DATASETS TABLE
-- Data assets owned by participants
-- ============================================================================
CREATE TABLE IF NOT EXISTS datasets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  schema_id UUID REFERENCES schemas(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_datasets_participant_id ON datasets(participant_id);
CREATE INDEX idx_datasets_schema_id ON datasets(schema_id);
CREATE INDEX idx_datasets_status ON datasets(status);
CREATE INDEX idx_datasets_name ON datasets(name);

-- ============================================================================
-- 6. POLICIES TABLE
-- Access and usage policies with rules
-- ============================================================================
CREATE TABLE IF NOT EXISTS policies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  version VARCHAR(20),
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'deprecated')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_policies_status ON policies(status);
CREATE INDEX idx_policies_name ON policies(name);

-- ============================================================================
-- 7. POLICY RULES TABLE
-- Individual rules within policies
-- ============================================================================
CREATE TABLE IF NOT EXISTS policy_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  policy_id UUID NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  condition TEXT NOT NULL,
  effect VARCHAR(10) NOT NULL CHECK (effect IN ('allow', 'deny')),
  priority INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_policy_rules_policy_id ON policy_rules(policy_id);
CREATE INDEX idx_policy_rules_priority ON policy_rules(priority);

-- ============================================================================
-- 8. CONTRACTS TABLE
-- Data sharing agreements between providers and consumers
-- ============================================================================
CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  consumer_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  dataset_id UUID NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
  policy_id UUID REFERENCES policies(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'draft' CHECK (
    status IN ('draft', 'negotiating', 'active', 'expired', 'terminated')
  ),
  terms JSONB,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_contracts_provider_id ON contracts(provider_id);
CREATE INDEX idx_contracts_consumer_id ON contracts(consumer_id);
CREATE INDEX idx_contracts_dataset_id ON contracts(dataset_id);
CREATE INDEX idx_contracts_policy_id ON contracts(policy_id);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_contracts_expires_at ON contracts(expires_at);

-- ============================================================================
-- 9. TRANSACTIONS TABLE (LEDGER)
-- Immutable transaction history for data access and sharing
-- ============================================================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dataset_id UUID NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  contract_id UUID REFERENCES contracts(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL CHECK (
    action IN ('DATA_ACCESS', 'DATA_SHARE', 'DATA_EXPORT', 'DATA_DELETE', 'METADATA_READ')
  ),
  amount NUMERIC(19, 2),
  transaction_hash VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transactions_dataset_id ON transactions(dataset_id);
CREATE INDEX idx_transactions_participant_id ON transactions(participant_id);
CREATE INDEX idx_transactions_contract_id ON transactions(contract_id);
CREATE INDEX idx_transactions_action ON transactions(action);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);

-- ============================================================================
-- 10. CLEARING RECORDS TABLE (SETTLEMENT)
-- Settlement and clearing records between providers and consumers
-- ============================================================================
CREATE TABLE IF NOT EXISTS clearing_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  consumer_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  amount NUMERIC(19, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'cleared', 'failed')),
  clearing_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_clearing_records_contract_id ON clearing_records(contract_id);
CREATE INDEX idx_clearing_records_provider_id ON clearing_records(provider_id);
CREATE INDEX idx_clearing_records_consumer_id ON clearing_records(consumer_id);
CREATE INDEX idx_clearing_records_status ON clearing_records(status);
CREATE INDEX idx_clearing_records_clearing_date ON clearing_records(clearing_date);

-- ============================================================================
-- 11. COMPLIANCE RECORDS TABLE
-- Audit findings and compliance tracking
-- ============================================================================
CREATE TABLE IF NOT EXISTS compliance_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dataset_id UUID NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
  audit_id UUID,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected')),
  findings TEXT,
  risk_level VARCHAR(20) DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_compliance_records_dataset_id ON compliance_records(dataset_id);
CREATE INDEX idx_compliance_records_status ON compliance_records(status);
CREATE INDEX idx_compliance_records_risk_level ON compliance_records(risk_level);

-- ============================================================================
-- 12. CONNECTORS TABLE
-- Data connectors for various data sources
-- ============================================================================
CREATE TABLE IF NOT EXISTS connectors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  url VARCHAR(255) NOT NULL,
  data_source_type VARCHAR(100) NOT NULL CHECK (
    data_source_type IN ('relational_db', 'cloud_storage', 'api', 'file_system', 'message_queue')
  ),
  status VARCHAR(50) DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'pending', 'maintenance')),
  configuration JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_connectors_participant_id ON connectors(participant_id);
CREATE INDEX idx_connectors_status ON connectors(status);
CREATE INDEX idx_connectors_data_source_type ON connectors(data_source_type);

-- ============================================================================
-- 13. APPS TABLE
-- Connector apps/plugins
-- ============================================================================
CREATE TABLE IF NOT EXISTS apps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  connector_id UUID REFERENCES connectors(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  version VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'deprecated')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_apps_connector_id ON apps(connector_id);
CREATE INDEX idx_apps_status ON apps(status);
CREATE INDEX idx_apps_name ON apps(name);

-- ============================================================================
-- 14. VOCABULARIES TABLE
-- Semantic vocabularies and terms
-- ============================================================================
CREATE TABLE IF NOT EXISTS vocabularies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  namespace VARCHAR(255) NOT NULL,
  version VARCHAR(50) NOT NULL,
  format VARCHAR(50) NOT NULL CHECK (format IN ('json', 'rdf', 'owl')),
  description TEXT,
  content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vocabularies_namespace ON vocabularies(namespace);
CREATE INDEX idx_vocabularies_format ON vocabularies(format);
CREATE UNIQUE INDEX idx_vocabularies_unique_version ON vocabularies(namespace, name, version);

-- ============================================================================
-- 15. SERVICE HEALTH TABLE
-- Real-time service health monitoring
-- ============================================================================
CREATE TABLE IF NOT EXISTS service_health (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_name VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL CHECK (status IN ('healthy', 'unhealthy', 'checking')),
  port INTEGER,
  last_check TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  response_time_ms INTEGER,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_service_health_service_name ON service_health(service_name);
CREATE INDEX idx_service_health_status ON service_health(status);
CREATE INDEX idx_service_health_last_check ON service_health(last_check DESC);

-- ============================================================================
-- COMMENTS AND METADATA
-- ============================================================================
COMMENT ON TABLE audit_logs IS 'Tracks all system activities, changes, and user actions';
COMMENT ON TABLE participants IS 'Organizations and entities participating in the dataspace';
COMMENT ON TABLE datasets IS 'Data assets available in the dataspace';
COMMENT ON TABLE schemas IS 'Data structure definitions (JSON-Schema, SHACL, JSON-LD)';
COMMENT ON TABLE policies IS 'Access control and usage policies';
COMMENT ON TABLE contracts IS 'Data sharing agreements between participants';
COMMENT ON TABLE transactions IS 'Immutable ledger of data transactions';
COMMENT ON TABLE clearing_records IS 'Settlement and clearing records';
COMMENT ON TABLE compliance_records IS 'Compliance audit findings and records';
COMMENT ON TABLE connectors IS 'Data source connections and adapters';
COMMENT ON TABLE apps IS 'Connector applications and plugins';
COMMENT ON TABLE vocabularies IS 'Semantic vocabularies and ontologies';
COMMENT ON TABLE service_health IS 'Real-time monitoring of system services';
