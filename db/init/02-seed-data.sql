-- Database Seed Data
-- This script populates initial test data for development

-- Connect to the development database
\connect dataspace_dev;

SET search_path TO public;

-- ============================================================================
-- SYSTEM CONFIGURATION
-- ============================================================================

INSERT INTO system_config (key, value, description) VALUES
('platform_name', 'Dataspace Platform', 'Name of the dataspace platform'),
('platform_version', '1.0.0', 'Platform version'),
('environment', 'development', 'Environment type'),
('api_base_url', 'http://localhost:5174', 'API base URL'),
('max_dataset_size', '10GB', 'Maximum dataset size'),
('max_participants', '100', 'Maximum number of participants');

-- ============================================================================
-- PARTICIPANTS
-- ============================================================================

INSERT INTO participants (did, name, description, endpoint_url, public_key, status, metadata) VALUES
('did:example:participant1', 'Alpha Corporation', 'Energy company with operational data', 'https://alpha.example.com', 'pk_alpha_001', 'active', '{"sector":"energy","region":"Southeast","employees":500}'::jsonb),
('did:example:participant2', 'Beta Industries', 'Manufacturing and supply chain data provider', 'https://beta.example.com', 'pk_beta_001', 'active', '{"sector":"manufacturing","region":"Central","employees":750}'::jsonb),
('did:example:participant3', 'Gamma Energy', 'Renewable energy provider with usage metrics', 'https://gamma.example.com', 'pk_gamma_001', 'active', '{"sector":"energy","region":"North","employees":300}'::jsonb),
('did:example:participant4', 'Delta Analytics', 'Data analytics and insights company', 'https://delta.example.com', 'pk_delta_001', 'active', '{"sector":"technology","region":"West","employees":200}'::jsonb),
('did:example:participant5', 'Epsilon Trading', 'Trading and commodity exchange platform', 'https://epsilon.example.com', 'pk_epsilon_001', 'active', '{"sector":"finance","region":"East","employees":450}'::jsonb),
('did:example:participant6', 'Zeta Logistics', 'Supply chain and logistics provider', 'https://zeta.example.com', 'pk_zeta_001', 'active', '{"sector":"logistics","region":"Southeast","employees":600}'::jsonb),
('did:example:participant7', 'Eta Finance', 'Financial services and banking', 'https://eta.example.com', 'pk_eta_001', 'active', '{"sector":"finance","region":"Central","employees":800}'::jsonb),
('did:example:participant8', 'Theta Resources', 'Natural resources and mining', 'https://theta.example.com', 'pk_theta_001', 'active', '{"sector":"mining","region":"North","employees":1000}'::jsonb),
('did:example:participant9', 'Iota Technology', 'Technology infrastructure provider', 'https://iota.example.com', 'pk_iota_001', 'active', '{"sector":"technology","region":"West","employees":350}'::jsonb),
('did:example:participant10', 'Kappa Utilities', 'Public utilities and infrastructure', 'https://kappa.example.com', 'pk_kappa_001', 'active', '{"sector":"utilities","region":"East","employees":2000}'::jsonb);

-- ============================================================================
-- DATASETS
-- ============================================================================

