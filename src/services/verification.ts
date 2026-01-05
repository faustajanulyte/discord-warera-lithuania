import { verifyWarEraCharacter } from './warera.js';

/**
 * Verify user with WarEra username (database-free version)
 *
 * This function:
 * 1. Queries the WarEra API to verify the user's character exists
 * 2. Returns the user's country information
 * 3. Does NOT store anything in a database (stateless)
 */
export async function verifyUserWithWarEra(
  userId: string,
  wareraUsername: string
): Promise<{
  success: boolean;
  message: string;
  countryName?: string;
  countryId?: number;
}> {
  // Call WarEra API to verify character
  const result = await verifyWarEraCharacter(wareraUsername);

  if (!result.success || !result.user) {
    return {
      success: false,
      message: result.error || 'Failed to verify WarEra character.',
    };
  }

  console.log(
    `✅ Verified ${wareraUsername} (User ID: ${userId}) - Country: ${result.country?.name}`
  );

  return {
    success: true,
    message: 'Successfully verified with WarEra!',
    countryName: result.country?.name,
    countryId: result.user.countryId,
  };
}
