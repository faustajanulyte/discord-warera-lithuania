/**
 * Test script for WarEra API integration
 * Run with: npx tsx src/scripts/test-warera-api.ts
 */

import {
  getUserByUsername,
  getCountryById,
  getAllCountries,
  verifyWarEraCharacter,
} from '../services/warera.js';

async function testWarEraAPI() {
  console.log('🧪 Testing WarEra API Integration\n');
  console.log('='.repeat(50));

  // Test 1: Get user by username
  console.log('\n📋 Test 1: Get User by Username');
  console.log('-'.repeat(50));

  const testUsername = 'farmlandbee';
  console.log(`Fetching user: ${testUsername}...`);

  const user = await getUserByUsername(testUsername);

  if (user) {
    console.log('✅ User found!');
    console.log(JSON.stringify(user, null, 2));
  } else {
    console.log('❌ User not found or API error');
  }

  // Test 2: Get country by ID (if we got a user)
  if (user?.countryId) {
    console.log('\n📋 Test 2: Get Country by ID');
    console.log('-'.repeat(50));
    console.log(`Fetching country ID: ${user.countryId}...`);

    const country = await getCountryById(user.countryId);

    if (country) {
      console.log('✅ Country found!');
      console.log(JSON.stringify(country, null, 2));
    } else {
      console.log('❌ Country not found or API error');
    }
  }

  // Test 3: Get all countries
  console.log('\n📋 Test 3: Get All Countries');
  console.log('-'.repeat(50));
  console.log('Fetching all countries...');

  const countries = await getAllCountries();

  if (countries.length > 0) {
    console.log(`✅ Found ${countries.length} countries!`);
    console.log('First 5 countries:');
    countries.slice(0, 5).forEach((country, index) => {
      console.log(`  ${index + 1}. ${country.name} (ID: ${country.id})`);
    });
  } else {
    console.log('❌ No countries found or API error');
  }

  // Test 4: Full verification flow
  console.log('\n📋 Test 4: Full Verification Flow');
  console.log('-'.repeat(50));
  console.log(`Verifying character: ${testUsername}...`);

  const verification = await verifyWarEraCharacter(testUsername);

  if (verification.success) {
    console.log('✅ Verification successful!');
    console.log('\nVerification Result:');
    console.log(`  Username: ${verification.user?.username}`);
    console.log(`  User ID: ${verification.user?.id}`);
    console.log(`  Country: ${verification.country?.name || 'Unknown'}`);
    console.log(`  Country ID: ${verification.user?.countryId}`);
    console.log(`  Level: ${verification.user?.level || 'N/A'}`);
  } else {
    console.log('❌ Verification failed!');
    console.log(`  Error: ${verification.error}`);
  }

  console.log('\n' + '='.repeat(50));
  console.log('🎉 Testing complete!\n');
}

// Run tests
testWarEraAPI().catch((error) => {
  console.error('❌ Test failed with error:', error);
  process.exit(1);
});
