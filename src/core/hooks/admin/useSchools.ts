import useSWR from 'swr';
import { fetcher } from '@core/hooks/useApi'; // Assuming fetcher is exported from useApi

interface School {
  id: string;
  name: string;
  headteacher_id: string;
  created_at: string;
  updated_at: string;
}

export const useSchools = () => {
  const { data, error, isLoading, mutate } = useSWR<School[]>('/admin/schools', fetcher);

  return {
    schools: data,
    isLoading,
    error,
    mutate,
  };
};