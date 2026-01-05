import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

export const cleanupCommand = new SlashCommandBuilder()
  .setName('cleanup')
  .setDescription('Remove all bot-created roles and channels (Admin only)')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .setDMPermission(false)
  .addBooleanOption((option) =>
    option
      .setName('confirm')
      .setDescription('Confirm you want to delete all bot-created roles and channels')
      .setRequired(true)
  );
