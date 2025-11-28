-- ============================================================================
-- DATABASE CONNECTION TEST SCRIPT
-- Tests basic connectivity and security
-- ============================================================================

-- Test 1: Check PostgreSQL Version
SELECT 'Test 1: PostgreSQL Version' as test_name;
SELECT version();

-- Test 2: Check Current User and Database
SELECT 'Test 2: Current User and Database' as test_name;
SELECT current_user, current_database();

-- Test 3: Check Database Exists
SELECT 'Test 3: Dataspace Database Check' as test_name;
SELECT datname, datdba, encoding FROM pg_database WHERE datname = 'dataspace_dev';

-- Test 4: Check if dataspace_dev has tables
SELECT 'Test 4: Tables in dataspace_dev' as test_name;
SELECT COUNT(*) as table_count FROM information_schema.tables
WHERE table_schema = 'public';

-- Test 5: Check Specific Tables
SELECT 'Test 5: Core Tables Present' as test_name;
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Test 6: Check Indexes
SELECT 'Test 6: Indexes in Database' as test_name;
SELECT COUNT(*) as index_count FROM pg_indexes WHERE schemaname = 'public';

-- Test 7: Check Foreign Keys
SELECT 'Test 7: Foreign Key Constraints' as test_name;
SELECT COUNT(*) as fk_count FROM information_schema.table_constraints
WHERE constraint_type = 'FOREIGN KEY' AND table_schema = 'public';

-- Test 8: Check Data
SELECT 'Test 8: Sample Data Check' as test_name;
SELECT
  'participants' as table_name, COUNT(*) as row_count FROM participants
UNION ALL
SELECT 'datasets', COUNT(*) FROM datasets
UNION ALL
SELECT 'contracts', COUNT(*) FROM contracts
UNION ALL
SELECT 'policies', COUNT(*) FROM policies
UNION ALL
SELECT 'schemas', COUNT(*) FROM schemas;

-- Test 9: Check Audit Logs
SELECT 'Test 9: Audit Logs' as test_name;
SELECT COUNT(*) as audit_log_count FROM audit_logs;

-- Test 10: Check System Config
SELECT 'Test 10: System Configuration' as test_name;
SELECT key, value FROM system_config;
