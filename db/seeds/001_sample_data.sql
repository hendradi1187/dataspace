-- ============================================================================
-- SEED DATA: Sample data for development and testing
-- Description: Populate database with realistic sample data
-- Created: November 2024
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. INSERT SAMPLE PARTICIPANTS (Organizations)
-- ============================================================================

INSERT INTO participants (id, did, name, description, endpoint_url, status) VALUES
(
  '550e8400-e29b-41d4-a716-446655440001'::uuid,
  'did:example:participant1',
  'DataHub Technologies',
  'Cloud-based data platform provider',
  'https://datahub.example.com/api',
  'active'
),
(
  '550e8400-e29b-41d4-a716-446655440002'::uuid,
  'did:example:participant2',
  'Analytics Solutions Inc',
  'Data analytics and business intelligence',
  'https://analytics.example.com/api',
  'active'
),
(
  '550e8400-e29b-41d4-a716-446655440003'::uuid,
  'did:example:participant3',
  'Research Institute',
  'Academic research and data sharing',
  'https://research.example.com/api',
  'active'
),
(
  '550e8400-e29b-41d4-a716-446655440004'::uuid,
  'did:example:participant4',
  'Enterprise Systems Ltd',
  'Large enterprise data consumer',
  'https://enterprise.example.com/api',
  'active'
),
(
  '550e8400-e29b-41d4-a716-446655440005'::uuid,
  'did:example:participant5',
  'Startup Innovations',
  'Early-stage startup using shared data',
  'https://startup.example.com/api',
  'active'
);

-- ============================================================================
-- 2. INSERT SAMPLE SCHEMAS
-- ============================================================================

INSERT INTO schemas (id, name, namespace, version, format, content, status) VALUES
(
  '550e8400-e29b-41d4-a716-446655440101'::uuid,
  'Customer Schema',
  'com.example.customer',
  '1.0.0',
  'json-schema',
  '{
    "type": "object",
    "properties": {
      "id": {"type": "string"},
      "name": {"type": "string"},
      "email": {"type": "string", "format": "email"},
      "age": {"type": "integer"},
      "address": {"type": "string"}
    },
    "required": ["id", "name", "email"]
  }'::jsonb,
  'published'
),
(
  '550e8400-e29b-41d4-a716-446655440102'::uuid,
  'Transaction Schema',
  'com.example.transaction',
  '1.0.0',
  'json-schema',
  '{
    "type": "object",
    "properties": {
      "id": {"type": "string"},
      "amount": {"type": "number"},
      "currency": {"type": "string"},
      "timestamp": {"type": "string", "format": "date-time"},
      "status": {"type": "string", "enum": ["pending", "completed", "failed"]}
    },
    "required": ["id", "amount", "timestamp"]
  }'::jsonb,
  'published'
),
(
  '550e8400-e29b-41d4-a716-446655440103'::uuid,
  'Product Catalog Schema',
  'com.example.product',
  '1.0.0',
  'json-schema',
  '{
    "type": "object",
    "properties": {
      "productId": {"type": "string"},
      "name": {"type": "string"},
      "category": {"type": "string"},
      "price": {"type": "number"},
      "description": {"type": "string"}
    },
    "required": ["productId", "name", "price"]
  }'::jsonb,
  'published'
);

-- ============================================================================
-- 3. INSERT SAMPLE DATASETS
-- ============================================================================

INSERT INTO datasets (id, participant_id, name, description, schema_id, status) VALUES
(
  '550e8400-e29b-41d4-a716-446655440201'::uuid,
  '550e8400-e29b-41d4-a716-446655440001'::uuid,
  'Customer Base 2024',
  'Complete customer database with demographics and contact info',
  '550e8400-e29b-41d4-a716-446655440101'::uuid,
  'published'
),
(
  '550e8400-e29b-41d4-a716-446655440202'::uuid,
  '550e8400-e29b-41d4-a716-446655440001'::uuid,
  'Transaction History',
  'Historical transaction data from 2024',
  '550e8400-e29b-41d4-a716-446655440102'::uuid,
  'published'
),
(
  '550e8400-e29b-41d4-a716-446655440203'::uuid,
  '550e8400-e29b-41d4-a716-446655440003'::uuid,
  'Product Catalog',
  'Complete product inventory with pricing',
  '550e8400-e29b-41d4-a716-446655440103'::uuid,
  'published'
),
(
  '550e8400-e29b-41d4-a716-446655440204'::uuid,
  '550e8400-e29b-41d4-a716-446655440002'::uuid,
  'Market Trends Analysis',
  'Market analysis and trend data',
  NULL,
  'draft'
);

