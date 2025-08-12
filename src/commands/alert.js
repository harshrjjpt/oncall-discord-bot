const { SlashCommandBuilder } = require('discord.js');
const db = require('../services/database');
const { findBestMatch } = require('../services/matcher');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('alert')
    .setDescription('Raise an urgent issue and contact on-call or best dev')
    .addStringOption(opt => opt.setName('issue').setDescription('Issue description').setRequired(true)),
  async execute(interaction) {
    try {
      const issue = interaction.options.getString('issue');
      const weekday = new Date().toLocaleString('en-US', { weekday: 'long', timeZone: 'Asia/Kolkata' }).toLowerCase();

      // 1) find on-call developers
      const oncallDevelopers = await db.getOncallDevelopers();
      const oncall = oncallDevelopers[0]; // Get the first on-call developer

      if (oncall) {
        await interaction.reply({ content: `📢 Notifying on-call: **${oncall.name}** (<@${oncall.discord_id}>)\nIssue: ${issue}`, ephemeral: false });
        // send DM (try)
        try {
          const user = await interaction.client.users.fetch(oncall.discord_id);
          await user.send(`🚨 Urgent issue reported: ${issue}\nFrom: ${interaction.user.tag}\nChannel: ${interaction.channelId}`);
        } catch (err) {
          console.warn('Failed to DM on-call', err);
        }
        return;
      }

      // 2) No oncall today => fallback to skill-matching
      const allDevs = await db.getAllDevelopers();
      const best = findBestMatch(allDevs, issue, parseFloat(process.env.MATCH_THRESHOLD || '0.1'));

      if (best) {
        await interaction.reply({ content: `⚠ No on-call today. Best match: **${best.name}** (<@${best.discord_id}>)\nIssue: ${issue}`, ephemeral: false });
        try {
          const user = await interaction.client.users.fetch(best.discord_id);
          await user.send(`🚨 Urgent issue (best match): ${issue}\nFrom: ${interaction.user.tag}\nChannel: ${interaction.channelId}`);
        } catch (err) {
          console.warn('Failed to DM best match', err);
        }
        return;
      }

      // 3) Nothing found
      await interaction.reply({ content: `❌ No on-call and no suitable match found. Please escalate manually. Issue: ${issue}`, ephemeral: false });
    } catch (error) {
      console.error('Error in alert command:', error);
      await interaction.reply({ 
        content: `❌ Failed to process alert: ${error.message}`, 
        ephemeral: true 
      });
    }
  }
};