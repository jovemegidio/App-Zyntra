import type { Module } from '@/types';

// API Configuration — URL via variável de ambiente (nunca hardcoded)
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://aluforce.api.br/api';
export const API_TIMEOUT = 30000;

// Colors - Zyntra Design System (modo claro — espelha o login web)
export const Colors = {
  // Fundos
  bg: '#f3f5f9',
  surface: '#eaecf3',
  card: '#ffffff',
  card2: '#f0f2f7',
  // Bordas
  border: '#dbe0ea',
  borderLight: '#e8ecf3',
  // Primária — azul-marinho corporativo
  accent: '#19295e',
  accentDim: 'rgba(25,41,94,0.10)',
  accentGlow: 'rgba(25,41,94,0.06)',
  // Textos
  text: '#18213a',
  textSoft: '#344060',
  muted: '#60708c',
  mutedLight: '#8898b4',
  // Status
  green: '#16a34a',
  greenDim: 'rgba(22,163,74,0.12)',
  red: '#dc2626',
  redDim: 'rgba(220,38,38,0.10)',
  yellow: '#d97706',
  yellowDim: 'rgba(217,119,6,0.12)',
  purple: '#7c3aed',
  purpleDim: 'rgba(124,58,237,0.12)',
  teal: '#0d9488',
  tealDim: 'rgba(13,148,136,0.12)',
  orange: '#ea580c',
  orangeDim: 'rgba(234,88,12,0.12)',
} as const;

// Modules Configuration
export const MODULES: Module[] = [
  {
    id: 'financeiro',
    label: 'Financeiro',
    color: Colors.accent,
    dim: Colors.accentDim,
    description: 'Contas, DRE, Fluxo de Caixa',
    area: 'financeiro',
  },
  {
    id: 'vendas',
    label: 'Vendas',
    color: Colors.green,
    dim: Colors.greenDim,
    description: 'Pedidos, Funil, Metas',
    area: 'vendas',
  },
  {
    id: 'rh',
    label: 'RH',
    color: Colors.purple,
    dim: Colors.purpleDim,
    description: 'Colaboradores, Ponto',
    area: 'rh',
  },
  {
    id: 'pcp',
    label: 'PCP',
    color: Colors.yellow,
    dim: Colors.yellowDim,
    description: 'Ordens de Producao',
    area: 'pcp',
  },
  {
    id: 'logistica',
    label: 'Logistica',
    color: Colors.teal,
    dim: Colors.tealDim,
    description: 'Entregas, Rotas',
    area: 'logistica',
  },
  {
    id: 'faturamento',
    label: 'Faturamento',
    color: Colors.red,
    dim: Colors.redDim,
    description: 'NF-e, Faturas',
    area: 'nfe',
  },
  {
    id: 'compras',
    label: 'Compras',
    color: Colors.orange,
    dim: Colors.orangeDim,
    description: 'PC, Fornecedores',
    area: 'compras',
  },
];

// Status Colors Mapping
export const STATUS_COLORS = {
  aprovado: { color: Colors.green, bg: Colors.greenDim },
  analise: { color: Colors.yellow, bg: Colors.yellowDim },
  cancelado: { color: Colors.red, bg: Colors.redDim },
  entregue: { color: Colors.teal, bg: Colors.tealDim },
  vencendo: { color: Colors.yellow, bg: Colors.yellowDim },
  a_vencer: { color: Colors.green, bg: Colors.greenDim },
  vencida: { color: Colors.red, bg: Colors.redDim },
  paga: { color: Colors.green, bg: Colors.greenDim },
  presente: { color: Colors.green, bg: Colors.greenDim },
  ausente: { color: Colors.red, bg: Colors.redDim },
  ferias: { color: Colors.accent, bg: Colors.accentDim },
  rota: { color: Colors.teal, bg: Colors.tealDim },
  homeoffice: { color: Colors.accent, bg: Colors.accentDim },
  producao: { color: Colors.yellow, bg: Colors.yellowDim },
  concluida: { color: Colors.green, bg: Colors.greenDim },
  iniciando: { color: Colors.accent, bg: Colors.accentDim },
  aguardando: { color: Colors.muted, bg: Colors.surface },
  autorizada: { color: Colors.green, bg: Colors.greenDim },
  processando: { color: Colors.yellow, bg: Colors.yellowDim },
  rejeitada: { color: Colors.red, bg: Colors.redDim },
  aprovacao: { color: Colors.yellow, bg: Colors.yellowDim },
  recebido: { color: Colors.teal, bg: Colors.tealDim },
} as const;

// Logos das empresas (require estático para Metro bundler)
export const Logos = {
  aluforceAzul:  require('../assets/logos/aluforce-azul.png'),
  aluforceWhite: require('../assets/logos/aluforce-branco.png'),
  laborAzul:     require('../assets/logos/labor-azul.png'),
  laborWhite:    require('../assets/logos/labor-branco.png'),
  energyAzul:    require('../assets/logos/energy-azul.png'),
  energyWhite:   require('../assets/logos/energy-branco.png'),
};

// Configuração das empresas — espelha o JS do login web
export const COMPANIES = {
  aluforce: {
    id: 'aluforce',
    name: 'Aluforce',
    emailDomain: 'aluforce.ind.br',
    headline: 'Portal interno da Aluforce',
    logo: Logos.aluforceAzul,
  },
  labor: {
    id: 'labor',
    name: 'Grupo Labor',
    emailDomain: 'labor.com.br',
    headline: 'Portal interno do Grupo Labor',
    logo: Logos.laborAzul,
  },
};

// Converte caminho relativo de avatar (/avatars/Foo.webp) em URL absoluta
export function getAvatarUrl(path?: string | null): string | null {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  // Remove sufixo /api da base para servir arquivos estáticos
  const base = API_BASE_URL.replace(/\/api\/?$/, '');
  return `${base}${path}`;
}

// App Info
export const APP_VERSION = '1.0.0';
export const APP_NAME = 'Zyntra';
export const COMPANY_NAME = 'Aluforce';
