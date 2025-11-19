import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Get demo user
  const user = await knex('users').where({ email: 'demo@lexsy.com' }).first();

  if (!user) {
    console.log('Demo user not found, skipping document seed');
    return;
  }

  // Delete existing documents for this user to avoid duplicates
  await knex('documents').where({ user_id: user.id }).del();

  // Insert a test document
  const [document] = await knex('documents').insert([
    {
      user_id: user.id,
      filename: 'Seed_NDA_Agreement.docx',
      file_path: '/app/uploads/seed_nda.docx', // Mock path
      status: 'ready', // Ready for filling
      document_type: 'Non-Disclosure Agreement',
      ai_classification_confidence: 0.98,
      risk_score: 10,
      completion_percentage: 0,
      metadata: JSON.stringify({ seeded: true }),
    }
  ]).returning('*');

  // Insert placeholders for the document
  await knex('placeholders').insert([
    {
      document_id: document.id,
      field_name: 'Effective Date',
      field_type: 'date',
      position: 1,
      original_text: '[Effective Date]',
      ai_suggested_value: '2023-10-27',
      suggestion_source: 'System Date',
      confidence: 0.95,
    },
    {
      document_id: document.id,
      field_name: 'Disclosing Party',
      field_type: 'organization',
      position: 2,
      original_text: '[Disclosing Party]',
      ai_suggested_value: 'Lexsy Inc.',
      suggestion_source: 'User Profile',
      confidence: 0.90,
    },
    {
      document_id: document.id,
      field_name: 'Recipient',
      field_type: 'person',
      position: 3,
      original_text: '[Recipient]',
      confidence: 0.85,
    },
    {
      document_id: document.id,
      field_name: 'Jurisdiction',
      field_type: 'location',
      position: 4,
      original_text: '[Jurisdiction]',
      ai_suggested_value: 'California',
      confidence: 0.88,
    }
  ]);

  console.log('Seeded 1 document with 4 placeholders');
}
