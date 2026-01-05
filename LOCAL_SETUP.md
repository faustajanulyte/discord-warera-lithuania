# Local Setup Guide

Complete guide to run the discord-warera-lithuania bot locally and connect it to Discord.

## Prerequisites

Before you start, make sure you have:
- ✅ **Node.js 18+** installed ([Download](https://nodejs.org))
- ✅ A **Discord account**

---

## Part 1: Create a Discord Bot

### Step 1: Create a Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **"New Application"**
3. Give it a name (e.g., "discord-warera-lithuania")
4. Click **"Create"**

### Step 2: Create the Bot User

1. In your application, go to the **"Bot"** tab in the left sidebar
2. Click **"Reset Token"** and **"Copy"** to copy your bot token
   - ⚠️ **IMPORTANT**: Keep this token secret! Never share it or commit it to git.

### Step 3: Enable Required Intents

Still in the **"Bot"** tab, scroll down to **"Privileged Gateway Intents"** and enable:
- ✅ **Server Members Intent**
- ✅ **Message Content Intent**

Click **"Save Changes"**.

### Step 4: Get Your Application ID and Public Key

1. Go to the **"General Information"** tab
2. Copy your **"Application ID"** and **"Public Key"**

### Step 5: Invite the Bot

1. Go to **"OAuth2"** → **"URL Generator"**
2. Select scopes: `bot`, `applications.commands`
3. Select permissions: `Manage Channels`, `Manage Roles`, `View Channels`, `Send Messages`, `Read Message History`
4. Copy the Generated URL and open it in your browser to invite the bot to your server.

---

## Part 2: Set Up Local Development

### Step 1: Install Dependencies

```bash
cd discord-warera-lithuania
npm install
```

### Step 2: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your values:
   ```env
   DISCORD_TOKEN=your_bot_token_here
   DISCORD_APPLICATION_ID=your_application_id_here
   DISCORD_PUBLIC_KEY=your_public_key_here
   NODE_ENV=development
   ```

### Step 3: Register Discord Commands

```bash
npm run register-commands
```

### Step 4: Start the Bot

```bash
npm run dev
```

You should see:
```
🚀 Starting discord-warera-lithuania bot...
✅ Bot is ready! Logged in as discord-warera-lithuania#1234
```

---

## Part 3: Service Setup

1. **Automated Setup**: Once the bot is online, go to your server and run `/setup`.
2. **Assign Roles**: Manually assign the `President` or `Government` role to users who should have management access.
3. **Verify**: Users can now use `/identify <username>` to get their country roles.

## Troubleshooting

### Bot is offline
- Check if `npm run dev` is running.
- Ensure the token in `.env` is correct.
- Verify that "Server Members Intent" is enabled in the Discord Developer Portal.

### Commands don't appear
- Run `npm run register-commands` again.
- Restart your Discord client (Ctrl+R).
- Note: Global commands can take a few minutes to update.

### Bot can't assign roles
- Go to **Server Settings** → **Roles**.
- Drag the **discord-warera-lithuania** bot role **ABOVE** the roles it needs to assign (like country roles).
- Ensure the bot has "Manage Roles" permission.
