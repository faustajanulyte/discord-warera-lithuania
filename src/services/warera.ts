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

export enum WarEraError {
  MultipleMatches = 'MULTIPLE_MATCHES',
  ApiError = 'API_ERROR',
  UserNotFound = 'USER_NOT_FOUND'
  // Add more if needed
}
export interface ApiError {
  success: false;
  error: WarEraError;
}

export interface SearchSuccess {
  success: true;
  result: SearchResult;
}

export interface UserSuccess {
  success: true;
  user: WarEraUser;
}

export interface VerificationResult {
  success: true;
  user: WarEraUser;
  country?: WarEraCountry;
}

export interface VerificationError {
  success: false;
  error: string;
}

export type SearchResponse = SearchSuccess | ApiError;
export type UserResponse = UserSuccess | ApiError;
export type VerificationResponse = VerificationResult | VerificationError;

function warEraErrorMessage(
  error: WarEraError,
  username?: string,
  id?: string
): string {
  switch (error) {
    case WarEraError.UserNotFound:
      return id
        ? `Character with ID "${id}" not found in WarEra.`
        : `Character "${username ?? 'unknown'}" not found in WarEra.`;

    case WarEraError.MultipleMatches:
      return `Multiple characters matched "${username}". Please use your ID instead.`;

    case WarEraError.ApiError:
      return `WarEra API is currently unavailable. Please try again later.`;

    default:
      return `Unknown error occurred.`;
  }
}

/**
 * Search for a user by username using global search
 * Returns userIds array that needs to be fetched individually
 */
export async function searchUser(username: string): Promise<SearchResponse> {
  try {
    const input = { searchText: username };
    const params = new URLSearchParams({
      input: JSON.stringify(input),
    });

    const response = await fetch(`${WARERA_API_BASE}/search.searchAnything?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      return { success: false, error: WarEraError.ApiError };
    }

    const data = (await response.json()) as any;

    // Search API returns: { result: { data: { userIds: [...], muIds: [], ... } } }
    const searchData = data?.result?.data;

    if (!searchData?.userIds?.length) {
      return { success: false, error: WarEraError.UserNotFound };
    }

    if (searchData.userIds.length > 1) {
      return { success: false, error: WarEraError.MultipleMatches };
    }

    // Return the first user ID found (we'll fetch full details with getUserById)
    return {
      success: true,
      result: {
        type: 'user',
        id: searchData.userIds[0],
      }
    };
  } catch (error) {
    console.error('Error searching WarEra user:', error);
    return { success: false, error: WarEraError.ApiError };
  }
}

/**
 * Fetch user data from WarEra API by user ID
 */
export async function getUserById(userId: string | number): Promise<UserResponse> {
  try {
    const input = { userId: String(userId) };
    const params = new URLSearchParams({
      input: JSON.stringify(input),
    });

    const response = await fetch(`${WARERA_API_BASE}/user.getUserLite?${params}`, { 
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = (await response.json()) as any;

    if (!response.ok) {
      console.error(`WarEra API error: ${response.status} ${response.statusText}`);
      console.error('Response:', data);

      try {  
        if (data?.error?.code === -32004 || data?.error?.data?.code === 'NOT_FOUND') {
          return { success: false, error: WarEraError.UserNotFound };
        }
        
        return { success: false, error: WarEraError.ApiError };
      } catch (parseError) {
        console.error('Failed to parse error response:', parseError);
      }
    }

    const userData = data?.result?.data;

    if (!userData || !userData._id) {
      return { success: false, error: WarEraError.UserNotFound };
    }

    // Transform API response to our interface
    return {
      success: true,
      user: {
        id: userData._id,
        username: userData.username,
        countryId: userData.country,
        level: userData.leveling?.level,
        experience: userData.leveling?.totalXp
      } as WarEraUser
    };
  } catch (error) {
    console.error('Error fetching WarEra user:', error);
    return { success: false, error: WarEraError.ApiError };
  }
}

/**
 * Fetch user data from WarEra API by username (uses search first, then gets full data)
 */
export async function getUserByUsername(username: string): Promise<UserResponse> {
  // First, search for the user to get their ID
  const search = await searchUser(username);

  if (!search.success) {
    return search;
  }

  const userResult = await getUserById(search.result.id);

  if (!userResult.success) {
    return userResult;
  }

  return { 
    success: true,
    user: userResult.user
  };
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
export async function verifyWarEraCharacter(
  username: string | null,
  id: string | null
): Promise<VerificationResponse> {
  // Fetch user data, no need for redundant null check (currently). Add null check if used in another command
  const result = id 
    ? await getUserById(id)
    : await getUserByUsername(username!);

  if (!result.success) {
    return {
      success: false,
      error: warEraErrorMessage(result.error, username ?? undefined, id ?? undefined)
    };
  }

  // Get country data
  const country = await getCountryById(result.user.countryId);

  return {
    success: true,
    user: result.user,
    country: country || undefined,
  };
}
