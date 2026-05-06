// User and Auth Types
export interface User {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  empresa: string;
  avatar?: string;
  permissoes: string[];
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email?: string;
  cpf?: string;
  senha: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// Module Types
export interface Module {
  id: string;
  label: string;
  color: string;
  dim: string;
  description: string;
}

// KPI Types
export interface KPI {
  title: string;
  value: string;
  change?: string;
  up?: boolean;
  color: string;
  spark?: number[];
  sub?: string;
}

// Notification Types
export interface Notification {
  id: string;
  titulo: string;
  msg: string;
  tempo: string;
  modulo: string;
  moduloColor: string;
  unread: boolean;
  createdAt: Date;
}

// Financial Types
export interface ContaReceber {
  id: string;
  cliente: string;
  vencimento: string;
  valor: string;
  status: 'vencendo' | 'a_vencer' | 'vencida' | 'paga';
}

export interface DREItem {
  label: string;
  value: string;
  type: 'receita' | 'despesa' | 'resultado';
}

// Sales Types
export interface Pedido {
  id: string;
  numero: string;
  cliente: string;
  valor: string;
  status: 'aprovado' | 'analise' | 'cancelado' | 'entregue';
  data: string;
}

export interface FunilEtapa {
  label: string;
  value: number;
  color: string;
}

// HR Types
export interface Colaborador {
  id: string;
  nome: string;
  cargo: string;
  departamento: string;
  status: 'presente' | 'ausente' | 'ferias' | 'rota' | 'homeoffice';
}

// PCP Types
export interface OrdemProducao {
  id: string;
  codigo: string;
  produto: string;
  quantidade: string;
  progresso: number;
  status: 'producao' | 'concluida' | 'iniciando' | 'aguardando';
}

// Logistics Types
export interface Entrega {
  id: string;
  codigo: string;
  destino: string;
  transportadora: string;
  status: 'concluida' | 'rota' | 'aguardando';
}

// Billing Types
export interface NotaFiscal {
  id: string;
  numero: string;
  destinatario: string;
  valor: string;
  status: 'autorizada' | 'processando' | 'rejeitada';
}

// Purchases Types
export interface PedidoCompra {
  id: string;
  codigo: string;
  fornecedor: string;
  valor: string;
  status: 'aprovacao' | 'aprovado' | 'recebido' | 'cancelado';
}

// Activity Types
export interface Atividade {
  id: string;
  msg: string;
  time: string;
  dotColor: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
