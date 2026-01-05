import {
  Guild,
  Role,
  CategoryChannel,
  TextChannel,
  PermissionFlagsBits,
  ChannelType,
  OverwriteResolvable,
} from 'discord.js';
import {
  WARERA_COUNTRY_MAP,
  ROLE_COLORS,
  CONTINENT_EMBASSIES,
} from '../config/countries.js';

interface SetupResult {
  success: boolean;
  message: string;
  roles?: {
    president?: Role;
    government?: Role;
    mods?: Role;
    authenticator?: Role;
    verified?: Role;
    lithuania?: Role;
    countries: Map<string, Role>;
  };
  channels?: {
    public: TextChannel[];
    announcements: TextChannel[];
    community: TextChannel[];
    government?: TextChannel;
    embassies: Map<string, TextChannel>;
  };
}

/**
 * Performs full server setup:
 * 1. Creates admin roles (President, Government, Mods, Authenticator)
 * 2. Creates base roles (Verified, Lithuania)
 * 3. Creates country roles based on WarEra country map
 * 4. Creates channel categories and channels with proper permissions
 * 5. Creates continent-based embassy categories with embassy channels
 */
export async function setupServer(guild: Guild): Promise<SetupResult> {
  try {
    // Step 1: Create admin/leadership roles
    console.log('\n📋 Step 1: Creating leadership roles...');
    const { president, government, mods, authenticator } = await createLeadershipRoles(guild);
    console.log('✅ Leadership roles ready');

    // Step 2: Create Verified and Lithuania roles
    console.log('\n📋 Step 2: Creating base roles...');
    const verified = await createRole(guild, 'Verified', ROLE_COLORS.VERIFIED);
    const lithuania = await createRole(guild, 'Lithuania', ROLE_COLORS.LITHUANIA);
    console.log('✅ Base roles ready');

    // Step 3: Create country roles (excluding Lithuania since we created it specially)
    console.log('\n📋 Step 3: Creating country roles...');
    const countryRoles = await createCountryRoles(guild, lithuania);
    console.log(`✅ Country roles ready: ${countryRoles.size} roles`);

    // Step 4: Create public channels
    console.log('\n📋 Step 4: Creating public channels...');
    const publicChannels = await createPublicChannels(guild);
    console.log('✅ Public channels ready');

    // Step 5: Create announcement channels
    console.log('\n📋 Step 5: Creating announcement channels...');
    const announcementChannels = await createAnnouncementChannels(guild, lithuania, government, president);
    console.log('✅ Announcement channels ready');

    // Step 6: Create community channels
    console.log('\n📋 Step 6: Creating community channels...');
    const communityChannels = await createCommunityChannels(guild, verified, lithuania);
    console.log('✅ Community channels ready');

    // Step 7: Create government channel
    console.log('\n📋 Step 7: Creating government channel...');
    const governmentChannel = await createGovernmentChannel(guild, government, president, mods);
    console.log('✅ Government channel ready');

    // Step 8: Create embassy categories and channels
    console.log('\n📋 Step 8: Creating embassy categories and channels...');
    const embassyChannels = await createEmbassyStructure(
      guild,
      countryRoles,
      government,
      president,
      mods
    );
    console.log(`✅ Embassy channels ready: ${embassyChannels.size} embassies`);

    return {
      success: true,
      message:
        `Server setup complete!\n\n` +
        `✅ Created leadership roles (President, Government, Mods, Authenticator)\n` +
        `✅ Created base roles (Verified, Lithuania)\n` +
        `✅ Created ${countryRoles.size} country roles\n` +
        `✅ Created public channels (#welcome, #rules)\n` +
        `✅ Created announcement channels (#announcements, #voting) - Lithuania only\n` +
        `✅ Created community channels (#memes, #game-help, #chat, #chat-for-dummies)\n` +
        `✅ Created #government channel\n` +
        `✅ Created ${embassyChannels.size} embassy channels\n\n` +
        `**Next steps:**\n` +
        `1. Assign President/Government/Mods roles to appropriate members\n` +
        `2. Users can verify with /identify to get their country role`,
      roles: {
        president,
        government,
        mods,
        authenticator,
        verified,
        lithuania,
        countries: countryRoles,
      },
      channels: {
        public: publicChannels,
        announcements: announcementChannels,
        community: communityChannels,
        government: governmentChannel,
        embassies: embassyChannels,
      },
    };
  } catch (error) {
    console.error('Server setup error:', error);
    return {
      success: false,
      message: `Failed to set up server: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Creates a single role with rate limit protection
 */
async function createRole(
  guild: Guild,
  name: string,
  color: number,
  permissions: bigint[] = []
): Promise<Role> {
  // Check if role already exists
  const existingRole = guild.roles.cache.find((role) => role.name === name);
  if (existingRole) {
    console.log(`  ✓ Role @${name} already exists`);
    return existingRole;
  }

  console.log(`  Creating @${name}...`);
  const role = await guild.roles.create({
    name,
    color,
    permissions,
    reason: `Bot setup: ${name} role`,
  });
  console.log(`  ✅ Created @${name} (${role.id})`);

  // Rate limit protection
  await new Promise((resolve) => setTimeout(resolve, 300));
  return role;
}

/**
 * Creates leadership roles: President, Government, Mods, Authenticator
 */
async function createLeadershipRoles(guild: Guild): Promise<{
  president: Role;
  government: Role;
  mods: Role;
  authenticator: Role;
}> {
  // President and Government get Manage Roles permission
  const president = await createRole(guild, 'President', ROLE_COLORS.PRESIDENT, [
    PermissionFlagsBits.ManageRoles,
  ]);
  const government = await createRole(guild, 'Government', ROLE_COLORS.GOVERNMENT, [
    PermissionFlagsBits.ManageRoles,
  ]);
  const mods = await createRole(guild, 'Mods', ROLE_COLORS.MODS);
  const authenticator = await createRole(guild, 'Authenticator', ROLE_COLORS.AUTHENTICATOR);

  return { president, government, mods, authenticator };
}

/**
 * Creates all country roles based on WARERA_COUNTRY_MAP
 */
async function createCountryRoles(guild: Guild, lithuaniaRole: Role): Promise<Map<string, Role>> {
  const countryRoles = new Map<string, Role>();
  const totalCountries = Object.entries(WARERA_COUNTRY_MAP).length;
  let created = 0;
  let skipped = 0;

  console.log(`  Creating ${totalCountries} country roles...`);

  // Fetch all roles to ensure cache is populated
  await guild.roles.fetch();

  for (const [countryName, roleName] of Object.entries(WARERA_COUNTRY_MAP)) {
    // Skip Lithuania - we already created it with special color
    if (countryName === 'Lithuania') {
      countryRoles.set(countryName, lithuaniaRole);
      skipped++;
      continue;
    }

    // Check if role already exists
    const existingRole = guild.roles.cache.find((role) => role.name === roleName);
    if (existingRole) {
      countryRoles.set(countryName, existingRole);
      skipped++;
      continue;
    }

    try {
      const role = await guild.roles.create({
        name: roleName,
        color: ROLE_COLORS.COUNTRY,
        reason: `Bot setup: ${countryName} country role`,
        permissions: [],
      });
      countryRoles.set(countryName, role);
      created++;

      // Rate limit protection
      await new Promise((resolve) => setTimeout(resolve, 300));
    } catch (error: any) {
      console.error(`  ❌ Failed to create role for ${countryName}:`, error.message);
    }
  }

  console.log(`  Created: ${created}, Skipped (existing): ${skipped}`);
  return countryRoles;
}

/**
 * Creates or gets a category channel
 */
async function getOrCreateCategory(
  guild: Guild,
  name: string,
  permissionOverwrites: OverwriteResolvable[] = []
): Promise<CategoryChannel> {
  const existingCategory = guild.channels.cache.find(
    (channel) => channel.type === ChannelType.GuildCategory && channel.name === name
  ) as CategoryChannel | undefined;

  if (existingCategory) {
    console.log(`  ✓ Category "${name}" already exists`);
    return existingCategory;
  }

  console.log(`  Creating "${name}" category...`);
  const category = await guild.channels.create({
    name,
    type: ChannelType.GuildCategory,
    permissionOverwrites,
    reason: `Bot setup: ${name} category`,
  });

  await new Promise((resolve) => setTimeout(resolve, 300));
  return category;
}

/**
 * Creates or gets a text channel
 */
async function getOrCreateChannel(
  guild: Guild,
  name: string,
  options: {
    parent?: CategoryChannel;
    topic?: string;
    permissionOverwrites?: OverwriteResolvable[];
  } = {}
): Promise<TextChannel> {
  const existingChannel = guild.channels.cache.find(
    (channel) =>
      channel.type === ChannelType.GuildText &&
      channel.name === name &&
      (options.parent ? channel.parentId === options.parent.id : true)
  ) as TextChannel | undefined;

  if (existingChannel) {
    console.log(`    ✓ #${name} already exists`);
    return existingChannel;
  }

  console.log(`    Creating #${name}...`);
  const channel = await guild.channels.create({
    name,
    type: ChannelType.GuildText,
    parent: options.parent?.id,
    topic: options.topic,
    permissionOverwrites: options.permissionOverwrites,
    reason: `Bot setup: ${name} channel`,
  });

  await new Promise((resolve) => setTimeout(resolve, 300));
  return channel;
}

/**
 * Creates public channels: #welcome, #rules
 */
async function createPublicChannels(guild: Guild): Promise<TextChannel[]> {
  const category = await getOrCreateCategory(guild, '📋 PUBLIC');

  const channels: TextChannel[] = [];

  // #welcome - everyone can read
  channels.push(
    await getOrCreateChannel(guild, 'welcome', {
      parent: category,
      topic: 'Welcome to the server! Use /identify to verify your WarEra character.',
    })
  );

  // #rules - everyone can read only
  channels.push(
    await getOrCreateChannel(guild, 'rules', {
      parent: category,
      topic: 'Server rules and guidelines',
      permissionOverwrites: [
        {
          id: guild.id, // @everyone
          deny: [PermissionFlagsBits.SendMessages],
          allow: [PermissionFlagsBits.ViewChannel],
        },
      ],
    })
  );

  return channels;
}

/**
 * Creates announcement channels - visible only to Lithuania, Government posts
 */
async function createAnnouncementChannels(
  guild: Guild,
  lithuania: Role,
  government: Role,
  president: Role
): Promise<TextChannel[]> {
  const category = await getOrCreateCategory(guild, '📢 ANNOUNCEMENTS', [
    {
      id: guild.id, // @everyone - hidden
      deny: [PermissionFlagsBits.ViewChannel],
    },
    {
      id: lithuania.id, // Lithuania can view but not send
      allow: [PermissionFlagsBits.ViewChannel],
      deny: [PermissionFlagsBits.SendMessages],
    },
    {
      id: government.id, // Government can view and send
      allow: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel],
    },
    {
      id: president.id, // President can view and send
      allow: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel],
    },
  ]);

  const channels: TextChannel[] = [];

  // Single #announcements channel (merged with game-announcements)
  channels.push(
    await getOrCreateChannel(guild, 'announcements', {
      parent: category,
      topic: 'Server and game announcements',
    })
  );

  // #voting - Lithuania can view, Government can post
  channels.push(
    await getOrCreateChannel(guild, 'voting', {
      parent: category,
      topic: 'Government voting and polls',
    })
  );

  return channels;
}

