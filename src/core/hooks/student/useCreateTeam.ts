import { useState } from 'react';
import apiClient from '@core/api/apiClient';

interface CreateTeamData {
  name: string;
  competition_id: string;
}

export const useCreateTeam = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTeam = async (competitionId: string, teamName: string): Promise<{ id: string } | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post(`/competitions/${competitionId}/teams`, { name: teamName });
      console.log('Team created:', response.data);
      setLoading(false);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create team');
      setLoading(false);
      return null;
    }
  };

  return { createTeam, loading, error };
};