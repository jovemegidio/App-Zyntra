import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL, API_TIMEOUT } from './constants';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token storage keys
const TOKEN_KEY = 'zyntra_auth_token';
const REFRESH_TOKEN_KEY = 'zyntra_refresh_token';

// Token management
export const tokenStorage = {
  async getToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  async setToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  },

  async getRefreshToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  async setRefreshToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
  },

  async clearTokens(): Promise<void> {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  },
};

// Request interceptor - add auth token
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await tokenStorage.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 - try refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await tokenStorage.getRefreshToken();
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const { token, refreshToken: newRefreshToken } = response.data;
          await tokenStorage.setToken(token);
          await tokenStorage.setRefreshToken(newRefreshToken);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed - clear tokens
        await tokenStorage.clearTokens();
        throw refreshError;
      }
    }

    return Promise.reject(error);
  }
);

// API Methods
export const authApi = {
  login: async (credentials: { email?: string; cpf?: string; senha: string }) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  logout: async () => {
    await api.post('/auth/logout');
    await tokenStorage.clearTokens();
  },

  getProfile: async () => {
    const response = await api.get('/user/profile');
    return response.data;
  },

  refreshToken: async (refreshToken: string) => {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },
};

export const dashboardApi = {
  getKPIs: async () => {
    const response = await api.get('/dashboard/kpis');
    return response.data;
  },

  getResumo: async () => {
    const response = await api.get('/dashboard/resumo');
    return response.data;
  },

  getAtividades: async () => {
    const response = await api.get('/dashboard/atividades');
    return response.data;
  },
};

export const financeiroApi = {
  getSaldo: async () => {
    const response = await api.get('/financeiro/saldo');
    return response.data;
  },

  getFluxoCaixa: async () => {
    const response = await api.get('/financeiro/fluxo-caixa');
    return response.data;
  },

  getContasReceber: async () => {
    const response = await api.get('/financeiro/contas-receber');
    return response.data;
  },

  getDRE: async () => {
    const response = await api.get('/financeiro/dre');
    return response.data;
  },
};

export const vendasApi = {
  getPedidos: async (params?: { busca?: string }) => {
    const response = await api.get('/vendas/pedidos', { params });
    return response.data;
  },

  getFunil: async () => {
    const response = await api.get('/vendas/funil');
    return response.data;
  },

  getMetas: async () => {
    const response = await api.get('/vendas/metas');
    return response.data;
  },
};

export const rhApi = {
  getColaboradores: async () => {
    const response = await api.get('/rh/colaboradores');
    return response.data;
  },

  getPonto: async () => {
    const response = await api.get('/rh/ponto');
    return response.data;
  },

  getAniversarios: async () => {
    const response = await api.get('/rh/aniversarios');
    return response.data;
  },
};

export const pcpApi = {
  getOrdens: async () => {
    const response = await api.get('/pcp/ordens');
    return response.data;
  },

  getEficiencia: async () => {
    const response = await api.get('/pcp/eficiencia');
    return response.data;
  },
};

export const logisticaApi = {
  getEntregas: async () => {
    const response = await api.get('/logistica/entregas');
    return response.data;
  },

  getRotas: async () => {
    const response = await api.get('/logistica/rotas');
    return response.data;
  },
};

export const faturamentoApi = {
  getNotas: async () => {
    const response = await api.get('/faturamento/notas');
    return response.data;
  },

  getResumo: async () => {
    const response = await api.get('/faturamento/resumo');
    return response.data;
  },
};

export const comprasApi = {
  getPedidos: async () => {
    const response = await api.get('/compras/pedidos');
    return response.data;
  },

  getFornecedores: async () => {
    const response = await api.get('/compras/fornecedores');
    return response.data;
  },
};

export const notificacoesApi = {
  getAll: async () => {
    const response = await api.get('/notificacoes');
    return response.data;
  },

  markAsRead: async (id: string) => {
    const response = await api.patch(`/notificacoes/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.patch('/notificacoes/read-all');
    return response.data;
  },
};
