
import { useState, useCallback } from 'react';
import apiServerClient from '@/lib/apiServerClient.js';
import { toast } from 'sonner';

export function useUserManagement() {
  const [isLoading, setIsLoading] = useState(false);

  const fetchUsers = useCallback(async (params = {}) => {
    setIsLoading(true);
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await apiServerClient.fetch(`/users?${queryString}`);
      if (!response.ok) throw new Error('Failed to fetch users');
      return await response.json();
    } catch (error) {
      toast.error(error.message);
      return { items: [], totalItems: 0 };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createUser = useCallback(async (userData) => {
    setIsLoading(true);
    try {
      const response = await apiServerClient.fetch('/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      if (!response.ok) throw new Error('Failed to create user');
      toast.success('User created successfully');
      return await response.json();
    } catch (error) {
      toast.error(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUser = useCallback(async (id, userData) => {
    setIsLoading(true);
    try {
      const response = await apiServerClient.fetch(`/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      if (!response.ok) throw new Error('Failed to update user');
      toast.success('User updated successfully');
      return await response.json();
    } catch (error) {
      toast.error(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteUser = useCallback(async (id) => {
    setIsLoading(true);
    try {
      const response = await apiServerClient.fetch(`/users/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete user');
      toast.success('User deleted successfully');
      return true;
    } catch (error) {
      toast.error(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleStatus = useCallback(async (id) => {
    setIsLoading(true);
    try {
      const response = await apiServerClient.fetch(`/users/${id}/toggle-status`, { method: 'POST' });
      if (!response.ok) throw new Error('Failed to toggle status');
      toast.success('Status updated successfully');
      return await response.json();
    } catch (error) {
      toast.error(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { fetchUsers, createUser, updateUser, deleteUser, toggleStatus, isLoading };
}
