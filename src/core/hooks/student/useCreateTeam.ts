import { useState } from 'react';
import apiClient from '@core/api/apiClient';

interface CreateTeamData {
  name: string;
  competition_id: string;
}

export const useCreateTeam = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTeam = async (competitionId: string, teamName: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post(`/competitions/${competitionId}/teams`, { name: teamName });
      // Assuming the API returns the created team data, you might want to do something with it
      console.log('Team created:', response.data);
      setLoading(false);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create team');
      setLoading(false);
      return false;
    }
  };

  return { createTeam, loading, error };
};