INSERT INTO datasets (participant_id, name, description, schema_ref, data_category, status, metadata)
SELECT p.id, 'Energy Production Data', 'Daily energy production metrics from solar and wind facilities', 'schema:energy:production', 'energy', 'active', '{"frequency":"daily","records_per_day":1440,"format":"JSON","sensitivity":"public"}'::jsonb
FROM participants p WHERE p.did = 'did:example:participant1'
UNION ALL
SELECT p.id, 'Equipment Status', 'Real-time equipment operational status and alerts', 'schema:equipment:status', 'operations', 'active', '{"frequency":"real-time","format":"Avro","sensitivity":"confidential"}'::jsonb
FROM participants p WHERE p.did = 'did:example:participant1'
UNION ALL
SELECT p.id, 'Manufacturing Process Data', 'Production line metrics and quality control', 'schema:manufacturing:process', 'manufacturing', 'active', '{"frequency":"hourly","records_count":50000,"format":"Parquet","sensitivity":"restricted"}'::jsonb
FROM participants p WHERE p.did = 'did:example:participant2'
UNION ALL
SELECT p.id, 'Supply Chain Tracking', 'Product shipment and logistics tracking data', 'schema:logistics:tracking', 'logistics', 'active', '{"frequency":"real-time","format":"JSON","sensitivity":"confidential"}'::jsonb
FROM participants p WHERE p.did = 'did:example:participant2'
UNION ALL
SELECT p.id, 'Renewable Energy Output', 'Wind and solar farm output data', 'schema:energy:renewable', 'energy', 'active', '{"frequency":"15-minutes","format":"CSV","sensitivity":"public"}'::jsonb
FROM participants p WHERE p.did = 'did:example:participant3'
UNION ALL
SELECT p.id, 'Grid Performance Metrics', 'Electrical grid performance and stability metrics', 'schema:grid:performance', 'utilities', 'active', '{"frequency":"5-minutes","format":"InfluxDB","sensitivity":"internal"}'::jsonb
FROM participants p WHERE p.did = 'did:example:participant3'
UNION ALL
SELECT p.id, 'Market Analysis Reports', 'Comprehensive market and trend analysis data', 'schema:analytics:market', 'analytics', 'active', '{"frequency":"weekly","format":"JSON","sensitivity":"restricted"}'::jsonb
FROM participants p WHERE p.did = 'did:example:participant4'
UNION ALL
SELECT p.id, 'Commodity Prices', 'Real-time commodity trading prices and volumes', 'schema:trading:commodities', 'finance', 'active', '{"frequency":"real-time","format":"FIX","sensitivity":"public"}'::jsonb
FROM participants p WHERE p.did = 'did:example:participant5'
UNION ALL
SELECT p.id, 'Trade Settlement', 'Trade settlement and clearing records', 'schema:trading:settlement', 'finance', 'active', '{"frequency":"daily","format":"SWIFT","sensitivity":"restricted"}'::jsonb
FROM participants p WHERE p.did = 'did:example:participant5'
UNION ALL
SELECT p.id, 'Shipment Records', 'Complete shipment and delivery history', 'schema:logistics:shipments', 'logistics', 'active', '{"frequency":"daily","format":"JSON","sensitivity":"confidential"}'::jsonb
FROM participants p WHERE p.did = 'did:example:participant6'
UNION ALL
SELECT p.id, 'Vehicle Telemetry', 'GPS and vehicle sensor data from logistics fleet', 'schema:logistics:telemetry', 'logistics', 'active', '{"frequency":"1-second","format":"Protobuf","sensitivity":"confidential"}'::jsonb
FROM participants p WHERE p.did = 'did:example:participant6'
UNION ALL
SELECT p.id, 'Loan Portfolio', 'Loan origination and portfolio management data', 'schema:finance:loans', 'finance', 'active', '{"frequency":"daily","format":"JSON","sensitivity":"restricted"}'::jsonb
FROM participants p WHERE p.did = 'did:example:participant7'
UNION ALL
SELECT p.id, 'Customer Transactions', 'Banking transaction history and patterns', 'schema:finance:transactions', 'finance', 'active', '{"frequency":"real-time","format":"ISO20022","sensitivity":"restricted"}'::jsonb
FROM participants p WHERE p.did = 'did:example:participant7'
UNION ALL
SELECT p.id, 'Mining Operations', 'Underground mining operational metrics and safety data', 'schema:mining:operations', 'mining', 'active', '{"frequency":"hourly","format":"JSON","sensitivity":"restricted"}'::jsonb
FROM participants p WHERE p.did = 'did:example:participant8'
UNION ALL
SELECT p.id, 'Environmental Monitoring', 'Environmental impact and monitoring data', 'schema:mining:environmental', 'mining', 'active', '{"frequency":"daily","format":"JSON","sensitivity":"public"}'::jsonb
FROM participants p WHERE p.did = 'did:example:participant8'
UNION ALL
SELECT p.id, 'Infrastructure Metrics', 'Data center and network infrastructure performance', 'schema:technology:infrastructure', 'technology', 'active', '{"frequency":"real-time","format":"Prometheus","sensitivity":"internal"}'::jsonb
FROM participants p WHERE p.did = 'did:example:participant9'
UNION ALL
SELECT p.id, 'API Usage Statistics', 'API consumption and usage patterns', 'schema:technology:api', 'technology', 'active', '{"frequency":"hourly","format":"JSON","sensitivity":"internal"}'::jsonb
FROM participants p WHERE p.did = 'did:example:participant9'
UNION ALL
SELECT p.id, 'Power Consumption', 'Utility power consumption and demand data', 'schema:utilities:consumption', 'utilities', 'active', '{"frequency":"15-minutes","format":"MDMS","sensitivity":"public"}'::jsonb
FROM participants p WHERE p.did = 'did:example:participant10'
UNION ALL
SELECT p.id, 'Water Usage', 'Water consumption and quality monitoring', 'schema:utilities:water', 'utilities', 'active', '{"frequency":"hourly","format":"JSON","sensitivity":"public"}'::jsonb
FROM participants p WHERE p.did = 'did:example:participant10';

