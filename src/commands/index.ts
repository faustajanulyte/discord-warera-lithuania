import type { ChatInputCommandInteraction } from 'discord.js';
import { handleIdentify } from './handlers/identify.js';
import { handleSetup } from './handlers/setup.js';
import { handleUpdate } from './handlers/update.js';
import { handleCleanup } from './handlers/cleanup.js';

export { commands } from './definitions.js';

type CommandHandler = (interaction: ChatInputCommandInteraction) => Promise<void>;

/**
 * Simplified command handlers - only essential commands
 */
const commandHandlers: Record<string, CommandHandler> = {
  identify: handleIdentify,
  setup: handleSetup,
  update: handleUpdate,
  cleanup: handleCleanup,
};

export async function handleCommand(interaction: ChatInputCommandInteraction): Promise<void> {
  const handler = commandHandlers[interaction.commandName];

  if (!handler) {
    await interaction.reply({
      content: `❌ Unknown command: ${interaction.commandName}`,
      ephemeral: true,
    });
    return;
  }

  try {
    await handler(interaction);
  } catch (error) {
    console.error(`Error handling command ${interaction.commandName}:`, error);

    const errorMessage = '❌ An error occurred while executing this command.';

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: errorMessage, ephemeral: true });
    } else {
      await interaction.reply({ content: errorMessage, ephemeral: true });
    }
  }
}
