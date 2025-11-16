import useSWR from 'swr';
import { fetcher } from '@core/hooks/useApi';

interface Competition {
  id: string;
  name: string;
  description: string;
  school_id: string;
  is_global: boolean;
  max_teams: number;
  max_members_per_team: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const useCompetitions = () => {
  const { data, error, isLoading, mutate } = useSWR<Competition[]>('/api/headteacher/competitions', fetcher);

  return {
    competitions: data,
    isLoading,
    error,
    mutate,
  };
};