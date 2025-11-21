import useSWR from 'swr';
import apiClient from '@core/api/apiClient';

interface TeamMember {
  user_id: string;
  name: string;
}

interface ChatMessage {
  id?: string;
  user_id: string;
  user_name: string;
  message: string;
  created_at: string;
}

interface FileData {
  id: string;
  user_id: string;
  user_name: string;
  filename: string;
  url: string;
  size: number;
  created_at: string;
}

interface Team {
  id: string;
  name: string;
  competition_id: string;
  members: TeamMember[];
  chat: ChatMessage[];
  files: FileData[];
  url?: string;
  created_at: string;
  updated_at: string;
}

export const useTeam = (teamId: string | undefined) => {
  const { data, error, isLoading, mutate } = useSWR<Team>(
    teamId ? `/teams/${teamId}` : null,
    (url) => apiClient.get(url).then((res) => res.data)
  );

  return {
    team: data,
    error: error?.message,
    isLoading,
    mutate,
  };
};
