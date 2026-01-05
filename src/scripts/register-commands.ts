import { REST, Routes } from 'discord.js';
import { env } from '../config/env.js';
import { commands } from '../commands/index.js';

const rest = new REST().setToken(env.DISCORD_TOKEN);

async function registerCommands() {
  try {
    console.log(`🔄 Registering ${commands.length} slash commands...`);

    const data = (await rest.put(Routes.applicationCommands(env.DISCORD_APPLICATION_ID), {
      body: commands,
    })) as unknown[];

    console.log(`✅ Successfully registered ${data.length} slash commands globally!`);
    console.log('\nRegistered commands:');
    commands.forEach((cmd: any) => {
      console.log(`  - /${cmd.name}: ${cmd.description}`);
    });
  } catch (error) {
    console.error('❌ Error registering commands:', error);
    process.exit(1);
  }
}

registerCommands();
