import { useState } from 'react';
import apiClient from '@core/api/apiClient';
import { useUsers } from './useUsers'; // To revalidate the users list

export const useDeleteUser = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { mutate } = useUsers();

  const deleteUser = async (userId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.delete(`/admin/users/${userId}`);
      mutate(); // Revalidate the users list
      setLoading(false);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete user');
      setLoading(false);
      return false;
    }
  };

  return { deleteUser, loading, error };
};
