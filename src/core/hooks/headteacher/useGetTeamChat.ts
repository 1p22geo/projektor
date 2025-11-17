import useSWR from 'swr';
import { fetcher } from '@core/hooks/useApi';

interface ChatMessage {
  user_id: string;
  user_name: string;
  message: string;
  created_at: string;
}

export const useGetTeamChat = (teamId: string) => {
  const { data, error, isLoading, mutate } = useSWR<ChatMessage[]>(teamId ? `/headteacher/teams/${teamId}/chat` : null, fetcher);

  return {
    chatMessages: data,
    isLoading,
    error,
    mutate,
  };
};
