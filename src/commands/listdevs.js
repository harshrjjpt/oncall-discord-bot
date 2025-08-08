const { SlashCommandBuilder } = require('discord.js');
const knex = require('../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('listdevs')
    .setDescription('List all developers in DB'),
  async execute(interaction) {
    const rows = await knex('developers').select();
    if (!rows.length) return interaction.reply({ content: 'No developers in DB', ephemeral: true });

    const lines = rows.map(r => `• **${r.name}** (<@${r.discord_id}>) — skills: ${r.skills || '-'} — oncall: ${r.oncall_days || '-'}`);
    await interaction.reply({ content: lines.join('\n'), ephemeral: true });
  }
};