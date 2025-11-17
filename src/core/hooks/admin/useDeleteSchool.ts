import { useState } from 'react';
import apiClient from '@core/api/apiClient';
import { useSchools } from './useSchools'; // To revalidate the schools list

export const useDeleteSchool = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { mutate } = useSchools();

  const deleteSchool = async (schoolId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.delete(`/admin/schools/${schoolId}`);
      mutate(); // Revalidate the schools list
      setLoading(false);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete school');
      setLoading(false);
      return false;
    }
  };

  return { deleteSchool, loading, error };
};
