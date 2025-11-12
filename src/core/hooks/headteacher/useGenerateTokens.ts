import { useState } from 'react';
import apiClient from '@core/api/apiClient';

interface GenerateTokensResponse {
  tokens: string[];
}

const useGenerateTokens = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateTokens = async (count: number): Promise<string[] | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post<GenerateTokensResponse>('/headteacher/tokens', { count });
      setLoading(false);
      return response.data.tokens;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate tokens');
      setLoading(false);
      return null;
    }
  };

  return { generateTokens, loading, error };
};

export default useGenerateTokens;
