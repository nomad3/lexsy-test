import { Knex } from 'knex';
import bcrypt from 'bcrypt';

export async function seed(knex: Knex): Promise<void> {
  // Delete existing entries (optional - use with caution)
  // await knex('users').del();

  // Hash password
  const passwordHash = await bcrypt.hash('Demo123!', 10);

  // Insert demo user
  await knex('users').insert([
    {
      email: 'demo@smartdocs.com',
      password_hash: passwordHash,
      full_name: 'Demo User',
      role: 'lawyer',
      organization: 'SmartDocs Demo',
      is_active: true,
    },
  ]).onConflict('email').ignore(); // Don't insert if email already exists
}
