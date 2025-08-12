const { SlashCommandBuilder } = require('discord.js');
const db = require('../services/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('set-oncall')
    .setDescription('Set on-call status for a developer')
    .addStringOption(o => o.setName('discordid').setDescription('Developer discord id').setRequired(true))
    .addBooleanOption(o => o.setName('isoncall').setDescription('Is this developer on-call?').setRequired(true)),
  async execute(interaction) {
    try {
      const discordId = interaction.options.getString('discordid');
      const isOnCall = interaction.options.getBoolean('isoncall');
      
      // First get the developer to find their ID
      const developer = await db.getDeveloperByDiscordId(discordId);
      if (!developer) {
        return await interaction.reply({ content: '❌ Developer not found.', ephemeral: true });
      }
      
      // Update the developer
      await db.updateDeveloper(developer.id, { is_oncall: isOnCall });
      await interaction.reply({ content: `✅ Updated on-call status to ${isOnCall ? 'ON' : 'OFF'}.`, ephemeral: true });
    } catch (error) {
      console.error('Error updating on-call status:', error);
      await interaction.reply({ 
        content: `❌ Failed to update on-call status: ${error.message}`, 
        ephemeral: true 
      });
    }
  }
};