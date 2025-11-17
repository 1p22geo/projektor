import { useState } from 'react';
import apiClient from '@core/api/apiClient';
import { useUsers } from './useUsers'; // To revalidate the users list

export const useResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { mutate } = useUsers();

  const resetPassword = async (userId: string): Promise<string | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.put(`/admin/users/${userId}/reset-password`);
      mutate(); // Revalidate the users list
      setLoading(false);
      return response.data.new_password;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to reset password');
      setLoading(false);
      return null;
    }
  };

  return { resetPassword, loading, error };
};