-- ============================================================================
-- SCHEMAS
-- ============================================================================

INSERT INTO schemas (name, version, type, definition, description, status) VALUES
('schema:energy:production', '1.0.0', 'record', '{"fields":[{"name":"timestamp","type":"long"},{"name":"facility_id","type":"string"},{"name":"power_output","type":"double","unit":"MW"},{"name":"status","type":"string"}]}'::jsonb, 'Energy production measurement schema', 'active'),
('schema:equipment:status', '1.0.0', 'record', '{"fields":[{"name":"equipment_id","type":"string"},{"name":"status","type":"enum","symbols":["operational","maintenance","error"]},{"name":"last_update","type":"long"},{"name":"error_code","type":"string"}]}'::jsonb, 'Equipment operational status schema', 'active'),
('schema:manufacturing:process', '1.0.0', 'record', '{"fields":[{"name":"line_id","type":"string"},{"name":"timestamp","type":"long"},{"name":"units_produced","type":"int"},{"name":"defect_rate","type":"double"}]}'::jsonb, 'Manufacturing process metrics schema', 'active'),
('schema:logistics:tracking', '1.0.0', 'record', '{"fields":[{"name":"shipment_id","type":"string"},{"name":"location","type":"record"},{"name":"timestamp","type":"long"},{"name":"status","type":"string"}]}'::jsonb, 'Logistics tracking schema', 'active'),
('schema:energy:renewable', '1.0.0', 'record', '{"fields":[{"name":"timestamp","type":"long"},{"name":"farm_id","type":"string"},{"name":"wind_speed","type":"double"},{"name":"solar_irradiance","type":"double"},{"name":"output_mw","type":"double"}]}'::jsonb, 'Renewable energy output schema', 'active'),
('schema:grid:performance', '1.0.0', 'record', '{"fields":[{"name":"timestamp","type":"long"},{"name":"frequency_hz","type":"double"},{"name":"voltage_rms","type":"double"},{"name":"demand_mw","type":"double"}]}'::jsonb, 'Grid performance metrics schema', 'active'),
('schema:analytics:market', '1.0.0', 'record', '{"fields":[{"name":"report_date","type":"string"},{"name":"market_segment","type":"string"},{"name":"trend_score","type":"double"},{"name":"summary","type":"string"}]}'::jsonb, 'Market analysis schema', 'active'),
('schema:trading:commodities', '1.0.0', 'record', '{"fields":[{"name":"timestamp","type":"long"},{"name":"commodity_code","type":"string"},{"name":"price","type":"double"},{"name":"volume","type":"long"}]}'::jsonb, 'Commodity trading schema', 'active'),
('schema:trading:settlement', '1.0.0', 'record', '{"fields":[{"name":"trade_id","type":"string"},{"name":"settlement_date","type":"string"},{"name":"amount","type":"double"},{"name":"status","type":"string"}]}'::jsonb, 'Trade settlement schema', 'active'),
('schema:logistics:shipments', '1.0.0', 'record', '{"fields":[{"name":"shipment_id","type":"string"},{"name":"origin","type":"string"},{"name":"destination","type":"string"},{"name":"delivery_date","type":"string"}]}'::jsonb, 'Shipment records schema', 'active'),
('schema:logistics:telemetry', '1.0.0', 'record', '{"fields":[{"name":"vehicle_id","type":"string"},{"name":"timestamp","type":"long"},{"name":"latitude","type":"double"},{"name":"longitude","type":"double"},{"name":"speed_kmh","type":"double"}]}'::jsonb, 'Vehicle telemetry schema', 'active'),
('schema:finance:loans', '1.0.0', 'record', '{"fields":[{"name":"loan_id","type":"string"},{"name":"borrower_id","type":"string"},{"name":"amount","type":"double"},{"name":"status","type":"string"}]}'::jsonb, 'Loan portfolio schema', 'active'),
('schema:finance:transactions', '1.0.0', 'record', '{"fields":[{"name":"transaction_id","type":"string"},{"name":"account_id","type":"string"},{"name":"amount","type":"double"},{"name":"timestamp","type":"long"}]}'::jsonb, 'Transaction records schema', 'active'),
('schema:mining:operations', '1.0.0', 'record', '{"fields":[{"name":"mine_id","type":"string"},{"name":"timestamp","type":"long"},{"name":"ore_extracted_tons","type":"double"},{"name":"safety_incidents","type":"int"}]}'::jsonb, 'Mining operations schema', 'active'),
('schema:mining:environmental', '1.0.0', 'record', '{"fields":[{"name":"location_id","type":"string"},{"name":"date","type":"string"},{"name":"emissions_tons_co2","type":"double"},{"name":"water_quality_score","type":"double"}]}'::jsonb, 'Environmental monitoring schema', 'active'),
('schema:technology:infrastructure', '1.0.0', 'record', '{"fields":[{"name":"timestamp","type":"long"},{"name":"server_id","type":"string"},{"name":"cpu_usage","type":"double"},{"name":"memory_gb","type":"double"}]}'::jsonb, 'Infrastructure metrics schema', 'active'),
('schema:technology:api', '1.0.0', 'record', '{"fields":[{"name":"timestamp","type":"long"},{"name":"endpoint","type":"string"},{"name":"requests","type":"long"},{"name":"latency_ms","type":"double"}]}'::jsonb, 'API usage schema', 'active'),
('schema:utilities:consumption', '1.0.0', 'record', '{"fields":[{"name":"meter_id","type":"string"},{"name":"timestamp","type":"long"},{"name":"kwh_consumed","type":"double"},{"name":"rate_class","type":"string"}]}'::jsonb, 'Power consumption schema', 'active'),
('schema:utilities:water', '1.0.0', 'record', '{"fields":[{"name":"meter_id","type":"string"},{"name":"date","type":"string"},{"name":"liters_used","type":"double"},{"name":"quality_ph","type":"double"}]}'::jsonb, 'Water usage schema', 'active');

