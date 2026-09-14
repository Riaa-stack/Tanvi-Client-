import { apiClient } from './client';

export const healthApi = {
  getHealth: async () => {
    const res = await apiClient.get<{ status: string; service: string }>('/health');
    return res.data;
  },

  getDetailedHealth: async () => {
    const res = await apiClient.get<{
      status: string;
      components: {
        database?: { status: string; error?: string };
        vector_store?: { status: string; error?: string; collections?: string[] };
        gemini?: { status: string; error?: string };
        embedding?: { status: string; model?: string; dimensions?: number };
      };
    }>('/health/detailed');
    return res.data;
  },
};
