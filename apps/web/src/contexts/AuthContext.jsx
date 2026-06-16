
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import pb from '@/lib/pocketbaseClient.js';
import { initializeAdminUser } from '@/lib/initializeAdminUser.js';

export const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  // Admin Auth State (crmUsersAuth collection)
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Public User Auth State (Default auth collection: users)
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] =
  useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Initialize default admin user if it doesn't exist
    // initializeAdminUser();

    // 2. Check Admin Session
    try {
      const storedAdmin = localStorage.getItem('adminUser');
      if (storedAdmin) {
        const admin = JSON.parse(storedAdmin);
        setCurrentAdmin(admin);
        setIsAdminLoggedIn(true);
      }
    } catch (error) {
      console.error('[AuthContext] Admin auth check failed:', error);
      localStorage.removeItem('adminUser');
      setCurrentAdmin(null);
      setIsAdminLoggedIn(false);
    }

    // 3. Check Public Session
    setCurrentUser(pb.authStore.record);
    setIsAuthenticated(pb.authStore.isValid);

    setIsLoading(false);

    // 4. Listen to public authStore changes
    const unsubscribe = pb.authStore.onChange(() => {

      setCurrentUser(pb.authStore.record);

      setIsAuthenticated(pb.authStore.isValid);

    });

    return () => unsubscribe();
  }, []);

  // --- Public User Methods ---
  const login = async (email, password) => {
    console.log(`[AuthContext] Public user login attempt for: ${email}`);
    try {
      pb.authStore.clear();

    const authData =
      await pb.collection('users')
      .authWithPassword(
      email.trim(),
      password.trim()
    );
      console.log(`[AuthContext] Public user login successful:`, authData);
      setCurrentUser(authData.record);
      setIsAuthenticated(true);
      return authData;
    } catch (err) {
      console.error(`[AuthContext] Public user login failed:`, err);
      console.error(`[AuthContext] Full error response:`, err.response || err.message);
      throw err;
    }
  };

  const logout = () => {
    console.log(`[AuthContext] Logging out public user...`);
    pb.authStore.clear();
    setCurrentUser(null);
    setIsAuthenticated(false);
    navigate('/login');
  };

  const googleLogin = async () => {
    try {
      const authData = await pb.collection('users').authWithOAuth2({ provider: 'google'});
      console.log(`[AuthContext] Google login successful:`, authData);
      setCurrentUser(authData.record);
      setIsAuthenticated(true);
      return authData;
    } catch (err) {
      console.error(`[AuthContext] Google login failed:`, err);
      throw err;
    }
  };

  // --- Admin User Methods ---
  const loginAdmin = async (email, password) => {

  console.log(
    `[AuthContext] Admin login attempt: ${email}`
  );

  try {

    setIsLoading(true);

    pb.authStore.clear();

    console.log(
      "Before admin login:",
      pb.authStore.record
    );

    const authData =
      await pb.collection('crmUsersAuth')
      .authWithPassword(
        email.trim(),
        password.trim()
      );

    console.log(
      "Admin login successful:",
      authData
    );

    console.log(
      "After admin login:",
      pb.authStore.record
    );

    const adminUser = {

      id: authData.record?.id,

      email: authData.record?.email,

      fullName:
        authData.record?.name ||
        authData.record?.fullName ||
        'Administrator',

      role:
        authData.record?.role ||
        'admin',

      status: 'active',

    };

    console.log(
      "Saving adminUser:",
      adminUser
    );

    localStorage.setItem(
      'adminUser',
      JSON.stringify(adminUser)
    );

    console.log(
      "Stored value:",
      localStorage.getItem('adminUser')
    );

    setCurrentAdmin(adminUser);

    setIsAdminLoggedIn(true);

    return adminUser;

  } catch (error) {

    console.error(
      '[AuthContext] Admin login error:',
      error
    );

    console.error(
      '[AuthContext] Admin error details:',
      error.response ||
      error.message
    );

    if (
      error.status === 400 ||
      error.status === 404
    ) {

      throw new Error(
        'Invalid email or password'
      );

    }

    throw new Error(
      error.message ||
      'Admin login failed'
    );

  } finally {

    setIsLoading(false);

  }

};
 
   const logoutAdmin = () => {
    console.log(`[AuthContext] Logging out admin...`);
    localStorage.removeItem('adminUser');
    pb.authStore.clear();
    setCurrentAdmin(null);
    setIsAdminLoggedIn(false);
    navigate('/admin/login');
  };

  const value = {
    // Public
    currentUser,
    isAuthenticated,
    login,
    logout,
    googleLogin,
    // Admin
    currentAdmin,
    isAdminLoggedIn,
    loginAdmin,
    logoutAdmin,
    // Shared
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
