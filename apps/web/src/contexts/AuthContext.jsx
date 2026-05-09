
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
  // Admin Auth State (Custom collection: admin_users)
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Public User Auth State (Default auth collection: users)
  const [currentUser, setCurrentUser] = useState(pb.authStore.model);
  const [isAuthenticated, setIsAuthenticated] = useState(pb.authStore.isValid);

  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Initialize default admin user if it doesn't exist
    initializeAdminUser();

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
    setCurrentUser(pb.authStore.model);
    setIsAuthenticated(pb.authStore.isValid);

    setIsLoading(false);

    // 4. Listen to public authStore changes
    const unsubscribe = pb.authStore.onChange((token, model) => {
      setCurrentUser(model);
      setIsAuthenticated(!!model);
    });

    return () => unsubscribe();
  }, []);

  // --- Public User Methods ---
  const login = async (email, password) => {
    console.log(`[AuthContext] Public user login attempt for: ${email}`);
    try {
      const authData = await pb.collection('users').authWithPassword(email, password, { $autoCancel: false });
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
      const authData = await pb.collection('users').authWithOAuth2({ provider: 'google', $autoCancel: false });
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
    console.log(`[AuthContext] Admin login attempt for: ${email}`);
    if (!pb) {
      throw new Error('Database connection error');
    }

    try {
      setIsLoading(true);
      const adminRecord = await pb.collection('admin_users').getFirstListItem(`email="${email}"`, {
        $autoCancel: false
      });

      if (adminRecord.password !== password) {
        console.warn(`[AuthContext] Admin password mismatch for: ${email}`);
        throw new Error('Invalid email or password');
      }

      console.log(`[AuthContext] Admin login successful for: ${email}`);

      const adminUser = {
        id: adminRecord.id,
        email: adminRecord.email,
        fullName: adminRecord.fullName,
        role: adminRecord.role,
        status: adminRecord.status,
      };

      localStorage.setItem('adminUser', JSON.stringify(adminUser));
      setCurrentAdmin(adminUser);
      setIsAdminLoggedIn(true);

      return adminUser;
    } catch (error) {
      console.error(`[AuthContext] Admin login error:`, error);
      console.error(`[AuthContext] Admin error details:`, error.response || error.message);
      
      if (error.status === 404) {
        throw new Error('Invalid email or password');
      }

      throw new Error(error.message === 'Invalid email or password' ? error.message : 'Login failed due to a server error.');
    } finally {
      setIsLoading(false);
    }
  };

  const logoutAdmin = () => {
    console.log(`[AuthContext] Logging out admin...`);
    localStorage.removeItem('adminUser');
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
