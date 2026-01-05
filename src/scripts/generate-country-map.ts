/**
 * Script to fetch all countries from WarEra API and generate country mapping
 * Run with: npm run ts-node src/scripts/generate-country-map.ts
 */

import { getAllCountries } from '../services/warera.js';

interface CountryMapping {
  wareraName: string;
  roleNameSuggestion: string;
}

/**
 * Suggests a Discord role name based on the WarEra country name
 * Handles common naming patterns
 */
function suggestRoleName(countryName: string): string {
  // Common transformations
  const transformations: Record<string, string> = {
    'United States': 'USA',
    'United Kingdom': 'UK',
    'United Arab Emirates': 'UAE',
    'South Korea': 'South Korea',
    'North Korea': 'North Korea',
    'South Africa': 'South Africa',
    'New Zealand': 'New Zealand',
    'Saudi Arabia': 'Saudi Arabia',
  };

  // Check if we have a manual transformation
  if (transformations[countryName]) {
    return transformations[countryName];
  }

  // Otherwise, use the country name as-is
  // Remove common prefixes/suffixes if needed
  let roleName = countryName
    .replace(/^The\s+/i, '') // Remove "The" prefix
    .replace(/\s+of\s+/gi, ' ') // Simplify "Republic of X" → "Republic X"
    .trim();

  return roleName;
}

/**
 * Main function to fetch countries and generate mapping
 */
async function generateCountryMap(): Promise<void> {
  console.log('🌍 Fetching countries from WarEra API...\n');

  const countries = await getAllCountries();

  if (countries.length === 0) {
    console.error('❌ Failed to fetch countries from WarEra API');
    process.exit(1);
  }

  console.log(`✅ Found ${countries.length} countries\n`);

  // Sort alphabetically by name
  const sortedCountries = countries.sort((a, b) => a.name.localeCompare(b.name));

  // Generate mapping
  const mappings: CountryMapping[] = sortedCountries.map(country => ({
    wareraName: country.name,
    roleNameSuggestion: suggestRoleName(country.name),
  }));

  // Generate TypeScript code
  console.log('📝 Generated country mapping:\n');
  console.log('```typescript');
  console.log('export const WARERA_COUNTRY_MAP: Record<string, string> = {');

  for (const mapping of mappings) {
    console.log(`  "${mapping.wareraName}": "${mapping.roleNameSuggestion}",`);
  }

  console.log('};');
  console.log('```\n');

  console.log(`✅ Total: ${mappings.length} countries (alphabetically sorted)\n`);
  console.log('💡 Copy the generated code above and paste it into src/config/countries.ts');
  console.log('💡 Review role name suggestions and adjust as needed');
}

// Run the script
generateCountryMap().catch(error => {
  console.error('Error generating country map:', error);
  process.exit(1);
});