-- ============================================================================
-- 4. INSERT SAMPLE POLICIES
-- ============================================================================

INSERT INTO policies (id, name, description, version, status) VALUES
(
  '550e8400-e29b-41d4-a716-446655440301'::uuid,
  'Public Data Access Policy',
  'Allows public access to non-sensitive data',
  '1.0.0',
  'active'
),
(
  '550e8400-e29b-41d4-a716-446655440302'::uuid,
  'Restricted Access Policy',
  'For sensitive data - requires authorization',
  '1.0.0',
  'active'
),
(
  '550e8400-e29b-41d4-a716-446655440303'::uuid,
  'Research Partners Policy',
  'Special terms for research institutions',
  '1.0.0',
  'active'
);

-- ============================================================================
-- 5. INSERT POLICY RULES
-- ============================================================================

INSERT INTO policy_rules (id, policy_id, name, condition, effect, priority) VALUES
-- Public Data Access Policy
(
  '550e8400-e29b-41d4-a716-446655440401'::uuid,
  '550e8400-e29b-41d4-a716-446655440301'::uuid,
  'Allow all authenticated users',
  'authenticated=true',
  'allow',
  1
),
-- Restricted Access Policy
(
  '550e8400-e29b-41d4-a716-446655440402'::uuid,
  '550e8400-e29b-41d4-a716-446655440302'::uuid,
  'Only admin users',
  'role=admin',
  'allow',
  1
),
(
  '550e8400-e29b-41d4-a716-446655440403'::uuid,
  '550e8400-e29b-41d4-a716-446655440302'::uuid,
  'Deny anonymous access',
  'authenticated=false',
  'deny',
  0
),
-- Research Partners Policy
(
  '550e8400-e29b-41d4-a716-446655440404'::uuid,
  '550e8400-e29b-41d4-a716-446655440303'::uuid,
  'Allow research institutions',
  'participant_type=research',
  'allow',
  1
);

-- ============================================================================
-- 6. INSERT SAMPLE CONTRACTS
-- ============================================================================

INSERT INTO contracts (
  id, provider_id, consumer_id, dataset_id, policy_id, status,
  terms, expires_at
) VALUES
(
  '550e8400-e29b-41d4-a716-446655440501'::uuid,
  '550e8400-e29b-41d4-a716-446655440001'::uuid,  -- DataHub provides
  '550e8400-e29b-41d4-a716-446655440002'::uuid,  -- Analytics consumes
  '550e8400-e29b-41d4-a716-446655440201'::uuid,  -- Customer dataset
  '550e8400-e29b-41d4-a716-446655440301'::uuid,  -- Public Access Policy
  'active',
  '{
    "usage_limit": 10000,
    "data_retention": 30,
    "renewal_date": "2025-11-16",
    "fee": 1000
  }'::jsonb,
  '2025-11-16'::timestamp with time zone
),
(
  '550e8400-e29b-41d4-a716-446655440502'::uuid,
  '550e8400-e29b-41d4-a716-446655440001'::uuid,  -- DataHub provides
  '550e8400-e29b-41d4-a716-446655440003'::uuid,  -- Research consumes
  '550e8400-e29b-41d4-a716-446655440202'::uuid,  -- Transaction dataset
  '550e8400-e29b-41d4-a716-446655440303'::uuid,  -- Research Partners
  'active',
  '{
    "usage_limit": 50000,
    "data_retention": 365,
    "publication_required": true,
    "attribution": true
  }'::jsonb,
  '2025-11-16'::timestamp with time zone
),
(
  '550e8400-e29b-41d4-a716-446655440503'::uuid,
  '550e8400-e29b-41d4-a716-446655440003'::uuid,  -- Research provides
  '550e8400-e29b-41d4-a716-446655440004'::uuid,  -- Enterprise consumes
  '550e8400-e29b-41d4-a716-446655440203'::uuid,  -- Product dataset
  '550e8400-e29b-41d4-a716-446655440302'::uuid,  -- Restricted Access
  'draft',
  '{
    "confidentiality_level": "high",
    "approval_required": true
  }'::jsonb,
  '2026-11-16'::timestamp with time zone
);

-- ============================================================================
-- 7. INSERT SAMPLE TRANSACTIONS (LEDGER)
-- ============================================================================

