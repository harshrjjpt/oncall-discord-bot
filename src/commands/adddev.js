const { SlashCommandBuilder } = require('discord.js');
const db = require('../services/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('adddev')
    .setDescription('Add a developer to the DB')
    .addStringOption(opt => opt.setName('name').setDescription('Developer name').setRequired(true))
    .addStringOption(opt => opt.setName('discordid').setDescription('Discord user id (numeric)').setRequired(true))
    .addStringOption(opt => opt.setName('skills').setDescription('Comma separated skills').setRequired(false))
    .addBooleanOption(opt => opt.setName('oncall').setDescription('Is on call?').setRequired(false)),
  async execute(interaction) {
    try {
      const name = interaction.options.getString('name');
      const discordId = interaction.options.getString('discordid');
      const skills = interaction.options.getString('skills') || '';
      const isOnCall = interaction.options.getBoolean('oncall') || false;

      await db.addDeveloper({
        name,
        discord_id: discordId,
        skills,
        is_oncall: isOnCall
      });

      await interaction.reply({ content: `✅ Added ${name} (${discordId})`, ephemeral: true });
    } catch (error) {
      console.error('Error adding developer:', error);
      await interaction.reply({ 
        content: `❌ Failed to add developer: ${error.message}`, 
        ephemeral: true 
      });
    }
  }
};