const { SlashCommandBuilder } = require('discord.js');
const knex = require('../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('set-oncall-days')
    .setDescription('Set oncall days for a developer')
    .addStringOption(o => o.setName('discordid').setDescription('Developer discord id').setRequired(true))
    .addStringOption(o => o.setName('oncalldays').setDescription('Comma separated weekdays (monday,tuesday)').setRequired(true)),
  async execute(interaction) {
    const discordId = interaction.options.getString('discordid');
    const oncallDays = interaction.options.getString('oncalldays');
    const updated = await knex('developers').where({ discord_id: discordId }).update({ oncall_days: oncallDays });
    if (updated) {
      await interaction.reply({ content: '✅ Updated on-call days.', ephemeral: true });
    } else {
      await interaction.reply({ content: '❌ Developer not found.', ephemeral: true });
    }
  }
};