INSERT INTO transactions (
  id, dataset_id, participant_id, contract_id, action, amount, created_at
) VALUES
(
  '550e8400-e29b-41d4-a716-446655440601'::uuid,
  '550e8400-e29b-41d4-a716-446655440201'::uuid,
  '550e8400-e29b-41d4-a716-446655440002'::uuid,
  '550e8400-e29b-41d4-a716-446655440501'::uuid,
  'DATA_ACCESS',
  100.00,
  NOW() - INTERVAL '3 days'
),
(
  '550e8400-e29b-41d4-a716-446655440602'::uuid,
  '550e8400-e29b-41d4-a716-446655440201'::uuid,
  '550e8400-e29b-41d4-a716-446655440002'::uuid,
  '550e8400-e29b-41d4-a716-446655440501'::uuid,
  'DATA_SHARE',
  200.00,
  NOW() - INTERVAL '2 days'
),
(
  '550e8400-e29b-41d4-a716-446655440603'::uuid,
  '550e8400-e29b-41d4-a716-446655440202'::uuid,
  '550e8400-e29b-41d4-a716-446655440003'::uuid,
  '550e8400-e29b-41d4-a716-446655440502'::uuid,
  'DATA_EXPORT',
  150.00,
  NOW() - INTERVAL '1 day'
),
(
  '550e8400-e29b-41d4-a716-446655440604'::uuid,
  '550e8400-e29b-41d4-a716-446655440201'::uuid,
  '550e8400-e29b-41d4-a716-446655440002'::uuid,
  '550e8400-e29b-41d4-a716-446655440501'::uuid,
  'DATA_ACCESS',
  125.00,
  NOW()
);

-- ============================================================================
-- 8. INSERT SAMPLE CLEARING RECORDS
-- ============================================================================

INSERT INTO clearing_records (
  id, contract_id, provider_id, consumer_id, amount, status, clearing_date
) VALUES
(
  '550e8400-e29b-41d4-a716-446655440701'::uuid,
  '550e8400-e29b-41d4-a716-446655440501'::uuid,
  '550e8400-e29b-41d4-a716-446655440001'::uuid,
  '550e8400-e29b-41d4-a716-446655440002'::uuid,
  425.00,
  'cleared',
  CURRENT_DATE - INTERVAL '1 week'
),
(
  '550e8400-e29b-41d4-a716-446655440702'::uuid,
  '550e8400-e29b-41d4-a716-446655440502'::uuid,
  '550e8400-e29b-41d4-a716-446655440001'::uuid,
  '550e8400-e29b-41d4-a716-446655440003'::uuid,
  150.00,
  'pending',
  NULL
);

-- ============================================================================
-- 9. INSERT SAMPLE COMPLIANCE RECORDS
-- ============================================================================

INSERT INTO compliance_records (
  id, dataset_id, audit_id, status, findings, risk_level
) VALUES
(
  '550e8400-e29b-41d4-a716-446655440801'::uuid,
  '550e8400-e29b-41d4-a716-446655440201'::uuid,
  '550e8400-e29b-41d4-a716-446655440901'::uuid,
  'approved',
  'Data properly anonymized, encryption at rest verified',
  'low'
),
(
  '550e8400-e29b-41d4-a716-446655440802'::uuid,
  '550e8400-e29b-41d4-a716-446655440202'::uuid,
  '550e8400-e29b-41d4-a716-446655440902'::uuid,
  'pending',
  'Access controls need review, encryption in transit required',
  'medium'
);

-- ============================================================================
-- 10. INSERT SAMPLE CONNECTORS
-- ============================================================================

INSERT INTO connectors (
  id, participant_id, name, url, data_source_type, status, configuration
) VALUES
(
  '550e8400-e29b-41d4-a716-446655440a01'::uuid,
  '550e8400-e29b-41d4-a716-446655440001'::uuid,
  'PostgreSQL Connector',
  'postgresql://localhost:5432/business_db',
  'relational_db',
  'active',
  '{"database": "business_db", "schema": "public"}'::jsonb
),
(
  '550e8400-e29b-41d4-a716-446655440a02'::uuid,
  '550e8400-e29b-41d4-a716-446655440003'::uuid,
  'S3 Cloud Storage Connector',
  'https://s3.amazonaws.com/research-data',
  'cloud_storage',
  'active',
  '{"bucket": "research-data", "region": "us-east-1"}'::jsonb
),
(
  '550e8400-e29b-41d4-a716-446655440a03'::uuid,
  '550e8400-e29b-41d4-a716-446655440002'::uuid,
  'REST API Connector',
  'https://api.analytics.example.com/v1',
  'api',
  'active',
  '{"authentication": "oauth2", "timeout": 30}'::jsonb
);

