import { Client, GatewayIntentBits, Events } from 'discord.js';
import { env } from './config/env.js';
import { handleCommand } from './commands/index.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
  ],
  rest: {
    timeout: 15000, // 15 second timeout for REST API calls
  },
});

client.once(Events.ClientReady, (c) => {
  console.log(`✅ Bot is ready! Logged in as ${c.user.tag}`);
  console.log(`📊 Serving ${c.guilds.cache.size} guilds`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  await handleCommand(interaction);
});

client.on(Events.Error, (error) => {
  console.error('Discord client error:', error);
});

async function main() {
  console.log('🚀 Starting discord-warera-lithuania bot...');

  // Login to Discord
  await client.login(env.DISCORD_TOKEN);

  // Graceful shutdown
  const shutdown = (signal: string) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    client.destroy();
    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((error) => {
  console.error('Failed to start bot:', error);
  process.exit(1);
});
