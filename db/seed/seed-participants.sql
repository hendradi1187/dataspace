-- Clear existing participants
DELETE FROM participants;

-- Insert seed participants
INSERT INTO participants (id, did, name, description, endpoint_url, public_key, status) VALUES
  (uuid_generate_v4(), 'did:example:participant1', 'Data Provider A', 'Medical data provider organization', 'https://provider-a.example.com', 'pk_med_provider_1', 'active'),
  (uuid_generate_v4(), 'did:example:participant2', 'Data Consumer B', 'Research institution specializing in healthcare analytics', 'https://consumer-b.example.com', 'pk_research_inst_1', 'active'),
  (uuid_generate_v4(), 'did:example:participant3', 'Connector C', 'Data connector service for interoperability', 'https://connector-c.example.com', 'pk_connector_1', 'active'),
  (uuid_generate_v4(), 'did:example:participant4', 'Financial Services Corp', 'Financial data aggregator and analytics platform', 'https://finserv.example.com', 'pk_fin_1', 'active'),
  (uuid_generate_v4(), 'did:example:participant5', 'Health Analytics Ltd', 'Healthcare data analytics and insights provider', 'https://health-analytics.example.com', 'pk_health_1', 'active'),
  (uuid_generate_v4(), 'did:example:participant6', 'Government Agency', 'Government health and welfare agency', 'https://gov-agency.example.com', 'pk_gov_1', 'active'),
  (uuid_generate_v4(), 'did:example:participant7', 'Academic Institution', 'University research center for data science', 'https://university.example.com', 'pk_academic_1', 'active'),
  (uuid_generate_v4(), 'did:example:participant8', 'Data Marketplace', 'Secure marketplace for data exchange and trading', 'https://marketplace.example.com', 'pk_market_1', 'active'),
  (uuid_generate_v4(), 'did:example:participant9', 'Healthcare Network', 'Integrated healthcare provider network', 'https://health-network.example.com', 'pk_health_net_1', 'active'),
  (uuid_generate_v4(), 'did:example:participant10', 'Insurance Company', 'Major insurance provider and analytics', 'https://insurance.example.com', 'pk_insurance_1', 'active');

-- Verify data was inserted
SELECT COUNT(*) as total_participants FROM participants;
SELECT 'Seed data inserted successfully' as status;
