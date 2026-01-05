/**
 * WarEra API Integration
 * https://api2.warera.io/openapi.json
 *
 * Note: tRPC API uses GET requests with /trpc/ base path
 * Format: GET /trpc/endpoint?input={"searchText":"value"}
 */

const WARERA_API_BASE = 'https://api2.warera.io/trpc';

export interface WarEraUser {
  id: number;
  username: string;
  countryId: number;
  countryName?: string;
  level?: number;
  experience?: number;
  strength?: number;
  economySkill?: number;
  // Add more fields based on actual API response
}

export interface WarEraCountry {
  id: number;
  name: string;
  // Add more fields as needed
}

export interface SearchResult {
  type: string;
  id: string;
  name?: string;
  username?: string;
  [key: string]: any;
}

/**
 * Search for a user by username using global search
 * Returns userIds array that needs to be fetched individually
 */
export async function searchUser(username: string): Promise<SearchResult | null> {
  try {
    const input = { searchText: username };
    const params = new URLSearchParams({
      input: JSON.stringify(input),
    });

    const response = await fetch(`${WARERA_API_BASE}/search.searchAnything?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`WarEra API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = (await response.json()) as any;

    // Search API returns: { result: { data: { userIds: [...], muIds: [], ... } } }
    const searchData = data?.result?.data;

    if (!searchData?.userIds || searchData.userIds.length === 0) {
      return null;
    }

    // Return the first user ID found (we'll fetch full details with getUserById)
    return {
      type: 'user',
      id: searchData.userIds[0],
    } as SearchResult;
  } catch (error) {
    console.error('Error searching WarEra user:', error);
    return null;
  }
}

/**
 * Fetch user data from WarEra API by user ID
 */
export async function getUserById(userId: string | number): Promise<WarEraUser | null> {
  try {
    const input = { userId: String(userId) };
    const params = new URLSearchParams({
      input: JSON.stringify(input),
    });

    const response = await fetch(`${WARERA_API_BASE}/user.getUserLite?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`WarEra API error: ${response.status} ${response.statusText}`);
      console.error('Response:', text);
      return null;
    }

    const data = (await response.json()) as any;
    const userData = data?.result?.data;

    if (!userData || !userData._id) {
      return null;
    }

    // Transform API response to our interface
    return {
      id: userData._id,
      username: userData.username,
      countryId: userData.country, // API returns 'country' field which is the country ID
      level: userData.leveling?.level,
      experience: userData.leveling?.totalXp,
      // Add more fields as needed from the API response
    } as WarEraUser;
  } catch (error) {
    console.error('Error fetching WarEra user:', error);
    return null;
  }
}

/**
 * Fetch user data from WarEra API by username (uses search first, then gets full data)
 */
export async function getUserByUsername(username: string): Promise<WarEraUser | null> {
  // First, search for the user to get their ID
  const searchResult = await searchUser(username);

  if (!searchResult?.id) {
    return null;
  }

  // Then fetch full user data with the ID
  return await getUserById(searchResult.id);
}

/**
 * Get country information by ID
 */
export async function getCountryById(countryId: number | string): Promise<WarEraCountry | null> {
  try {
    const input = { countryId: String(countryId) };
    const params = new URLSearchParams({
      input: JSON.stringify(input),
    });

    const response = await fetch(`${WARERA_API_BASE}/country.getCountryById?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`WarEra API error: ${response.status} ${response.statusText}`);
      console.error('Response:', text);
      return null;
    }

    const data = (await response.json()) as any;
    const countryData = data?.result?.data;

    if (!countryData || !countryData._id) {
      return null;
    }

    return {
      id: countryData._id,
      name: countryData.name,
    } as WarEraCountry;
  } catch (error) {
    console.error('Error fetching WarEra country:', error);
    return null;
  }
}

/**
 * Get all countries from WarEra
 */
export async function getAllCountries(): Promise<WarEraCountry[]> {
  try {
    const input = {};
    const params = new URLSearchParams({
      input: JSON.stringify(input),
    });

    const response = await fetch(`${WARERA_API_BASE}/country.getAllCountries?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`WarEra API error: ${response.status} ${response.statusText}`);
      return [];
    }

    const data = (await response.json()) as any;
    const countries = data?.result?.data;

    if (!Array.isArray(countries)) {
      return [];
    }

    // Transform API response to our interface
    return countries.map((country: any) => ({
      id: country._id,
      name: country.name,
    }));
  } catch (error) {
    console.error('Error fetching WarEra countries:', error);
    return [];
  }
}

/**
 * Verify a user's WarEra character and get their full data
 */
export async function verifyWarEraCharacter(username: string): Promise<{
  success: boolean;
  user?: WarEraUser;
  country?: WarEraCountry;
  error?: string;
}> {
  // Get user data
  const user = await getUserByUsername(username);

  if (!user) {
    return {
      success: false,
      error: `Character "${username}" not found in WarEra. Please check your username.`,
    };
  }

  // Get country data
  const country = await getCountryById(user.countryId);

  return {
    success: true,
    user,
    country: country || undefined,
  };
}
