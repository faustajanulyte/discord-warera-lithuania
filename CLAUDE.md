# CLAUDE.md

This file provides guidance to Claude Code when working in this repository.

## Repository Overview

Dedicated Discord bot for **WarEra game integration** and Lithuania-focused server automation.
Name: `discord-warera-lithuania`

- **Implementation**: Node.js (TypeScript)
- **Library**: discord.js v14
- **Style**: Functional programming (no classes)
- **State**: Stateless (uses real-time API/Discord data, no local database)

## Development Commands

- `npm install` - Install dependencies
- `npm run dev` - Run in development mode (hot reload)
- `npm run register-commands` - Register slash commands with Discord
- `npm run build` - Compile to JavaScript
- `npm start` - Run production build
- `npm run lint` - Check code quality
- `npm run format` - Format code

## Architecture

```
src/
├── index.ts                # Main entry point (InteractionCreate)
├── config/
│   └── countries.ts        # Role colors, maps, and continent constants
├── commands/
│   ├── definitions.ts      # Command schemas
│   ├── index.ts            # Command dispatcher
│   └── handlers/           # Command logic
│       ├── identify.ts     # WarEra character verification
│       ├── setup.ts        # Automated server construction
│       └── cleanup.ts      # Server reset
├── services/
│   ├── serverSetup.ts      # Server construction business logic
│   └── warera.ts           # WarEra API integration
└── scripts/
    └── register-commands.ts # Command registration utility
```

## Key Guidelines

1. **Functional Only**: Do not use classes. Use pure functions and standard objects.
2. **ES Modules**: Always include `.js` extensions in imports (e.g., `import { x } from './y.js'`).
3. **Stateless**: The bot does not use a database. All persistence is handled by Discord roles and channel structures.
4. **Error Handling**: Use try-catch in all handlers.
5. **Registration**: After editing `definitions.ts`, you MUST run `npm run register-commands`.
