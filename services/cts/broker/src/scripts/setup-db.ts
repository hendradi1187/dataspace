/**
 * Database setup script
 * Membuat database dan menjalankan migrasi schema
 * Jalankan: npx tsx src/scripts/setup-db.ts
 */

import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';

const setupDatabase = async () => {
  const adminPool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: 'postgres',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  });

  const dbName = process.env.DB_NAME || 'dataspace_dev';

  try {
    console.log('🗂️  Setting up database...');

    // Check if database exists
    console.log(`\n📋 Checking if database "${dbName}" exists...`);
    const checkResult = await adminPool.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (checkResult.rows.length === 0) {
      console.log(`📝 Creating database "${dbName}"...`);
      await adminPool.query(`CREATE DATABASE "${dbName}"`);
      console.log(`✅ Database "${dbName}" created`);
    } else {
      console.log(`✅ Database "${dbName}" already exists`);
    }

    await adminPool.end();

    // Connect to the new database and run schema
    const pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: dbName,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
    });

    console.log(`\n🗄️  Running schema migrations...`);

    // Read and execute schema file
    const schemaPath = join(process.cwd(), '..', '..', '..', 'db', 'ddl', '00-initial-schema.sql');
    console.log(`📂 Reading schema from: ${schemaPath}`);

    const schema = readFileSync(schemaPath, 'utf-8');

    // Split by semicolon and execute each statement
    const statements = schema
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const statement of statements) {
      try {
        await pool.query(statement);
      } catch (error: any) {
        // Ignore "already exists" errors
        if (!error.message.includes('already exists')) {
          throw error;
        }
      }
    }

    console.log(`✅ Schema migrations completed`);

    // Verify tables
    console.log(`\n🔍 Verifying database tables...`);
    const tablesResult = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log(`✅ Found ${tablesResult.rows.length} tables:`);
    tablesResult.rows.forEach((row: any) => {
      console.log(`   • ${row.table_name}`);
    });

    await pool.end();

    console.log(`\n✅ Database setup completed successfully!`);
    console.log(`\n📝 Next steps:`);
    console.log(`   1. Run seed script: npx tsx src/scripts/seed-participants.ts`);
    console.log(`   2. Start broker service: npm run dev`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
};

setupDatabase();
