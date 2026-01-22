import { config } from 'dotenv';

config();

interface EnvConfig {
  DISCORD_TOKEN: string;
  DISCORD_APPLICATION_ID: string;
  DISCORD_PUBLIC_KEY: string;
  VERIFIED_ROLE_ID: string;
  NODE_ENV: string;
}

function validateEnv(): EnvConfig {
  const required = ['DISCORD_TOKEN', 'DISCORD_APPLICATION_ID', 'DISCORD_PUBLIC_KEY'];

  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }

  return {
    DISCORD_TOKEN: process.env.DISCORD_TOKEN!,
    DISCORD_APPLICATION_ID: process.env.DISCORD_APPLICATION_ID!,
    DISCORD_PUBLIC_KEY: process.env.DISCORD_PUBLIC_KEY!,
    VERIFIED_ROLE_ID: process.env.VERIFIED_ROLE_ID!,
    NODE_ENV: process.env.NODE_ENV || 'development',
  };
}

export const env = validateEnv();
