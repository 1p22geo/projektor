import { useState } from 'react';
import axiosInstance from '@core/api';
import { useSchools } from './useSchools'; // To revalidate the schools list

interface CreateSchoolData {
  name: string;
  headteacher_id: string;
}

export const useCreateSchool = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { mutate } = useSchools();

  const createSchool = async (schoolData: CreateSchoolData): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await axiosInstance.post('/api/admin/schools', schoolData);
      mutate(); // Revalidate the schools list
      setLoading(false);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create school');
      setLoading(false);
      return false;
    }
  };

  return { createSchool, loading, error };
};
