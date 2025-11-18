import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  // Enable UUID extension
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

  // Users table
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('email', 255).unique().notNullable();
    table.string('password_hash', 255).notNullable();
    table.string('full_name', 255).notNullable();
    table.string('role', 50).notNullable().checkIn(['lawyer', 'admin']);
    table.string('organization', 255);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('last_login');
    table.boolean('is_active').defaultTo(true);
  });

  // Sessions table
  await knex.schema.createTable('sessions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('token', 500).notNullable();
    table.timestamp('expires_at').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.string('ip_address', 45);
    table.text('user_agent');

    table.index('token', 'idx_sessions_token');
    table.index('user_id', 'idx_sessions_user_id');
  });

  // AI Agents table
  await knex.schema.createTable('ai_agents', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('name', 255).notNullable();
    table.string('type', 50).notNullable().checkIn(['extractor', 'validator', 'analyzer', 'recommender']);
    table.string('model', 100).notNullable();
    table.text('system_prompt').notNullable();
    table.jsonb('config').defaultTo('{}');
    table.boolean('active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  // AI Tasks table
  await knex.schema.createTable('ai_tasks', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('agent_id').notNullable().references('id').inTable('ai_agents');
    table.string('task_type', 100).notNullable();
    table.jsonb('input_data').notNullable();
    table.jsonb('output_data');
    table.string('status', 50).notNullable().checkIn(['pending', 'processing', 'completed', 'failed']);
    table.integer('tokens_used');
    table.decimal('cost', 10, 6);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('completed_at');
    table.text('error');

    table.index('agent_id', 'idx_ai_tasks_agent_id');
    table.index('status', 'idx_ai_tasks_status');
    table.index('created_at', 'idx_ai_tasks_created_at');
  });

  // AI Insights table
  await knex.schema.createTable('ai_insights', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('insight_type', 50).notNullable().checkIn(['anomaly', 'pattern', 'suggestion', 'risk']);
    table.string('entity_type', 50).notNullable();
    table.uuid('entity_id').notNullable();
    table.string('title', 255).notNullable();
    table.text('description');
    table.float('confidence').checkBetween([0, 1]);
    table.uuid('agent_id').references('id').inTable('ai_agents');
    table.jsonb('metadata').defaultTo('{}');
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index(['entity_type', 'entity_id'], 'idx_ai_insights_entity');
    table.index('created_at', 'idx_ai_insights_created_at');
  });

  // AI Training Data table
  await knex.schema.createTable('ai_training_data', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('interaction_type', 50).notNullable().checkIn(['user_correction', 'validation', 'feedback']);
    table.jsonb('original_ai_output').notNullable();
    table.jsonb('user_correction').notNullable();
    table.jsonb('context').defaultTo('{}');
    table.uuid('agent_id').references('id').inTable('ai_agents');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.boolean('used_for_improvement').defaultTo(false);
  });

  // Documents table
  await knex.schema.createTable('documents', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('filename', 255).notNullable();
    table.string('file_path', 500).notNullable();
    table.timestamp('upload_date').defaultTo(knex.fn.now());
    table.string('status', 50).notNullable().checkIn(['uploaded', 'analyzing', 'ready', 'filling', 'completed']);
    table.string('document_type', 100);
    table.float('ai_classification_confidence');
    table.float('risk_score');
    table.integer('completion_percentage').defaultTo(0).checkBetween([0, 100]);
    table.jsonb('metadata').defaultTo('{}');

    table.index('user_id', 'idx_documents_user_id');
    table.index('status', 'idx_documents_status');
    table.index('upload_date', 'idx_documents_upload_date');
  });

  // Placeholders table
  await knex.schema.createTable('placeholders', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('document_id').notNullable().references('id').inTable('documents').onDelete('CASCADE');
    table.string('field_name', 255).notNullable();
    table.string('field_type', 50).notNullable();
    table.text('original_text');
    table.integer('position').notNullable();
    table.text('filled_value');
    table.text('ai_suggested_value');
    table.string('suggestion_source', 255);
    table.float('confidence');
    table.string('validation_status', 50).defaultTo('pending').checkIn(['pending', 'validated', 'flagged']);
    table.text('validation_notes');

    table.index('document_id', 'idx_placeholders_document_id');
    table.index(['document_id', 'position'], 'idx_placeholders_position');
  });

  // Document Templates table
  await knex.schema.createTable('document_templates', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('name', 255).notNullable();
    table.string('document_type', 100).notNullable();
    table.text('description');
    table.string('file_path', 500).notNullable();
    table.string('thumbnail_path', 500);
    table.jsonb('pre_extracted_placeholders').defaultTo('[]');
    table.integer('popularity').defaultTo(0);
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  // Data Room Documents table
  await knex.schema.createTable('data_room_documents', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('company_name', 255).notNullable();
    table.string('document_type', 100).notNullable();
    table.string('file_path', 500).notNullable();
    table.timestamp('upload_date').defaultTo(knex.fn.now());
    table.string('processing_status', 50).defaultTo('uploaded').checkIn(['uploaded', 'extracting', 'indexed', 'failed']);
    table.text('ai_summary');
    table.integer('key_entities_count').defaultTo(0);
    table.float('quality_score');

    table.index('user_id', 'idx_data_room_user_id');
    table.index('company_name', 'idx_data_room_company');
  });

  // Knowledge Graph table
  await knex.schema.createTable('knowledge_graph', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('entity_type', 100).notNullable();
    table.text('entity_value').notNullable();
    table.uuid('source_document_id').references('id').inTable('data_room_documents').onDelete('CASCADE');
    table.string('source_document_type', 100);
    table.jsonb('relationships').defaultTo('{}');
    table.float('confidence').checkBetween([0, 1]);
    table.timestamp('first_seen').defaultTo(knex.fn.now());
    table.timestamp('last_updated').defaultTo(knex.fn.now());
    table.integer('usage_count').defaultTo(0);

    table.index(['entity_type', 'entity_value'], 'idx_knowledge_graph_entity');
    table.index('source_document_id', 'idx_knowledge_graph_source');
  });

  // Document Relationships table
  await knex.schema.createTable('document_relationships', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('source_document_id').notNullable().references('id').inTable('documents').onDelete('CASCADE');
    table.uuid('related_document_id').notNullable().references('id').inTable('documents').onDelete('CASCADE');
    table.string('relationship_type', 50).notNullable().checkIn(['same_company', 'same_series', 'amendment', 'related_party']);
    table.float('confidence');
    table.uuid('detected_by').references('id').inTable('ai_agents');
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index('source_document_id', 'idx_doc_relationships_source');
    table.index('related_document_id', 'idx_doc_relationships_related');
  });

  // Cross Document Updates table
  await knex.schema.createTable('cross_document_updates', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('trigger_placeholder_id').notNullable().references('id').inTable('placeholders').onDelete('CASCADE');
    table.jsonb('affected_document_ids').notNullable();
    table.string('field_name', 255).notNullable();
    table.text('suggested_value').notNullable();
    table.string('user_action', 50).defaultTo('pending').checkIn(['pending', 'accepted', 'rejected']);
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  // Health Checks table
  await knex.schema.createTable('health_checks', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('document_id').notNullable().references('id').inTable('documents').onDelete('CASCADE');
    table.integer('overall_score').checkBetween([0, 100]);
    table.integer('completeness_score').checkBetween([0, 100]);
    table.integer('consistency_score').checkBetween([0, 100]);
    table.integer('risk_score').checkBetween([0, 100]);
    table.jsonb('issues').defaultTo('[]');
    table.jsonb('recommendations').defaultTo('[]');
    table.timestamp('checked_at').defaultTo(knex.fn.now());

    table.index('document_id', 'idx_health_checks_document');
    table.index('checked_at', 'idx_health_checks_date');
  });

  // Conflicts table
  await knex.schema.createTable('conflicts', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('document_id').notNullable().references('id').inTable('documents').onDelete('CASCADE');
    table.string('conflict_type', 50).notNullable().checkIn(['value_mismatch', 'missing_field', 'inconsistent_terms', 'unusual_value']);
    table.string('field_name', 255);
    table.text('current_value');
    table.text('expected_value');
    table.uuid('conflicting_document_id').references('id').inTable('documents');
    table.string('severity', 50).notNullable().checkIn(['critical', 'warning', 'info']);
    table.text('description');
    table.string('status', 50).defaultTo('open').checkIn(['open', 'acknowledged', 'resolved']);
    table.timestamp('detected_at').defaultTo(knex.fn.now());

    table.index('document_id', 'idx_conflicts_document');
    table.index('status', 'idx_conflicts_status');
  });

  // Search Queries table
  await knex.schema.createTable('search_queries', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('user_id').notNullable().references('id').inTable('users');
    table.text('query_text').notNullable();
    table.jsonb('parsed_filters');
    table.integer('results_count');
    table.uuid('ai_agent_id').references('id').inTable('ai_agents');
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index('user_id', 'idx_search_queries_user');
    table.index('created_at', 'idx_search_queries_created');
  });

  // Business Intelligence table
  await knex.schema.createTable('business_intelligence', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('metric_type', 100).notNullable();
    table.jsonb('metric_value').notNullable();
    table.specificType('time_period', 'TSRANGE');
    table.string('company_id', 255);
    table.uuid('calculated_by').references('id').inTable('ai_agents');
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index('metric_type', 'idx_bi_metric_type');
  });

  // Create GIST index for time_period (requires raw SQL for GIST)
  await knex.raw('CREATE INDEX idx_bi_time_period ON business_intelligence USING GIST (time_period)');
}


export async function down(knex: Knex): Promise<void> {
  // Drop tables in reverse order to respect foreign key constraints
  await knex.schema.dropTableIfExists('business_intelligence');
  await knex.schema.dropTableIfExists('search_queries');
  await knex.schema.dropTableIfExists('conflicts');
  await knex.schema.dropTableIfExists('health_checks');
  await knex.schema.dropTableIfExists('cross_document_updates');
  await knex.schema.dropTableIfExists('document_relationships');
  await knex.schema.dropTableIfExists('knowledge_graph');
  await knex.schema.dropTableIfExists('data_room_documents');
  await knex.schema.dropTableIfExists('document_templates');
  await knex.schema.dropTableIfExists('placeholders');
  await knex.schema.dropTableIfExists('documents');
  await knex.schema.dropTableIfExists('ai_training_data');
  await knex.schema.dropTableIfExists('ai_insights');
  await knex.schema.dropTableIfExists('ai_tasks');
  await knex.schema.dropTableIfExists('ai_agents');
  await knex.schema.dropTableIfExists('sessions');
  await knex.schema.dropTableIfExists('users');

  // Drop UUID extension
  await knex.raw('DROP EXTENSION IF EXISTS "uuid-ossp"');
}
