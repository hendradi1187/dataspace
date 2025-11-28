-- Initial Dataspace Schema
-- Version: 1.0.0
-- Created: 2024

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Audit table for tracking changes
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name VARCHAR(255) NOT NULL,
  operation VARCHAR(10) NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  record_id UUID NOT NULL,
  old_values JSONB,
  new_values JSONB,
  changed_by VARCHAR(255),
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_log_table ON audit_log(table_name);
CREATE INDEX idx_audit_log_timestamp ON audit_log(changed_at DESC);

-- System configuration table
CREATE TABLE IF NOT EXISTS system_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(255) NOT NULL UNIQUE,
  value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Participants registry (for IDP)
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

-- Datasets registry (for Broker)
CREATE TABLE IF NOT EXISTS datasets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_id UUID NOT NULL REFERENCES participants(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  schema_ref VARCHAR(255),
  status VARCHAR(50) DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_datasets_participant ON datasets(participant_id);
CREATE INDEX idx_datasets_status ON datasets(status);

-- Policies registry (for Policy Authority)
CREATE TABLE IF NOT EXISTS policies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  definition JSONB NOT NULL,
  version VARCHAR(20),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'deprecated')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_policies_status ON policies(status);

-- Contracts registry (for Contract Authority)
CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID NOT NULL REFERENCES participants(id),
  consumer_id UUID NOT NULL REFERENCES participants(id),
  dataset_id UUID NOT NULL REFERENCES datasets(id),
  policy_id UUID REFERENCES policies(id),
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'signed', 'active', 'completed', 'terminated')),
  terms JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_contracts_provider ON contracts(provider_id);
CREATE INDEX idx_contracts_consumer ON contracts(consumer_id);
CREATE INDEX idx_contracts_dataset ON contracts(dataset_id);
CREATE INDEX idx_contracts_status ON contracts(status);

-- Credentials registry (for IDP)
CREATE TABLE IF NOT EXISTS credentials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id VARCHAR(255) UNIQUE NOT NULL,
  client_secret VARCHAR(255) NOT NULL,
  participant_id UUID NOT NULL REFERENCES participants(id),
  scope TEXT[] DEFAULT ARRAY['read:*'],
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_credentials_client_id ON credentials(client_id);
CREATE INDEX idx_credentials_participant ON credentials(participant_id);
CREATE INDEX idx_credentials_status ON credentials(status);

-- API Keys registry (for IDP)
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  participant_id UUID NOT NULL REFERENCES participants(id),
  scope TEXT[] DEFAULT ARRAY['read:*'],
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_api_keys_key ON api_keys(key);
CREATE INDEX idx_api_keys_participant ON api_keys(participant_id);
CREATE INDEX idx_api_keys_status ON api_keys(status);

-- Schemas registry (for Hub Service)
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
CREATE UNIQUE INDEX idx_schemas_namespace_version ON schemas(namespace, version);

-- Vocabularies registry (for Hub Service)
CREATE TABLE IF NOT EXISTS vocabularies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  namespace VARCHAR(255) NOT NULL,
  version VARCHAR(50) NOT NULL,
  terms JSONB NOT NULL,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'deprecated')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vocabularies_namespace ON vocabularies(namespace);
CREATE INDEX idx_vocabularies_status ON vocabularies(status);
CREATE UNIQUE INDEX idx_vocabularies_namespace_version ON vocabularies(namespace, version);

-- Policies registry (for TrustCore Policy Service)
CREATE TABLE IF NOT EXISTS trustcore_policies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  rules JSONB NOT NULL,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'deprecated')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_trustcore_policies_status ON trustcore_policies(status);
CREATE INDEX idx_trustcore_policies_name ON trustcore_policies(name);

-- Ledger entries (for TrustCore Ledger Service)
CREATE TABLE IF NOT EXISTS trustcore_ledger (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  rules JSONB NOT NULL,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'deprecated')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_trustcore_ledger_status ON trustcore_ledger(status);
CREATE INDEX idx_trustcore_ledger_name ON trustcore_ledger(name);

-- Contracts (for TrustCore Contract Service)
CREATE TABLE IF NOT EXISTS trustcore_contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  rules JSONB NOT NULL,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'deprecated')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_trustcore_contracts_status ON trustcore_contracts(status);

-- Compliance records (for TrustCore Compliance Service)
CREATE TABLE IF NOT EXISTS trustcore_compliance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  rules JSONB NOT NULL,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'deprecated')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_trustcore_compliance_status ON trustcore_compliance(status);

-- Connectors (for TrustCore Connector Service)
CREATE TABLE IF NOT EXISTS trustcore_connectors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  rules JSONB NOT NULL,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'deprecated')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_trustcore_connectors_status ON trustcore_connectors(status);

-- Clearing records (for TrustCore Clearing Service)
CREATE TABLE IF NOT EXISTS trustcore_clearing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  rules JSONB NOT NULL,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'deprecated')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_trustcore_clearing_status ON trustcore_clearing(status);
