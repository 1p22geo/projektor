import useSWR from 'swr';
import { fetcher } from '@core/hooks/useApi';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  school_id?: string;
  created_at: string;
  updated_at: string;
}

export const useUsers = () => {
  const { data, error, isLoading, mutate } = useSWR<User[]>('/admin/users', fetcher);

  return {
    users: data,
    isLoading,
    error,
    mutate,
  };
};