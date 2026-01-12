import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

/**
 * Simplified command set for embassy and country role management
 *
 * Admin Commands:
 * - /setup: One-time server setup (embassies, categories, country roles)
 * - /cleanup: Remove all bot-created content
 *
 * User Commands:
 * - /identify: Verify with WarEra and get country role + embassy access
 */
export const commands = [
  new SlashCommandBuilder()
    .setName('identify')
    .setDescription('Verify your WarEra character and get country roles')
    .addSubcommand(command =>
      command
        .setName('username')
        .setDescription('Identify by username')
        .addStringOption((option) =>
          option.setName('value').setDescription('Your WarEra username').setRequired(true)
        )
    )
    .addSubcommand(command =>
      command
        .setName('id')
        .setDescription('Identify by ID')
        .addStringOption((option) =>
          option.setName('value').setDescription('Your WarEra ID').setRequired(true)
        )
    ),
  
  new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Set up the server with roles, channels, and embassies (Admin only)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),

  new SlashCommandBuilder()
    .setName('update')
    .setDescription('Update server roles and channels with new changes (Admin only)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),

  new SlashCommandBuilder()
    .setName('cleanup')
    .setDescription('Remove all bot-created roles and channels (Admin only)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false)
    .addBooleanOption((option) =>
      option
        .setName('confirm')
        .setDescription('Confirm you want to delete all bot-created roles and channels')
        .setRequired(true)
    ),
].map((command) => command.toJSON());
