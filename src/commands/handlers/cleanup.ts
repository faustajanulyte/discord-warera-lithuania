import { ChatInputCommandInteraction, ChannelType } from 'discord.js';
import { WARERA_COUNTRY_MAP, CONTINENT_EMBASSIES, LEADERSHIP_ROLES } from '../../config/countries.js';

export async function handleCleanup(interaction: ChatInputCommandInteraction): Promise<void> {
  const confirm = interaction.options.getBoolean('confirm', true);

  if (!confirm) {
    await interaction.reply({
      content: '❌ Cleanup cancelled. Set confirm to true to proceed.',
      ephemeral: true,
    });
    return;
  }

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

  let deletedRoles = 0;
  let deletedChannels = 0;
  let deletedCategories = 0;

  try {
    // 1. Delete leadership roles (President, Government, Mods, Authenticator)
    const leadershipRoleNames = [...LEADERSHIP_ROLES, 'Authenticator'];
    for (const roleName of leadershipRoleNames) {
      const role = interaction.guild.roles.cache.find((r) => r.name === roleName);
      if (role) {
        try {
          await role.delete('Bot cleanup command');
          deletedRoles++;
          console.log(`  Deleted role: ${roleName}`);
          await new Promise((resolve) => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`Failed to delete role ${roleName}:`, error);
        }
      }
    }

    // 2. Delete Verified and Lithuania roles
    for (const roleName of ['Verified', 'Lithuania']) {
      const role = interaction.guild.roles.cache.find((r) => r.name === roleName);
      if (role) {
        try {
          await role.delete('Bot cleanup command');
          deletedRoles++;
          console.log(`  Deleted role: ${roleName}`);
          await new Promise((resolve) => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`Failed to delete role ${roleName}:`, error);
        }
      }
    }

    // 3. Delete country roles
    const countryRoleNames = Object.values(WARERA_COUNTRY_MAP);
    for (const role of interaction.guild.roles.cache.values()) {
      if (countryRoleNames.includes(role.name) && role.name !== 'Lithuania') {
        try {
          await role.delete('Bot cleanup command');
          deletedRoles++;
          await new Promise((resolve) => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`Failed to delete role ${role.name}:`, error);
        }
      }
    }

    // 4. Delete bot-created categories and their channels
    const botCategories = [
      '📋 PUBLIC',
      '📢 ANNOUNCEMENTS',
      '💬 COMMUNITY',
      '🏛️ GOVERNMENT',
      ...Object.keys(CONTINENT_EMBASSIES),
    ];

    for (const categoryName of botCategories) {
      const category = interaction.guild.channels.cache.find(
        (channel) => channel.type === ChannelType.GuildCategory && channel.name === categoryName
      );

      if (category) {
        // First delete all channels in the category
        const channelsInCategory = interaction.guild.channels.cache.filter(
          (channel) => channel.parentId === category.id
        );

        for (const channel of channelsInCategory.values()) {
          try {
            await channel.delete('Bot cleanup command');
            deletedChannels++;
            await new Promise((resolve) => setTimeout(resolve, 100));
          } catch (error) {
            console.error(`Failed to delete channel ${channel.name}:`, error);
          }
        }

        // Then delete the category itself
        try {
          await category.delete('Bot cleanup command');
          deletedCategories++;
        } catch (error) {
          console.error(`Failed to delete ${categoryName} category:`, error);
        }
      }
    }

    console.log(
      `✅ Cleanup complete - deleted ${deletedRoles} roles, ${deletedCategories} categories, ${deletedChannels} channels`
    );

    await interaction.editReply({
      content:
        `✅ **Cleanup Complete!**\n\n` +
        `**Deleted:**\n` +
        `🎭 Roles: ${deletedRoles}\n` +
        `📁 Categories: ${deletedCategories}\n` +
        `📝 Channels: ${deletedChannels}\n\n` +
        `You can now run \`/setup\` again to recreate everything.`,
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    await interaction.editReply({
      content: `❌ An error occurred during cleanup: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  }
}
