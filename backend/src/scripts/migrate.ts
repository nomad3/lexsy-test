import knex from 'knex';
import config from '../../knexfile';

const environment = process.env.NODE_ENV || 'development';
const dbConfig = config[environment];

const db = knex(dbConfig);

async function migrate() {
  try {
    console.log('Starting migrations...');
    await db.migrate.latest();
    console.log('Migrations complete.');

    console.log('Starting seeds...');
    await db.seed.run();
    console.log('Seeds complete.');

    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

migrate();
