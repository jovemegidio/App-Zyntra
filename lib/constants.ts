import type { Module } from '@/types';

// API Configuration — URL via variável de ambiente (nunca hardcoded)
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://aluforce.api.br/api';
export const API_TIMEOUT = 30000;

// Colors - Zyntra Design System
export const Colors = {
  bg: '#090C14',
  surface: '#0F1520',
  card: '#131A28',
  card2: '#1A2236',
  border: '#1E2A42',
  borderLight: '#253350',
  accent: '#3B82F6',
  accentDim: 'rgba(59,130,246,0.18)',
  accentGlow: 'rgba(59,130,246,0.10)',
  text: '#EEF2FF',
  textSoft: '#B8C4DC',
  muted: '#5A6882',
  mutedLight: '#8898B4',
  green: '#22C55E',
  greenDim: 'rgba(34,197,94,0.15)',
  red: '#EF4444',
  redDim: 'rgba(239,68,68,0.15)',
  yellow: '#F59E0B',
  yellowDim: 'rgba(245,158,11,0.15)',
  purple: '#A855F7',
  purpleDim: 'rgba(168,85,247,0.15)',
  teal: '#14B8A6',
  tealDim: 'rgba(20,184,166,0.15)',
  orange: '#F97316',
  orangeDim: 'rgba(249,115,22,0.15)',
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

// App Info
export const APP_VERSION = '1.0.0';
export const APP_NAME = 'Zyntra';
export const COMPANY_NAME = 'Aluforce';