-- ============================================================================
-- VOCABULARIES
-- ============================================================================

INSERT INTO vocabularies (name, description, namespace, terms, status) VALUES
('equipment_status', 'Equipment operational status terms', 'vocab:equipment', '{"terms":["operational","maintenance","error","offline","standby"]}'::jsonb, 'active'),
('data_sensitivity', 'Data sensitivity classification', 'vocab:data', '{"terms":["public","internal","confidential","restricted","secret"]}'::jsonb, 'active'),
('sector_classification', 'Industry sector classifications', 'vocab:business', '{"terms":["energy","manufacturing","finance","logistics","technology","utilities","mining","healthcare"]}'::jsonb, 'active'),
('data_format', 'Supported data formats', 'vocab:technical', '{"terms":["JSON","CSV","Parquet","Avro","Protobuf","FIX","ISO20022","MDMS","InfluxDB","SWIFT"]}'::jsonb, 'active'),
('region_codes', 'Geographic region codes', 'vocab:geo', '{"terms":["North","Central","South","East","West","Southeast","Southwest","Northeast","Northwest"]}'::jsonb, 'active');

-- ============================================================================
-- POLICIES
-- ============================================================================

INSERT INTO policies (name, description, rules, status) VALUES
('Data_Access_Policy', 'Control access to shared datasets', '{"rules":[{"resource":"dataset","action":"read","condition":"user.role=analyst"},{"resource":"dataset","action":"write","condition":"user.role=data_owner"}]}'::jsonb, 'active'),
('Data_Retention_Policy', 'Define data retention periods', '{"rules":[{"data_type":"operational","retention_days":365},{"data_type":"transactional","retention_days":2555}]}'::jsonb, 'active'),
('Data_Privacy_Policy', 'Enforce privacy requirements', '{"rules":[{"requirement":"encrypt_pii","sensitivity":"restricted"},{"requirement":"anonymize","sensitivity":"confidential"}]}'::jsonb, 'active'),
('Data_Quality_Policy', 'Ensure minimum data quality standards', '{"rules":[{"metric":"completeness","minimum":95},{"metric":"accuracy","minimum":99}]}'::jsonb, 'active'),
('Audit_Policy', 'Define audit and logging requirements', '{"rules":[{"event":"data_access","log":true},{"event":"data_modification","log":true}]}'::jsonb, 'active');

