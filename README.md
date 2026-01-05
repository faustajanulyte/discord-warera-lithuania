# discord-warera-lithuania

A specialized Discord bot for **WarEra game integration** and automated server management, with a focus on Lithuanian community organization.

## Key Features

- **WarEra Game Integration** ⭐
  - Verify players via their WarEra username (`/identify`)
  - Automatic country-based role assignment (e.g., `@Lithuania`, `@USA`)
  - Real-time API integration with WarEra

- **Automated Server Setup** 🏛️
  - One-command server structure generation (`/setup`)
  - Automated role creation (President, Government, Mods, Authenticator, Verified, Country roles)
  - Automated channel and embassy creation with pre-cofigured permissions
  - Easy cleanup (`/cleanup`) to reset the server structure

- **Specialized Lithuania Support** 🇱🇹
  - Restricted channels for Lithuanian citizens
  - Government and Presidential oversight for all country embassies
  - Simplified embassy access: Citizens see their own embassy, Government sees all

## Prerequisites

- **Node.js 18.0.0 or higher**
- **A Discord Bot Token**

## Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/Augustinas01/discord-warera-lithuania.git
cd discord-warera-lithuania
npm install
```

### 2. Set Up Environment

```bash
cp .env.example .env
```

Edit `.env` and add your Discord credentials:
```env
DISCORD_TOKEN=your_discord_bot_token_here
DISCORD_APPLICATION_ID=your_application_id_here
DISCORD_PUBLIC_KEY=your_public_key_here
NODE_ENV=development
```

### 3. Register Discord Commands

```bash
npm run register-commands
```

### 4. Run the Bot

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm run build
npm start
```

## Setup Instructions

1. **Invite the Bot**: Use the OAuth2 URL Generator in the [Discord Developer Portal](https://discord.com/developers/applications) (Scopes: `bot`, `applications.commands`; Permissions: `Manage Channels`, `Manage Roles`, `View Channels`, `Send Messages`).
2. **Server Setup**: Run `/setup` in your Discord server.
3. **Role Management**: Assign the `President` or `Government` role to appropriate members so they can manage other users' roles.
4. **Verification**: Direct players to use `/identify <username>` to verify their character and get their country role.

## Slash Commands

- `/identify <username>` - Verify your WarEra character and get country roles.
- `/setup` - (Admin only) Automatically create all roles, categories, and channels.
- `/cleanup` - (Admin only) Remove all bot-created roles and channels.

---

## Development

**Project Structure:**
- `src/index.ts` - Main entry point
- `src/commands/` - Command definitions and handlers
- `src/services/` - Business logic (WarEra API, Server Setup)
- `src/config/` - Role and country configurations

**Available Scripts:**
- `npm run dev` - Run in development mode
- `npm run register-commands` - Register slash commands with Discord
- `npm run lint` - Check code quality
- `npm run format` - Format code with Prettier
- `npm run build` - Compile to JavaScript

## License

This project is licensed under the ISC License.
