import knex from 'knex';
import config from './knexfile';

const db = knex(config.development);

async function checkDb() {
  try {
    const users = await db('users').select('id', 'email');
    console.log('Users:', users);

    const documents = await db('documents').select('id', 'filename', 'user_id');
    console.log('Documents:', documents);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.destroy();
  }
}

checkDb();
