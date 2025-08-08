require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const knex = require('./db');
const cron = require('node-cron');
const { findBestMatch } = require('./services/matcher');
const winston = require('winston');

// logger
const logger = winston.createLogger({
  level: 'info',
  transports: [ new winston.transports.Console() ]
});

const TOKEN = process.env.BOT_TOKEN;
if (!TOKEN) {
  logger.error('BOT_TOKEN missing in .env');
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.commands = new Collection();

// load command files
const commandsPath = path.resolve(__dirname, 'commands');
for (const file of fs.readdirSync(commandsPath)) {
  if (!file.endsWith('.js')) continue;
  const cmd = require(path.join(commandsPath, file));
  if (cmd.data && cmd.execute) client.commands.set(cmd.data.name, cmd);
}

client.once('ready', () => {
  logger.info(`Logged in as ${client.user.tag}`);
  scheduleDailyOncall();
});

// handle interactions
client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;
  const cmd = client.commands.get(interaction.commandName);
  if (!cmd) return;
  try {
    await cmd.execute(interaction);
  } catch (err) {
    logger.error('Command error', err);
    await interaction.reply({ content: 'There was an error executing that command.', ephemeral: true });
  }
});

async function scheduleDailyOncall() {
  const time = process.env.DAILY_ONCALL_TIME || '09:00';
  const [hour, minute] = time.split(':').map(Number);
  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    logger.warn('Invalid DAILY_ONCALL_TIME format, expected HH:MM');
    return;
  }

  // cron string: minute hour * * *
  const cronExpr = `${minute} ${hour} * * *`;

  // node-cron supports timezone option
  cron.schedule(cronExpr, async () => {
    logger.info('Running daily on-call check');
    try {
      const weekday = new Date().toLocaleString('en-US', { weekday: 'long', timeZone: 'Asia/Kolkata' }).toLowerCase();
      const oncall = await knex('developers').whereRaw('lower(oncall_days) like ?', [`%${weekday}%`]).first();
      if (oncall) {
        // Find a place to notify: for simplicity, notify a channel named #oncall if present
        for (const guild of client.guilds.cache.values()) {
          const channel = guild.channels.cache.find(c => c.name === 'oncall' && c.isTextBased && c.permissionsFor(guild.members.me).has('SendMessages'));
          const mention = `<@${oncall.discord_id}>`;
          const msg = `📢 Daily on-call reminder: ${oncall.name} (${mention}) is on-call today (${weekday}).`;
          if (channel) {
            channel.send(msg).catch(err => logger.warn('Failed to send daily oncall message', err));
          } else {
            // fallback: try to DM the oncall
            client.users.fetch(oncall.discord_id).then(u => u.send(`You are on-call today (${weekday}).`)).catch(() => {});
          }
        }
      } else {
        // No oncall -> notify admins/channel about this
        for (const guild of client.guilds.cache.values()) {
          const channel = guild.channels.cache.find(c => c.name === 'oncall' && c.isTextBased);
          if (channel) channel.send(`⚠ No one is on-call today (${weekday}). Please assign someone.`).catch(() => {});
        }
      }
    } catch (err) {
      logger.error('Error during daily on-call job', err);
    }
  }, {
    timezone: 'Asia/Kolkata'
  });

  logger.info(`Scheduled daily oncall at ${time} IST`);
}

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection', reason);
});

client.login(TOKEN);