import { ChatInputCommandInteraction } from 'discord.js';
import { setupServer } from '../../services/serverSetup.js';

export async function handleUpdate(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply({ ephemeral: true });

    if (!interaction.guild) {
        await interaction.editReply({
            content: 'This command can only be used in a server.',
        });
        return;
    }

    // Double-check permissions
    if (!interaction.memberPermissions?.has('Administrator')) {
        await interaction.editReply({
            content: 'You need Administrator permission to use this command.',
        });
        return;
    }

    await interaction.editReply({
        content:
            '🔄 **Server update started!**\n\n' +
            '⏱️ **Estimated time:** ~1-3 minutes\n' +
            '📊 **Progress:** Checking roles, channels, and permissions...\n\n' +
            '✅ Update is running in the background. Check the bot console logs for detailed progress.',
    });

    console.log('\n🔄 === SERVER UPDATE STARTED ===');
    console.log(`Guild: ${interaction.guild.name} (${interaction.guild.id})`);
    console.log(`Started by: ${interaction.user.tag} (${interaction.user.id})`);
    console.log('=====================================\n');

    try {
        const result = await setupServer(interaction.guild);

        console.log('\n✅ === SERVER UPDATE COMPLETE ===');
        console.log(`Success: ${result.success}`);
        console.log(`Message: ${result.message}`);
        console.log('==================================\n');

        try {
            await interaction.followUp({
                content: `✅ **Update Complete!**\n\n${result.message}`,
                ephemeral: true,
            });
        } catch (error) {
            console.log('Could not send completion message (interaction expired). Update was successful.');
        }
    } catch (error) {
        console.error('\n❌ === SERVER UPDATE FAILED ===');
        console.error('Error:', error);
        console.error('================================\n');

        try {
            await interaction.followUp({
                content: `❌ Update failed. Check console logs for details.`,
                ephemeral: true,
            });
        } catch {
            console.log('Could not send error message (interaction expired).');
        }
    }
}
