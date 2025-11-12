import useSWR, { mutate } from 'swr';
import apiClient from '@core/api/apiClient';

interface Competition {
  _id: string;
  name: string;
  description: string;
  school: string;
  isGlobal: boolean;
  maxTeams: number;
  maxMembersPerTeam: number;
}

export const useHeadteacherCompetitions = () => {
  const { data, error } = useSWR<Competition[]>('/headteacher/competitions', apiClient.get);
  return {
    competitions: data,
    loading: !error && !data,
    error,
  };
};

export const useCreateCompetition = () => {
  const createCompetition = async (competitionData: Omit<Competition, '_id' | 'school'>) => {
    const response = await apiClient.post('/headteacher/competitions', competitionData);
    mutate('/headteacher/competitions'); // Revalidate competitions list
    return response.data;
  };
  return { createCompetition };
};

// Add other competition management hooks (e.g., useUpdateCompetition, useDeleteCompetition) as needed
