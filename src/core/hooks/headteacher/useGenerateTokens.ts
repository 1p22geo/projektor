import { useState } from 'react';
import apiClient from '@core/api/apiClient';

export const useGenerateTokens = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokens, setTokens] = useState<string[]>([]);

  const generateTokens = async (count: number): Promise<string[] | null> => {
    setLoading(true);
    setError(null);
    setTokens([]);
    try {
      const response = await apiClient.post('/headteacher/tokens', { count });
      setTokens(response.data.tokens);
      setLoading(false);
      return response.data.tokens;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to generate tokens');
      setLoading(false);
      return null;
    }
  };

  return { generateTokens, tokens, loading, error };
};