/**
 * Creates community channels for verified users
 */
async function createCommunityChannels(
  guild: Guild,
  verified: Role,
  lithuania: Role
): Promise<TextChannel[]> {
  const category = await getOrCreateCategory(guild, '💬 COMMUNITY', [
    {
      id: guild.id, // @everyone
      deny: [PermissionFlagsBits.ViewChannel],
    },
    {
      id: verified.id,
      allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
    },
  ]);

  const channels: TextChannel[] = [];

  // #memes - all verified users
  channels.push(
    await getOrCreateChannel(guild, 'memes', {
      parent: category,
      topic: 'Share your memes',
    })
  );

  // #game-help - all verified users
  channels.push(
    await getOrCreateChannel(guild, 'game-help', {
      parent: category,
      topic: 'Ask for in-game advice',
    })
  );

  // #chat - Lithuania only
  channels.push(
    await getOrCreateChannel(guild, 'chat', {
      parent: category,
      topic: 'Chat for verified Lithuanian citizens',
      permissionOverwrites: [
        {
          id: guild.id, // @everyone
          deny: [PermissionFlagsBits.ViewChannel],
        },
        {
          id: verified.id, // Verified users can't see this by default
          deny: [PermissionFlagsBits.ViewChannel],
        },
        {
          id: lithuania.id, // Only Lithuania can see
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
        },
      ],
    })
  );

  // #chat-for-dummies - all verified users, spam allowed
  channels.push(
    await getOrCreateChannel(guild, 'chat-for-dummies', {
      parent: category,
      topic: 'Spam and do whatever you want here',
    })
  );

  return channels;
}

