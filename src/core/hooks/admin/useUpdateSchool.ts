import { useState } from 'react';
import axiosInstance from '@core/api';
import { useSchools } from './useSchools'; // To revalidate the schools list

interface UpdateSchoolData {
  name?: string;
  headteacher_id?: string;
}

export const useUpdateSchool = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { mutate } = useSchools();

  const updateSchool = async (schoolId: string, schoolData: UpdateSchoolData): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await axiosInstance.put(`/api/admin/schools/${schoolId}`, schoolData);
      mutate(); // Revalidate the schools list
      setLoading(false);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update school');
      setLoading(false);
      return false;
    }
  };

  return { updateSchool, loading, error };
};
