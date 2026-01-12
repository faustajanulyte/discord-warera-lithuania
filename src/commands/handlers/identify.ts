import type { ChatInputCommandInteraction } from 'discord.js';
import { verifyUserWithWarEra } from '../../services/verification.js';
import { WARERA_COUNTRY_MAP } from '../../config/countries.js';

export async function handleIdentify(interaction: ChatInputCommandInteraction): Promise<void> {
  await interaction.deferReply({ ephemeral: true });

  const subcommand = interaction.options.getSubcommand();
  const userId = interaction.user.id;

  const wareraUsername = subcommand === 'username'
    ? interaction.options.getString('value', true)
    : null;

  const wareraId = subcommand === 'id'
    ? interaction.options.getString('value', true)
    : null;

  try {
    // Verify with WarEra API
    const result = await verifyUserWithWarEra(userId, wareraUsername, wareraId);

    if (!result.success) {
      await interaction.editReply({
        content: `❌ ${result.message}`,
      });
      return;
    }

    const member = await interaction.guild!.members.fetch(userId);
    const roleNames: string[] = [];

    // Find and assign Verified role
    const verifiedRole = interaction.guild!.roles.cache.find((r) => r.name === 'Verified');
    if (verifiedRole) {
      try {
        await member.roles.add(verifiedRole);
        roleNames.push(verifiedRole.name);
      } catch (error) {
        console.error('Failed to assign verified role:', error);
      }
    } else {
      console.warn('Verified role not found in guild');
    }

    // Find and assign country role
    if (result.countryName) {
      const countryRoleName = WARERA_COUNTRY_MAP[result.countryName];
      if (countryRoleName) {
        const countryRole = interaction.guild!.roles.cache.find((r) => r.name === countryRoleName);

        if (countryRole) {
          try {
            await member.roles.add(countryRole);
            roleNames.push(countryRole.name);
          } catch (error) {
            console.error('Failed to assign country role:', error);
          }
        } else {
          console.warn(`Country role "${countryRoleName}" not found in guild`);
        }
      }
    }

    let responseMessage = `✅ **Successfully verified!**\n`;
    responseMessage += `**WarEra Username:** ${result.username}\n`;

    if (result.countryName) {
      responseMessage += `**Country:** ${result.countryName}\n`;
    }

    if (roleNames.length > 0) {
      responseMessage += `\n**Roles Assigned:** ${roleNames.join(', ')}`;
    }

    responseMessage += `\n\nYou now have access to your country's channels!`;

    await interaction.editReply({
      content: responseMessage,
    });
  } catch (error) {
    console.error('Error in identify command:', error);
    await interaction.editReply({
      content: '❌ An error occurred while verifying. Please try again later.',
    });
  }
}