/**
 * Creates the government channel (restricted to leadership)
 */
async function createGovernmentChannel(
  guild: Guild,
  government: Role,
  president: Role,
  mods: Role
): Promise<TextChannel> {
  const category = await getOrCreateCategory(guild, '🏛️ GOVERNMENT', [
    {
      id: guild.id, // @everyone
      deny: [PermissionFlagsBits.ViewChannel],
    },
    {
      id: government.id,
      allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
    },
    {
      id: president.id,
      allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
    },
    {
      id: mods.id,
      allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
    },
  ]);

  return await getOrCreateChannel(guild, 'government', {
    parent: category,
    topic: 'Government and leadership discussions',
  });
}

/**
 * Creates embassy structure with continent-based categories
 */
async function createEmbassyStructure(
  guild: Guild,
  countryRoles: Map<string, Role>,
  government: Role,
  president: Role,
  mods: Role
): Promise<Map<string, TextChannel>> {
  const embassyChannels = new Map<string, TextChannel>();
  let totalCreated = 0;
  let totalSkipped = 0;

  // Iterate through each continent category
  for (const [categoryName, countries] of Object.entries(CONTINENT_EMBASSIES)) {
    console.log(`  📁 Processing ${categoryName}...`);

    // Create category with default permissions (hidden from everyone)
    const category = await getOrCreateCategory(guild, categoryName, [
      {
        id: guild.id, // @everyone
        deny: [PermissionFlagsBits.ViewChannel],
      },
    ]);

    // Create embassy channels for each country
    for (const countryName of countries) {
      const countryRole = countryRoles.get(countryName);
      if (!countryRole) {
        console.log(`    ⚠️ No role found for ${countryName}, skipping`);
        continue;
      }

      const channelName = `${countryRole.name.toLowerCase().replace(/\s+/g, '-')}-embassy`;

      // Check if channel already exists
      const existingChannel = guild.channels.cache.find(
        (channel) =>
          channel.type === ChannelType.GuildText &&
          channel.name === channelName &&
          channel.parentId === category.id
      ) as TextChannel | undefined;

      if (existingChannel) {
        embassyChannels.set(countryName, existingChannel);
        totalSkipped++;
        continue;
      }

      try {
        const channel = await guild.channels.create({
          name: channelName,
          type: ChannelType.GuildText,
          parent: category.id,
          topic: `Embassy channel for ${countryName} citizens`,
          permissionOverwrites: [
            {
              id: guild.id, // @everyone - hidden
              deny: [PermissionFlagsBits.ViewChannel],
            },
            {
              id: countryRole.id, // Country citizens can access
              allow: [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.ReadMessageHistory,
              ],
            },
            {
              id: government.id, // Government can access
              allow: [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.ReadMessageHistory,
              ],
            },
            {
              id: president.id, // President can access
              allow: [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.ReadMessageHistory,
              ],
            },
            {
              id: mods.id, // Mods can access
              allow: [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.ReadMessageHistory,
              ],
            },
          ],
          reason: `Bot setup: ${countryName} embassy channel`,
        });

        embassyChannels.set(countryName, channel);
        totalCreated++;

        // Rate limit protection
        await new Promise((resolve) => setTimeout(resolve, 300));
      } catch (error: any) {
        console.error(`    ❌ Failed to create embassy for ${countryName}:`, error.message);
      }
    }
  }

  console.log(`  Embassy summary: Created ${totalCreated}, Skipped ${totalSkipped}`);
  return embassyChannels;
}
