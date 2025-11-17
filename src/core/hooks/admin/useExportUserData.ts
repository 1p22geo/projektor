import { useState } from 'react';
import apiClient from '@core/api/apiClient';

export const useExportUserData = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportUserData = async (userId: string): Promise<any | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(`/admin/users/${userId}/export`);
      setLoading(false);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to export user data');
      setLoading(false);
      return null;
    }
  };

  return { exportUserData, loading, error };
};
