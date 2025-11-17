import useSWR from 'swr';
import { fetcher } from '@core/hooks/useApi';

interface FileData {
  id: string;
  user_id: string;
  user_name: string;
  filename: string;
  url: string;
  size: number;
  created_at: string;
}

export const useGetTeamFiles = (teamId: string) => {
  const { data, error, isLoading, mutate } = useSWR<FileData[]>(teamId ? `/headteacher/teams/${teamId}/files` : null, fetcher);

  return {
    files: data,
    isLoading,
    error,
    mutate,
  };
};
