/**
 * columns:
 * - id
 * - name
 * - discord_id
 * - skills (string comma-separated)
 * - oncall_days (string comma-separated: monday,tuesday)
 * - created_at
 */
exports.up = function(knex) {
    return knex.schema.createTable('developers', table => {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.string('discord_id').notNullable();
      table.text('skills').defaultTo('');
      table.text('oncall_days').defaultTo(''); // comma-separated weekdays
      table.timestamp('created_at').defaultTo(knex.fn.now());
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTableIfExists('developers');
  };