import useSWR from 'swr';
import { fetcher } from '@core/hooks/useApi';

interface ChatMessage {
  _id: string;
  user: { userId: string; name: string };
  message: string;
  createdAt: string;
}

interface TeamFile {
  _id: string;
  filename: string;
  url: string;
  size: number;
  user: { userId: string; name: string };
  createdAt: string;
}

export const useGetTeamChat = (teamId: string) => {
  const { data, error } = useSWR<ChatMessage[]>(teamId ? `/headteacher/teams/${teamId}/chat` : null, fetcher);
  return {
    chatMessages: data,
    loading: !error && !data,
    error,
  };
};

export const useGetTeamFiles = (teamId: string) => {
  const { data, error } = useSWR<TeamFile[]>(teamId ? `/headteacher/teams/${teamId}/files` : null, fetcher);
  return {
    teamFiles: data,
    loading: !error && !data,
    error,
  };
};
