import { useState } from 'react';
import apiClient from '@core/api/apiClient';

const useCreateTeam = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTeam = async (competitionId: string, teamName: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.post(`/competitions/${competitionId}/teams`, { name: teamName });
      setLoading(false);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create team');
      setLoading(false);
      return false;
    }
  };

  return { createTeam, loading, error };
};

export default useCreateTeam;
