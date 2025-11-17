import useSWR from 'swr';
import { fetcher } from '@core/hooks/useApi';

interface JoinRequest {
  id: string;
  team_id: string;
  user_id: string;
  user_name: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvals: string[]; // Array of user IDs who approved
  created_at: string;
  updated_at: string;
}

export const useJoinRequests = (teamId: string) => {
  const { data, error, isLoading, mutate } = useSWR<JoinRequest[]>(teamId ? `/teams/${teamId}/join-requests` : null, fetcher);

  return {
    joinRequests: data,
    isLoading,
    error,
    mutate,
  };
};
