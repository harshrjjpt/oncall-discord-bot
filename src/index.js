require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const db = require('./services/database');
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
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

client.commands = new Collection();

// load command files
const commandsPath = path.resolve(__dirname, 'commands');
for (const file of fs.readdirSync(commandsPath)) {
  if (!file.endsWith('.js')) continue;
  const cmd = require(path.join(commandsPath, file));
  if (cmd.data && cmd.execute) client.commands.set(cmd.data.name, cmd);
}

client.once('ready', async () => {
  logger.info(`Logged in as ${client.user.tag}`);
  
  // Initialize database with sample data if needed
  try {
    await db.initializeDatabase();
    logger.info('Database initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize database:', error);
  }
  
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
      const oncallDevelopers = await db.getOncallDevelopers();
      const oncall = oncallDevelopers[0]; // Get the first on-call developer
      if (oncall) {
        // Find a place to notify: for simplicity, notify a channel named #oncall if present
        for (const guild of client.guilds.cache.values()) {
          const channel = guild.channels.cache.find(c => c.name === 'oncall' && c.isTextBased && c.permissionsFor(guild.members.me).has('SendMessages'));
          const mention = `<@${oncall.discord_id}>`;
          const msg = `📢 Daily on-call reminder: ${oncall.name} (${mention}) is currently on-call.`;
          if (channel) {
            channel.send(msg).catch(err => logger.warn('Failed to send daily oncall message', err));
          } else {
            // fallback: try to DM the oncall
            client.users.fetch(oncall.discord_id).then(u => u.send(`You are currently on-call.`)).catch(() => {});
          }
        }
      } else {
        // No oncall -> notify admins/channel about this
        for (const guild of client.guilds.cache.values()) {
          const channel = guild.channels.cache.find(c => c.name === 'oncall' && c.isTextBased);
          if (channel) channel.send(`⚠ No one is currently on-call. Please assign someone.`).catch(() => {});
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