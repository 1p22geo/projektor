import useSWR, { mutate } from 'swr';
import apiClient from '@core/api/apiClient';

interface School {
  _id: string;
  name: string;
  headteacher: string; // Assuming headteacher ID
}

export const useSchools = () => {
  const { data, error } = useSWR<School[]>('/admin/schools', apiClient.get);
  return {
    schools: data,
    loading: !error && !data,
    error,
  };
};

export const useCreateSchool = () => {
  const createSchool = async (name: string) => {
    const response = await apiClient.post('/admin/schools', { name });
    mutate('/admin/schools'); // Revalidate schools list
    return response.data;
  };
  return { createSchool };
};

// Add other school management hooks (e.g., useUpdateSchool, useDeleteSchool) as needed