-- ============================================================================
-- CONTRACTS
-- ============================================================================

INSERT INTO contracts (name, description, rules, status) VALUES
('Data_Sharing_Agreement', 'Master data sharing agreement between participants', '{"terms":[{"clause":"confidentiality","period":"perpetual"},{"clause":"non_disclosure","scope":"third_parties"}]}'::jsonb, 'active'),
('Service_Level_Agreement', 'SLA for data delivery and quality', '{"metrics":[{"metric":"availability","target":99.9},{"metric":"response_time_ms","target":500}]}'::jsonb, 'active'),
('Data_Usage_Rights', 'Define permitted uses of shared data', '{"permissions":[{"use_case":"analytics","allowed":true},{"use_case":"commercial_resale","allowed":false}]}'::jsonb, 'active'),
('Liability_Agreement', 'Liability and indemnification terms', '{"terms":[{"liability":"data_errors","limit":10000},{"liability":"service_interruption","limit":50000}]}'::jsonb, 'active'),
('IP_Rights_Agreement', 'Intellectual property rights agreement', '{"rights":[{"type":"patent","ownership":"participant"},{"type":"copyright","ownership":"shared"}]}'::jsonb, 'active');

-- ============================================================================
-- COMPLIANCE RECORDS
-- ============================================================================

INSERT INTO compliance_records (name, description, rules, status, audit_date, result) VALUES
('GDPR_Compliance_Audit', 'GDPR compliance verification', '{"requirements":["data_subject_rights","privacy_impact_assessment","data_minimization"]}'::jsonb, 'completed', NOW(), 'compliant'),
('Data_Security_Audit', 'Security control assessment', '{"requirements":["encryption_at_rest","encryption_in_transit","access_controls"]}'::jsonb, 'completed', NOW() - INTERVAL '30 days', 'compliant_with_observations'),
('Data_Quality_Audit', 'Data quality and integrity check', '{"requirements":["data_completeness","data_accuracy","data_consistency"]}'::jsonb, 'completed', NOW() - INTERVAL '60 days', 'compliant'),
('Operational_Audit', 'Operational efficiency audit', '{"requirements":["sla_compliance","incident_response","monitoring"]}'::jsonb, 'in_progress', NULL, NULL),
('Financial_Audit', 'Financial and billing audit', '{"requirements":["cost_allocation","billing_accuracy","budget_compliance"]}'::jsonb, 'scheduled', NOW() + INTERVAL '30 days', NULL);

-- ============================================================================
-- TRANSACTIONS
-- ============================================================================

INSERT INTO transactions (transaction_id, name, description, rules, status, amount, currency) VALUES
('TXN001', 'Data Exchange Transaction', 'Data sharing transaction between Alpha and Beta', '{"parties":["Alpha","Beta"],"dataset":"manufacturing_metrics"}'::jsonb, 'completed', 5000.00, 'USD'),
('TXN002', 'Analytics Licensing', 'Monthly analytics data license', '{"licensee":"Delta","data_source":"market_analysis"}'::jsonb, 'completed', 2500.00, 'USD'),
('TXN003', 'API Usage Billing', 'Monthly API consumption charges', '{"consumer":"Gamma","requests":150000}'::jsonb, 'pending', 750.00, 'USD'),
('TXN004', 'Data Pipeline Setup', 'Custom data pipeline implementation', '{"participant":"Zeta","service":"logistics_tracking"}'::jsonb, 'in_progress', 10000.00, 'USD'),
('TXN005', 'Consulting Services', 'Data governance consulting engagement', '{"client":"Theta","duration_hours":80}'::jsonb, 'completed', 8000.00, 'USD');

