exports.seed = async function(knex) {
    await knex('developers').del();
    await knex('developers').insert([
      { name: 'Alice', discord_id: '123456789012345678', skills: 'node,postgres,graphql', is_oncall: false },
      { name: 'Bob', discord_id: '234567890123456789', skills: 'react,ui,css', is_oncall: false },
      { name: 'Charlie', discord_id: '345678901234567890', skills: 'substreams,postgres,sql', is_oncall: false }
    ]);
  };