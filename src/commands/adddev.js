const { SlashCommandBuilder } = require('discord.js');
const knex = require('../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('adddev')
    .setDescription('Add a developer to the DB')
    .addStringOption(opt => opt.setName('name').setDescription('Developer name').setRequired(true))
    .addStringOption(opt => opt.setName('discordid').setDescription('Discord user id (numeric)').setRequired(true))
    .addStringOption(opt => opt.setName('skills').setDescription('Comma separated skills').setRequired(false))
    .addStringOption(opt => opt.setName('oncalldays').setDescription('Comma separated weekdays (monday, tuesday)').setRequired(false)),
  async execute(interaction) {
    const name = interaction.options.getString('name');
    const discordId = interaction.options.getString('discordid');
    const skills = interaction.options.getString('skills') || '';
    const oncallDays = interaction.options.getString('oncalldays') || '';

    await knex('developers').insert({
      name,
      discord_id: discordId,
      skills,
      oncall_days: oncallDays
    });

    await interaction.reply({ content: `✅ Added ${name} (${discordId})`, ephemeral: true });
  }
};