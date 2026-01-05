/**
 * Script to inspect all available fields from getUserLite endpoint
 * Run with: npx tsx src/scripts/inspect-user-data.ts
 */

import { searchUser } from '../services/warera.js';

async function inspectUserData() {
  const testUsername = 'farmlandbee';

  console.log('🔍 Inspecting user data for:', testUsername);
  console.log('='.repeat(70));

  // Search for user
  const searchResult = await searchUser(testUsername);

  if (!searchResult?.id) {
    console.log('❌ User not found');
    return;
  }

  console.log('\n✅ Found user ID:', searchResult.id);
  console.log('\n📡 Fetching full raw user data from getUserLite...\n');

  // Make raw fetch to see ALL fields
  const input = { userId: String(searchResult.id) };
  const params = new URLSearchParams({ input: JSON.stringify(input) });

  const response = await fetch(`https://api2.warera.io/trpc/user.getUserLite?${params}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    console.log('❌ API Error:', response.status, response.statusText);
    return;
  }

  const data = await response.json();
  const userData = data?.result?.data;

  if (!userData) {
    console.log('❌ No user data in response');
    return;
  }

  console.log('📋 ALL AVAILABLE FIELDS FROM getUserLite:');
  console.log('='.repeat(70));
  console.log(JSON.stringify(userData, null, 2));
  console.log('='.repeat(70));

  // List all top-level keys
  console.log('\n📝 Top-level fields available:');
  const keys = Object.keys(userData);
  keys.forEach((key, index) => {
    const value = userData[key];
    const type = Array.isArray(value) ? 'array' : typeof value;
    console.log(`  ${index + 1}. ${key} (${type})`);
  });

  console.log(`\n✅ Total fields: ${keys.length}`);
  console.log('\n💡 Look for fields that might contain Discord info (discordId, socialAccounts, etc.)');
}

inspectUserData().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
