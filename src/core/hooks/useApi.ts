import apiClient from '../api/apiClient';

export const fetcher = (url: string) => apiClient.get(url).then(res => res.data);