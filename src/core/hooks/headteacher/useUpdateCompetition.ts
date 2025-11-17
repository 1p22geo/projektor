import { useState } from 'react';
import apiClient from '@core/api/apiClient';
import { useCompetitions } from './useCompetitions'; // To revalidate the competitions list

interface UpdateCompetitionData {
  name?: string;
  description?: string;
  school_id?: string;
  is_global?: boolean;
  max_teams?: number;
  max_members_per_team?: number;
}

export const useUpdateCompetition = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { mutate } = useCompetitions();

  const updateCompetition = async (competitionId: string, competitionData: UpdateCompetitionData): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.put(`/headteacher/competitions/${competitionId}`, competitionData);
      mutate(); // Revalidate the competitions list
      setLoading(false);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update competition');
      setLoading(false);
      return false;
    }
  };

  return { updateCompetition, loading, error };
};
