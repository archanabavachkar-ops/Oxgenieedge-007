import pb from '@/lib/pocketbaseClient';
import apiServerClient from '@/lib/apiServerClient';

/**
 * Validates the current PocketBase auth token using the Horizons backend.
 * @returns {Promise<boolean>} True if valid, false otherwise.
 */
export const validateAuthToken = async () => {
  if (!pb.authStore.isValid || !pb.authStore.token) {
    console.log('[AuthHelper] No valid token found in store.');
    return false;
  }
  
  try {
    console.log('[AuthHelper] Validating token with backend...');
    const response = await apiServerClient.fetch('/pocketbase/verify', {
      headers: {
        'Authorization': `Bearer ${pb.authStore.token}`
      }
    });
    
    if (!response.ok) {
      console.warn('[AuthHelper] Token validation request failed with status:', response.status);
      return false;
    }
    
    const data = await response.json();
    console.log('[AuthHelper] Token validation result:', data);
    return data.success && data.valid;
  } catch (error) {
    console.error('[AuthHelper] Error validating token:', error);
    return false;
  }
};

/**
 * Refreshes the PocketBase auth token using the Horizons backend.
 * @returns {Promise<boolean>} True if refreshed successfully, false otherwise.
 */
export const refreshAuthToken = async () => {
  if (!pb.authStore.token) {
    console.log('[AuthHelper] Cannot refresh: No existing token.');
    return false;
  }
  
  try {
    console.log('[AuthHelper] Attempting to refresh auth token...');
    const response = await apiServerClient.fetch('/pocketbase/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: pb.authStore.token })
    });
    
    if (!response.ok) {
      console.warn('[AuthHelper] Token refresh request failed with status:', response.status);
      pb.authStore.clear();
      return false;
    }
    
    const data = await response.json();
    if (data.success && data.token) {
      pb.authStore.save(data.token, data.user || pb.authStore.model);
      console.log('[AuthHelper] Token refreshed successfully.');
      return true;
    }
    
    console.warn('[AuthHelper] Refresh response did not contain a valid token.');
    pb.authStore.clear();
    return false;
  } catch (error) {
    console.error('[AuthHelper] Error refreshing token:', error);
    pb.authStore.clear();
    return false;
  }
};

/**
 * Maps OAuth2 provider response data to the PocketBase user profile.
 * Extracts name, email, and avatar from Google OAuth response and updates the user.
 * @param {Object} authData - The response from pb.collection().authWithOAuth2()
 * @returns {Promise<Object>} The updated user record
 */
export const syncOAuthProfile = async (authData) => {
  try {
    const { record, meta } = authData;
    if (!meta) return record;

    const formData = new FormData();
    let hasUpdates = false;

    // Extract name
    if (!record.name && meta.name) {
      formData.append('name', meta.name);
      hasUpdates = true;
    }

    // Extract email (if missing)
    if (!record.email && meta.email) {
      formData.append('email', meta.email);
      hasUpdates = true;
    }

    // Extract and fetch avatar to save as a file
    if (!record.avatar && meta.avatarUrl) {
      try {
        const response = await fetch(meta.avatarUrl);
        if (response.ok) {
          const blob = await response.blob();
          formData.append('avatar', blob, 'avatar.jpg');
          hasUpdates = true;
        }
      } catch (e) {
        console.warn('[AuthHelper] Could not fetch OAuth avatar for upload:', e);
      }
    }
    
    if (hasUpdates) {
       console.log('[AuthHelper] Updating user profile with OAuth data...');
       const updatedRecord = await pb.collection('users').update(record.id, formData, { $autoCancel: false });
       return updatedRecord;
    }
    
    return record;
  } catch (err) {
    console.error('[AuthHelper] Failed to sync OAuth profile:', err);
    return authData.record;
  }
};

/**
 * Initializes PocketBase auth on app load, checking validity and refreshing if needed.
 * @returns {Promise<boolean>} True if authenticated, false otherwise.
 */
export const initializePocketbaseAuth = async () => {
  console.log('=== PocketBase Client Configuration ===');
  console.log('Base URL:', pb.baseUrl);
  console.log('Auth Store Valid:', pb.authStore.isValid);
  console.log('Auth Store Model:', pb.authStore.model?.id);
  console.log('Environment:', import.meta.env.MODE || 'development');
  console.log('=======================================');

  if (pb.authStore.isValid) {
    const isValid = await validateAuthToken();
    if (!isValid) {
      console.log('[AuthHelper] Token invalid or expired, attempting refresh...');
      const refreshed = await refreshAuthToken();
      return refreshed;
    }
    return true;
  }
  
  return false;
};