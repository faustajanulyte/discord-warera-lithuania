import type { ChatInputCommandInteraction, GuildMember } from 'discord.js';

/**
 * Simplified types for embassy and verification bot
 */

export interface CommandContext {
  interaction: ChatInputCommandInteraction;
  guildId: string;
  userId: string;
  member: GuildMember;
}

export interface VerificationData {
  verified: boolean;
  verifiedAt?: Date;
  guildId?: string;
}

export interface ServerSettings {
  guildId: string;
  verifiedRoleId?: string;
  setupAt: Date;
}
