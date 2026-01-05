import { ChatInputCommandInteraction } from 'discord.js';
import { setupServer } from '../../services/serverSetup.js';

export async function handleSetup(interaction: ChatInputCommandInteraction): Promise<void> {
  await interaction.deferReply({ ephemeral: true });

  if (!interaction.guild) {
    await interaction.editReply({
      content: 'This command can only be used in a server.',
    });
    return;
  }

  // Double-check permissions (should be enforced by command definition, but be safe)
  if (!interaction.memberPermissions?.has('Administrator')) {
    await interaction.editReply({
      content: 'You need Administrator permission to use this command.',
    });
    return;
  }

  await interaction.editReply({
    content:
      '🚀 **Server setup started!**\n\n' +
      '⏱️ **Estimated time:** ~5-10 minutes\n' +
      '📊 **Progress:** Creating 176 country roles, 7 embassy categories, and 176 embassy channels\n\n' +
      '✅ Setup is running in the background. Check the bot console logs for detailed progress.\n' +
      '⚠️ **Note:** If you hit rate limits, the bot will automatically detect and log them.\n' +
      '⚠️ **Do not run /setup again** until this completes - it will skip existing items automatically.',
  });

  // Run setup asynchronously - interaction will timeout but setup continues
  console.log('\n🚀 === SERVER SETUP STARTED ===');
  console.log(`Guild: ${interaction.guild.name} (${interaction.guild.id})`);
  console.log(`Started by: ${interaction.user.tag} (${interaction.user.id})`);
  console.log('=====================================\n');

  try {
    const result = await setupServer(interaction.guild);

    console.log('\n✅ === SERVER SETUP COMPLETE ===');
    console.log(`Success: ${result.success}`);
    console.log(`Message: ${result.message}`);
    console.log('==================================\n');

    // Try to send a final update (may fail if interaction expired)
    try {
      await interaction.followUp({
        content: `✅ **Setup Complete!**\n\n${result.message}`,
        ephemeral: true,
      });
    } catch (error) {
      console.log('Could not send completion message (interaction expired). Setup was successful.');
    }
  } catch (error) {
    console.error('\n❌ === SERVER SETUP FAILED ===');
    console.error('Error:', error);
    console.error('================================\n');

    try {
      await interaction.followUp({
        content: `❌ Setup failed. Check console logs for details.`,
        ephemeral: true,
      });
    } catch {
      console.log('Could not send error message (interaction expired).');
    }
  }
}
