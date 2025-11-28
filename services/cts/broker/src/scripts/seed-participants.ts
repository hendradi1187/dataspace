/**
 * Seed script untuk menambahkan data participants ke database
 * Jalankan: npx tsx src/scripts/seed-participants.ts
 */

import { query, initializePool } from '@dataspace/db';
import { randomUUID } from 'crypto';

const seedParticipants = async () => {
  try {
    // Initialize database pool
    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'dataspace_dev',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      max: 5,
    };

    console.log('🌱 Initializing database pool...');
    initializePool(dbConfig);
    console.log('✅ Database pool initialized');

    // Clear existing participants
    console.log('\n🗑️  Clearing existing participants...');
    await query('DELETE FROM participants');
    console.log('✅ Participants cleared');

    // Insert seed data
    console.log('\n🌱 Adding seed participants...');

    const participants = [
      {
        did: 'did:example:participant1',
        name: 'Data Provider A',
        description: 'Medical data provider organization',
        endpointUrl: 'https://provider-a.example.com',
        publicKey: 'pk_med_provider_1',
      },
      {
        did: 'did:example:participant2',
        name: 'Data Consumer B',
        description: 'Research institution specializing in healthcare analytics',
        endpointUrl: 'https://consumer-b.example.com',
        publicKey: 'pk_research_inst_1',
      },
      {
        did: 'did:example:participant3',
        name: 'Connector C',
        description: 'Data connector service for interoperability',
        endpointUrl: 'https://connector-c.example.com',
        publicKey: 'pk_connector_1',
      },
      {
        did: 'did:example:participant4',
        name: 'Financial Services Corp',
        description: 'Financial data aggregator and analytics platform',
        endpointUrl: 'https://finserv.example.com',
        publicKey: 'pk_fin_1',
      },
      {
        did: 'did:example:participant5',
        name: 'Health Analytics Ltd',
        description: 'Healthcare data analytics and insights provider',
        endpointUrl: 'https://health-analytics.example.com',
        publicKey: 'pk_health_1',
      },
      {
        did: 'did:example:participant6',
        name: 'Government Agency',
        description: 'Government health and welfare agency',
        endpointUrl: 'https://gov-agency.example.com',
        publicKey: 'pk_gov_1',
      },
      {
        did: 'did:example:participant7',
        name: 'Academic Institution',
        description: 'University research center for data science',
        endpointUrl: 'https://university.example.com',
        publicKey: 'pk_academic_1',
      },
      {
        did: 'did:example:participant8',
        name: 'Data Marketplace',
        description: 'Secure marketplace for data exchange and trading',
        endpointUrl: 'https://marketplace.example.com',
        publicKey: 'pk_market_1',
      },
    ];

    for (const participant of participants) {
      const result = await query(
        `INSERT INTO participants (id, did, name, description, endpoint_url, public_key, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        [
          randomUUID(),
          participant.did,
          participant.name,
          participant.description,
          participant.endpointUrl,
          participant.publicKey,
          'active',
        ]
      );
      console.log(`  ✅ ${participant.name} (${participant.did})`);
    }

    console.log('\n✅ Seed completed successfully!');
    console.log(`✅ Total ${participants.length} participants added`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seedParticipants();
