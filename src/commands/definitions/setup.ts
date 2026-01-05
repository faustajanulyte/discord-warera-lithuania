import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

export const setupCommand = new SlashCommandBuilder()
  .setName('setup')
  .setDescription('Set up the server with roles, channels, and embassies (Admin only)')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .setDMPermission(false);
