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
  withCredentials: true,
});

// Token storage keys
const TOKEN_KEY = 'zyntra_auth_token';
const REFRESH_TOKEN_KEY = 'zyntra_refresh_token';
const DEVICE_ID_KEY = 'zyntra_device_id';
const USER_DATA_KEY = 'zyntra_user_data';

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

  async getDeviceId(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(DEVICE_ID_KEY);
    } catch {
      return null;
    }
  },

  async setDeviceId(deviceId: string): Promise<void> {
    await SecureStore.setItemAsync(DEVICE_ID_KEY, deviceId);
  },

  async getUserData(): Promise<any | null> {
    try {
      const data = await SecureStore.getItemAsync(USER_DATA_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  async setUserData(user: any): Promise<void> {
    await SecureStore.setItemAsync(USER_DATA_KEY, JSON.stringify(user));
  },

  async clearTokens(): Promise<void> {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_DATA_KEY);
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

// ============================================================
// AUTH API - /api/login, /api/logout, /api/me
// Based on routes/auth-rbac.js
// ============================================================
export const authApi = {
  /**
   * Login - POST /api/login
   * Body: { email, password }
   * Returns: { success, deviceId, user, redirectTo, forcePasswordChange }
   */
  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post('/login', credentials);
    
    if (response.data.success) {
      // Store user data and deviceId
      if (response.data.user) {
        await tokenStorage.setUserData(response.data.user);
      }
      if (response.data.deviceId) {
        await tokenStorage.setDeviceId(response.data.deviceId);
      }
      // The API uses cookies for auth, but also returns token in some cases
      if (response.data.token) {
        await tokenStorage.setToken(response.data.token);
      }
      if (response.data.refreshToken) {
        await tokenStorage.setRefreshToken(response.data.refreshToken);
      }
    }
    
    return response.data;
  },

  /**
   * Logout - POST /api/logout
   */
  logout: async () => {
    try {
      await api.post('/logout');
    } finally {
      await tokenStorage.clearTokens();
    }
  },

  /**
   * Get current user profile - GET /api/me
   */
  getProfile: async () => {
    const response = await api.get('/me');
    return response.data;
  },

  /**
   * Refresh token - POST /api/auth/refresh
   */
  refreshToken: async (refreshToken: string) => {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  /**
   * Request password reset - POST /api/recuperar-senha
   */
  requestPasswordReset: async (email: string) => {
    const response = await api.post('/recuperar-senha', { email });
    return response.data;
  },

  /**
   * Verify 2FA code - POST /api/2fa/verify
   */
  verify2FA: async (code: string, deviceId: string) => {
    const response = await api.post('/2fa/verify', { code, deviceId });
    return response.data;
  },
};

// ============================================================
// DASHBOARD API - /api/dashboard/*
// Based on routes/dashboard-api.js
// ============================================================
export const dashboardApi = {
  /**
   * Get executive KPIs - GET /api/dashboard/kpis
   * Returns: { vendas, pedidosAbertos, aReceber, ordensProducao }
   */
  getKPIs: async () => {
    const response = await api.get('/dashboard/kpis');
    return response.data;
  },

  /**
   * Get alerts - GET /api/dashboard/alertas
   */
  getAlertas: async () => {
    const response = await api.get('/dashboard/alertas');
    return response.data;
  },

  /**
   * Get recent activities - GET /api/dashboard/atividades
   */
  getAtividades: async (limit = 10) => {
    const response = await api.get('/dashboard/atividades', { params: { limit } });
    return response.data;
  },

  /**
   * Get chart data - GET /api/dashboard/charts
   */
  getCharts: async (periodo = 'mes') => {
    const response = await api.get('/dashboard/charts', { params: { periodo } });
    return response.data;
  },
};

// ============================================================
// FINANCEIRO API - /api/financeiro/*
// Based on routes/financeiro-routes.js
// ============================================================
export const financeiroApi = {
  /**
   * Dashboard financeiro - GET /api/financeiro/dashboard
   * Returns: { faturamento_total, contas_receber, contas_pagar, saldo_total }
   */
  getDashboard: async () => {
    const response = await api.get('/financeiro/dashboard');
    return response.data;
  },

  /**
   * Fluxo de caixa - GET /api/financeiro/fluxo-caixa
   */
  getFluxoCaixa: async (params?: { dataInicio?: string; dataFim?: string }) => {
    const response = await api.get('/financeiro/fluxo-caixa', { params });
    return response.data;
  },

  /**
   * Contas a receber - GET /api/financeiro/contas-receber
   */
  getContasReceber: async (params?: { status?: string; busca?: string }) => {
    const response = await api.get('/financeiro/contas-receber', { params });
    return response.data;
  },

  /**
   * Contas a pagar - GET /api/financeiro/contas-pagar
   */
  getContasPagar: async (params?: { status?: string; busca?: string }) => {
    const response = await api.get('/financeiro/contas-pagar', { params });
    return response.data;
  },

  /**
   * DRE - GET /api/financeiro/dre
   */
  getDRE: async (params?: { mes?: number; ano?: number }) => {
    const response = await api.get('/financeiro/dre', { params });
    return response.data;
  },

  /**
   * Conciliação bancária - GET /api/financeiro/conciliacao
   */
  getConciliacao: async () => {
    const response = await api.get('/financeiro/conciliacao');
    return response.data;
  },
};

// ============================================================
// VENDAS/CRM API - /api/vendas/*
// Based on routes/vendas-routes.js
// ============================================================
export const vendasApi = {
  /**
   * Listar pedidos - GET /api/vendas/pedidos
   */
  getPedidos: async (params?: { 
    busca?: string; 
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get('/vendas/pedidos', { params });
    return response.data;
  },

  /**
   * Detalhes do pedido - GET /api/vendas/pedidos/:id
   */
  getPedido: async (id: number) => {
    const response = await api.get(`/vendas/pedidos/${id}`);
    return response.data;
  },

  /**
   * Funil de vendas - GET /api/vendas/funil
   */
  getFunil: async () => {
    const response = await api.get('/vendas/funil');
    return response.data;
  },

  /**
   * Metas de vendas - GET /api/vendas/metas
   */
  getMetas: async () => {
    const response = await api.get('/vendas/metas');
    return response.data;
  },

  /**
   * Clientes - GET /api/clientes
   */
  getClientes: async (params?: { busca?: string; page?: number }) => {
    const response = await api.get('/clientes', { params });
    return response.data;
  },

  /**
   * Cliente por ID - GET /api/clientes/:id
   */
  getCliente: async (id: number) => {
    const response = await api.get(`/clientes/${id}`);
    return response.data;
  },
};

// ============================================================
// RH API - /api/rh/*
// Based on routes/rh-routes.js
// ============================================================
export const rhApi = {
  /**
   * Dados do usuário logado - GET /api/rh/me
   */
  getMe: async () => {
    const response = await api.get('/rh/me');
    return response.data;
  },

  /**
   * Listar funcionários - GET /api/rh/funcionarios
   */
  getFuncionarios: async (params?: { busca?: string; setor?: string }) => {
    const response = await api.get('/rh/funcionarios', { params });
    return response.data;
  },

  /**
   * Funcionário por ID - GET /api/rh/funcionarios/:id
   */
  getFuncionario: async (id: number) => {
    const response = await api.get(`/rh/funcionarios/${id}`);
    return response.data;
  },

  /**
   * Aniversariantes do mês - GET /api/rh/funcionarios/aniversariantes
   */
  getAniversariantes: async () => {
    const response = await api.get('/rh/funcionarios/aniversariantes');
    return response.data;
  },

  /**
   * Meu último holerite - GET /api/rh/holerites/meu-ultimo
   */
  getMeuUltimoHolerite: async () => {
    const response = await api.get('/rh/holerites/meu-ultimo');
    return response.data;
  },

  /**
   * Minhas férias - GET /api/rh/ferias/minhas
   */
  getMinhasFerias: async () => {
    const response = await api.get('/rh/ferias/minhas');
    return response.data;
  },

  /**
   * Saldo de férias - GET /api/rh/ferias/saldo/:funcionarioId
   */
  getSaldoFerias: async (funcionarioId: number) => {
    const response = await api.get(`/rh/ferias/saldo/${funcionarioId}`);
    return response.data;
  },

  /**
   * Registrar ponto - POST /api/rh/ponto
   */
  registrarPonto: async (tipo: 'entrada' | 'saida' | 'almoco_saida' | 'almoco_retorno') => {
    const response = await api.post('/rh/ponto', { tipo });
    return response.data;
  },

  /**
   * Meu ponto hoje - GET /api/rh/ponto/hoje
   */
  getPontoHoje: async () => {
    const response = await api.get('/rh/ponto/hoje');
    return response.data;
  },
};

// ============================================================
// PCP API - /api/pcp/*
// Based on routes/pcp-routes.js
// ============================================================
export const pcpApi = {
  /**
   * Dashboard PCP - GET /api/pcp/dashboard
   */
  getDashboard: async () => {
    const response = await api.get('/pcp/dashboard');
    return response.data;
  },

  /**
   * Ordens de produção - GET /api/pcp/ordens
   */
  getOrdens: async (params?: { status?: string; busca?: string }) => {
    const response = await api.get('/pcp/ordens', { params });
    return response.data;
  },

  /**
   * Ordem por ID - GET /api/pcp/ordens/:id
   */
  getOrdem: async (id: number) => {
    const response = await api.get(`/pcp/ordens/${id}`);
    return response.data;
  },

  /**
   * Eficiência - GET /api/pcp/eficiencia
   */
  getEficiencia: async () => {
    const response = await api.get('/pcp/eficiencia');
    return response.data;
  },

  /**
   * Setores - GET /api/pcp/setores
   */
  getSetores: async () => {
    const response = await api.get('/pcp/setores');
    return response.data;
  },
};

// ============================================================
// LOGISTICA API - /api/logistica/*
// Based on routes/logistica-routes.js
// ============================================================
export const logisticaApi = {
  /**
   * Dashboard logística - GET /api/logistica/dashboard
   */
  getDashboard: async () => {
    const response = await api.get('/logistica/dashboard');
    return response.data;
  },

  /**
   * Entregas - GET /api/logistica/entregas
   */
  getEntregas: async (params?: { status?: string; data?: string }) => {
    const response = await api.get('/logistica/entregas', { params });
    return response.data;
  },

  /**
   * Rotas - GET /api/logistica/rotas
   */
  getRotas: async () => {
    const response = await api.get('/logistica/rotas');
    return response.data;
  },

  /**
   * Veículos - GET /api/logistica/veiculos
   */
  getVeiculos: async () => {
    const response = await api.get('/logistica/veiculos');
    return response.data;
  },
};

// ============================================================
// FATURAMENTO/NF-e API - /api/nfe/*
// Based on routes/nfe-routes.js
// ============================================================
export const faturamentoApi = {
  /**
   * Listar notas fiscais - GET /api/nfe/notas
   */
  getNotas: async (params?: { status?: string; busca?: string; page?: number }) => {
    const response = await api.get('/nfe/notas', { params });
    return response.data;
  },

  /**
   * Nota por ID - GET /api/nfe/notas/:id
   */
  getNota: async (id: number) => {
    const response = await api.get(`/nfe/notas/${id}`);
    return response.data;
  },

  /**
   * Resumo de faturamento - GET /api/nfe/resumo
   */
  getResumo: async (params?: { mes?: number; ano?: number }) => {
    const response = await api.get('/nfe/resumo', { params });
    return response.data;
  },

  /**
   * DANFE (PDF) - GET /api/nfe/danfe/:id
   */
  getDanfe: async (id: number) => {
    const response = await api.get(`/nfe/danfe/${id}`, { responseType: 'blob' });
    return response.data;
  },
};

// ============================================================
// COMPRAS API - /api/compras/*
// Based on routes/compras-routes.js
// ============================================================
export const comprasApi = {
  /**
   * Dashboard compras - GET /api/compras/dashboard
   */
  getDashboard: async () => {
    const response = await api.get('/compras/dashboard');
    return response.data;
  },

  /**
   * Pedidos de compra - GET /api/compras/pedidos
   */
  getPedidos: async (params?: { status?: string; busca?: string }) => {
    const response = await api.get('/compras/pedidos', { params });
    return response.data;
  },

  /**
   * Pedido por ID - GET /api/compras/pedidos/:id
   */
  getPedido: async (id: number) => {
    const response = await api.get(`/compras/pedidos/${id}`);
    return response.data;
  },

  /**
   * Fornecedores - GET /api/fornecedores
   */
  getFornecedores: async (params?: { busca?: string }) => {
    const response = await api.get('/fornecedores', { params });
    return response.data;
  },

  /**
   * Fornecedor por ID - GET /api/fornecedores/:id
   */
  getFornecedor: async (id: number) => {
    const response = await api.get(`/fornecedores/${id}`);
    return response.data;
  },
};

// ============================================================
// NOTIFICACOES API - /api/notificacoes/*
// ============================================================
export const notificacoesApi = {
  /**
   * Listar notificações - GET /api/notificacoes
   */
  getAll: async (params?: { page?: number; limit?: number }) => {
    const response = await api.get('/notificacoes', { params });
    return response.data;
  },

  /**
   * Não lidas - GET /api/notificacoes/nao-lidas
   */
  getNaoLidas: async () => {
    const response = await api.get('/notificacoes/nao-lidas');
    return response.data;
  },

  /**
   * Marcar como lida - PATCH /api/notificacoes/:id/lida
   */
  markAsRead: async (id: number) => {
    const response = await api.patch(`/notificacoes/${id}/lida`);
    return response.data;
  },

  /**
   * Marcar todas como lidas - PATCH /api/notificacoes/marcar-todas-lidas
   */
  markAllAsRead: async () => {
    const response = await api.patch('/notificacoes/marcar-todas-lidas');
    return response.data;
  },
};

// ============================================================
// PRODUTOS API - /api/produtos/*
// ============================================================
export const produtosApi = {
  /**
   * Listar produtos - GET /api/produtos
   */
  getAll: async (params?: { busca?: string; categoria?: string; page?: number }) => {
    const response = await api.get('/produtos', { params });
    return response.data;
  },

  /**
   * Produto por ID - GET /api/produtos/:id
   */
  get: async (id: number) => {
    const response = await api.get(`/produtos/${id}`);
    return response.data;
  },

  /**
   * Estoque - GET /api/produtos/:id/estoque
   */
  getEstoque: async (id: number) => {
    const response = await api.get(`/produtos/${id}/estoque`);
    return response.data;
  },
};