-- ============================================================================
-- 11. INSERT SAMPLE APPS
-- ============================================================================

INSERT INTO apps (id, connector_id, name, description, version, status) VALUES
(
  '550e8400-e29b-41d4-a716-446655440b01'::uuid,
  '550e8400-e29b-41d4-a716-446655440a01'::uuid,
  'Data Extractor',
  'Extracts and transforms data from database',
  '1.0.0',
  'published'
),
(
  '550e8400-e29b-41d4-a716-446655440b02'::uuid,
  '550e8400-e29b-41d4-a716-446655440a02'::uuid,
  'S3 Sync Manager',
  'Manages data synchronization with S3',
  '2.1.0',
  'published'
),
(
  '550e8400-e29b-41d4-a716-446655440b03'::uuid,
  '550e8400-e29b-41d4-a716-446655440a03'::uuid,
  'Analytics Aggregator',
  'Aggregates analytics data from multiple sources',
  '1.5.0',
  'published'
);

-- ============================================================================
-- 12. INSERT SAMPLE AUDIT LOGS
-- ============================================================================

INSERT INTO audit_logs (
  user_id, user_name, action, resource_type, resource_id,
  resource_name, status, created_at
) VALUES
(
  '550e8400-e29b-41d4-a716-446655440001'::uuid,
  'admin@datahub.example.com',
  'CREATE',
  'dataset',
  '550e8400-e29b-41d4-a716-446655440201'::uuid,
  'Customer Base 2024',
  'success',
  NOW() - INTERVAL '5 days'
),
(
  '550e8400-e29b-41d4-a716-446655440002'::uuid,
  'user@analytics.example.com',
  'READ',
  'dataset',
  '550e8400-e29b-41d4-a716-446655440201'::uuid,
  'Customer Base 2024',
  'success',
  NOW() - INTERVAL '3 days'
),
(
  '550e8400-e29b-41d4-a716-446655440001'::uuid,
  'admin@datahub.example.com',
  'UPDATE',
  'contract',
  '550e8400-e29b-41d4-a716-446655440501'::uuid,
  'DataHub→Analytics Contract',
  'success',
  NOW() - INTERVAL '2 days'
),
(
  '550e8400-e29b-41d4-a716-446655440003'::uuid,
  'admin@research.example.com',
  'EXPORT',
  'dataset',
  '550e8400-e29b-41d4-a716-446655440202'::uuid,
  'Transaction History',
  'success',
  NOW() - INTERVAL '1 day'
);

-- ============================================================================
-- 13. INSERT SAMPLE SERVICE HEALTH
-- ============================================================================

INSERT INTO service_health (
  service_name, status, port, last_check, response_time_ms
) VALUES
('Identity Provider (IDP)', 'healthy', 3000, NOW(), 45),
('Broker Discovery', 'healthy', 3001, NOW(), 52),
('Schema Hub', 'healthy', 3002, NOW(), 38),
('Policy Authority', 'healthy', 3003, NOW(), 48),
('Contract Authority', 'healthy', 3004, NOW(), 55),
('Connector Service', 'checking', 3009, NOW(), NULL);

-- ============================================================================
-- VERIFY INSERTS
-- ============================================================================

SELECT 'Participants' as table_name, COUNT(*) as record_count FROM participants
UNION ALL
SELECT 'Datasets', COUNT(*) FROM datasets
UNION ALL
SELECT 'Schemas', COUNT(*) FROM schemas
UNION ALL
SELECT 'Policies', COUNT(*) FROM policies
UNION ALL
SELECT 'Contracts', COUNT(*) FROM contracts
UNION ALL
SELECT 'Transactions', COUNT(*) FROM transactions
UNION ALL
SELECT 'Clearing Records', COUNT(*) FROM clearing_records
UNION ALL
SELECT 'Compliance Records', COUNT(*) FROM compliance_records
UNION ALL
SELECT 'Connectors', COUNT(*) FROM connectors
UNION ALL
SELECT 'Apps', COUNT(*) FROM apps
UNION ALL
SELECT 'Audit Logs', COUNT(*) FROM audit_logs;

COMMIT;
