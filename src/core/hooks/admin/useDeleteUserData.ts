import { useState } from 'react';
import apiClient from '@core/api/apiClient';
import { useUsers } from './useUsers'; // To revalidate the users list

export const useDeleteUserData = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { mutate } = useUsers();

  const deleteUserData = async (userId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.delete(`/admin/users/${userId}/data`);
      mutate(); // Revalidate the users list
      setLoading(false);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete user data');
      setLoading(false);
      return false;
    }
  };

  return { deleteUserData, loading, error };
};
