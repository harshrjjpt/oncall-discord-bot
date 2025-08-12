const { SlashCommandBuilder } = require('discord.js');
const db = require('../services/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('listdevs')
    .setDescription('List all developers in DB'),
  async execute(interaction) {
    try {
      const developers = await db.getAllDevelopers();
      if (!developers.length) {
        return interaction.reply({ content: 'No developers in DB', ephemeral: true });
      }

      const lines = developers.map(r => `• **${r.name}** (<@${r.discord_id}>) — skills: ${r.skills || '-'} — oncall: ${r.is_oncall ? '✅ ON' : '❌ OFF'}`);
      await interaction.reply({ content: lines.join('\n'), ephemeral: true });
    } catch (error) {
      console.error('Error listing developers:', error);
      await interaction.reply({ 
        content: `❌ Failed to list developers: ${error.message}`, 
        ephemeral: true 
      });
    }
  }
};