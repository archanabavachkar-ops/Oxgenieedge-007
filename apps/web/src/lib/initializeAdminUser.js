
import pb from '@/lib/pocketbaseClient.js';

export const initializeAdminUser = async () => {
  if (!pb) {
    console.error('[initializeAdminUser] Error: PocketBase client is not initialized!');
    return null;
  }

  const adminEmail = 'admin@example.com';

  try {
    console.log(`[initializeAdminUser] Checking if admin user (${adminEmail}) exists...`);
    
    let existingAdmin = null;
    
    // (1) Check if admin user exists, wrapped in try/catch for the 'not found' error
    try {
      existingAdmin = await pb.collection('admin_users').getFirstListItem(`email="${adminEmail}"`, {
        $autoCancel: false
      });
    } catch (checkError) {
      // 404 is expected if the user does not exist yet
      if (checkError.status !== 404) {
        console.warn('[initializeAdminUser] Error during existence check (not 404):', checkError);
      }
    }

    // (2) If user exists, log and return early
    if (existingAdmin) {
      console.log('[initializeAdminUser] Admin user already exists, skipping creation');
      return existingAdmin;
    }

    // (3) Create the admin user with the complete payload
    const payload = {
      email: adminEmail,
      password: 'Admin@123456',
      fullName: 'Administrator',
      role: 'CEO',
      status: 'Active'
    };

    console.log('[initializeAdminUser] Attempting to create admin user with payload:', { 
      ...payload, 
      password: '[REDACTED]' 
    });

    const newRecord = await pb.collection('admin_users').create(payload, {
      $autoCancel: false
    });

    // (4) Log success message
    console.log('[initializeAdminUser] Admin user created successfully with email: admin@example.com');
    
    return newRecord;

  } catch (error) {
    // (5) Log any errors with clear messaging including the error details
    console.error('[initializeAdminUser] Error initializing admin user. Failed to create the record:', error.message || error);
    
    // Provide actionable feedback for 400 validation errors
    if (error.response?.data) {
      console.error('[initializeAdminUser] Validation error details:', JSON.stringify(error.response.data, null, 2));
    } else if (error.data?.data) {
      console.error('[initializeAdminUser] Validation error details:', JSON.stringify(error.data.data, null, 2));
    }
    
    return null;
  }
};