-- ============================================================================
-- CLEARING RECORDS
-- ============================================================================

INSERT INTO clearing_records (name, description, rules, status, clearing_date, amount, currency) VALUES
('Daily_Clearing_20241127', 'Daily settlement of all transactions', '{"settlement_type":"daily","batch_size":145}'::jsonb, 'completed', NOW(), 26250.00, 'USD'),
('Monthly_Reconciliation_Nov2024', 'Monthly account reconciliation', '{"reconciliation_type":"monthly","discrepancies":0}'::jsonb, 'completed', NOW() - INTERVAL '1 days', 100000.00, 'USD'),
('Quarterly_Settlement_Q4', 'Quarterly inter-participant settlement', '{"settlement_type":"quarterly","participants":10}'::jsonb, 'pending', NOW() + INTERVAL '5 days', 500000.00, 'USD');

-- ============================================================================
-- APPS
-- ============================================================================

INSERT INTO apps (name, description, version, app_type, config, status) VALUES
('Dashboard', 'Central monitoring and analytics dashboard', '1.0.0', 'analytics', '{"features":["real_time_metrics","data_visualization","alerts"]}'::jsonb, 'active'),
('Data_Explorer', 'Interactive data exploration and query tool', '2.1.0', 'analytics', '{"features":["sql_query","data_preview","export"]}'::jsonb, 'active'),
('Compliance_Manager', 'Compliance tracking and reporting tool', '1.5.0', 'governance', '{"features":["audit_trail","compliance_reports","remediation_tracking"]}'::jsonb, 'active'),
('API_Gateway', 'API management and throttling', '3.0.0', 'infrastructure', '{"features":["rate_limiting","authentication","logging"]}'::jsonb, 'active'),
('Data_Catalog', 'Data discovery and metadata management', '1.2.0', 'metadata', '{"features":["search","lineage","tagging"]}'::jsonb, 'active');

-- ============================================================================
-- CONNECTORS
-- ============================================================================

INSERT INTO connectors (name, description, connector_type, config, status) VALUES
('PostgreSQL_Connector', 'Connect to PostgreSQL databases', 'database', '{"driver":"postgresql","version":"16"}'::jsonb, 'active'),
('REST_API_Connector', 'Connect to REST API endpoints', 'api', '{"protocol":"https","auth_types":["bearer","api_key"]}'::jsonb, 'active'),
('Kafka_Connector', 'Stream data from Kafka topics', 'streaming', '{"brokers":["kafka:9092"],"version":"3.0"}'::jsonb, 'active'),
('SFTP_Connector', 'Transfer files via SFTP', 'file_transfer', '{"port":22,"encryption":"true"}'::jsonb, 'active'),
('GraphQL_Connector', 'Connect to GraphQL endpoints', 'api', '{"protocol":"https","auth_types":["bearer"]}'::jsonb, 'active');

-- ============================================================================
-- AUDIT LOGS
-- ============================================================================

INSERT INTO audit_logs (action, resource_type, resource_id, user_id, changes, status, created_at) VALUES
('create', 'participant', 'did:example:participant1', NULL, '{"name":"Alpha Corporation"}'::jsonb, 'success', NOW() - INTERVAL '7 days'),
('create', 'dataset', 'energy_production_1', NULL, '{"name":"Energy Production Data"}'::jsonb, 'success', NOW() - INTERVAL '7 days'),
('update', 'policy', 'policy_data_access', NULL, '{"status":"active"}'::jsonb, 'success', NOW() - INTERVAL '5 days'),
('delete', 'contract', 'old_contract_1', NULL, '{"reason":"expired"}'::jsonb, 'success', NOW() - INTERVAL '3 days'),
('read', 'dataset', 'manufacturing_process_1', NULL, '{"access_level":"read_only"}'::jsonb, 'success', NOW() - INTERVAL '1 days');

-- ============================================================================
-- COMMIT
-- ============================================================================

COMMIT;
