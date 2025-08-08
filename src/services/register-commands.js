require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;
const TOKEN = process.env.BOT_TOKEN;

if (!CLIENT_ID || !GUILD_ID || !TOKEN) {
  console.error('CLIENT_ID, GUILD_ID and BOT_TOKEN must be set in .env to register commands in a guild.');
  process.exit(1);
}

const commands = [];
const commandsPath = path.resolve(__dirname, 'commands');
for (const file of fs.readdirSync(commandsPath)) {
  if (file.endsWith('.js')) {
    const cmd = require(path.join(commandsPath, file));
    if (cmd.data) commands.push(cmd.data.toJSON());
  }
}

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    console.log(`Registering ${commands.length} commands to guild ${GUILD_ID}`);
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
    console.log('✔️ Commands registered.');
  } catch (err) {
    console.error('Failed to register commands', err);
  }
})();