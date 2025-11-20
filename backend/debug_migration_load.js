const path = require('path');

const migrationPath = path.join(process.cwd(), 'dist/src/database/migrations/20251118160706_initial_schema.js');
console.log('Attempting to require:', migrationPath);

try {
  const migration = require(migrationPath);
  console.log('Successfully required migration file.');
  console.log('Exports:', Object.keys(migration));
} catch (error) {
  console.error('Failed to require migration file:');
  console.error(error);
}
