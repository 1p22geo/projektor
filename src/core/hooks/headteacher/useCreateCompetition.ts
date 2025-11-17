import { useState } from 'react';
import apiClient from '@core/api/apiClient';
import { useCompetitions } from './useCompetitions'; // To revalidate the competitions list

interface CreateCompetitionData {
  name: string;
  description: string;
  school_id: string;
  is_global: boolean;
  max_teams: number;
  max_members_per_team: number;
  created_by: string;
}

export const useCreateCompetition = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { mutate } = useCompetitions();

  const createCompetition = async (competitionData: CreateCompetitionData): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.post('/headteacher/competitions', competitionData);
      mutate(); // Revalidate the competitions list
      setLoading(false);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create competition');
      setLoading(false);
      return false;
    }
  };

  return { createCompetition, loading, error };
};
