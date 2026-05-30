import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { financeiroApi } from '@/lib/api';
import { Colors } from '@/lib/constants';
import { Card, SectionLabel, ScreenHeader, StatusPill, IconPlus } from '@/components/ui';
import type { ContaReceber, ContaPagar, FinanceiroDashboard } from '@/types';

function fmtCurrency(value?: number | null) {
  if (value == null) return 'R$ --';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function fmtDate(dateStr?: string | null) {
  if (!dateStr) return '--';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-BR');
  } catch {
    return dateStr;
  }
}

function statusContaReceber(status?: string): { label: string; color: string; bg: string } {
  switch (status) {
    case 'pago':
    case 'liquidada':
    case 'recebida':
      return { label: 'Paga', color: Colors.green, bg: Colors.greenDim };
    case 'vencida':
    case 'vencido':
      return { label: 'Vencida', color: Colors.red, bg: Colors.redDim };
    case 'a_vencer':
      return { label: 'A Vencer', color: Colors.green, bg: Colors.greenDim };
    default:
      return { label: 'Pendente', color: Colors.yellow, bg: Colors.yellowDim };
  }
}

export default function FinanceiroScreen() {
  const {
    data: dashboard,
    isLoading: dashLoading,
    isError: dashError,
    refetch: refetchDash,
    isRefetching: dashRefetching,
  } = useQuery<FinanceiroDashboard>({
    queryKey: ['financeiro', 'dashboard'],
    queryFn: () => financeiroApi.getDashboard(),
    retry: 1,
  });

  const {
    data: contasReceber,
    isLoading: crLoading,
    refetch: refetchCR,
  } = useQuery<ContaReceber[]>({
    queryKey: ['financeiro', 'contas-receber'],
    queryFn: async () => {
      const res = await financeiroApi.getContasReceber({ status: 'pendente' });
      return Array.isArray(res) ? res : res?.data ?? [];
    },
    retry: 1,
  });

  const {
    data: contasPagar,
    isLoading: cpLoading,
    refetch: refetchCP,
  } = useQuery<ContaPagar[]>({
    queryKey: ['financeiro', 'contas-pagar'],
    queryFn: async () => {
      const res = await financeiroApi.getContasPagar({ status: 'pendente' });
      return Array.isArray(res) ? res : res?.data ?? [];
    },
    retry: 1,
  });

  const isRefreshing = dashRefetching;

  const handleRefresh = () => {
    refetchDash();
    refetchCR();
    refetchCP();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }} edges={['top']}>
      <ScreenHeader
        title="Financeiro"
        onBack={() => router.back()}
        right={
          <TouchableOpacity>
            <IconPlus size={18} color={Colors.accent} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 14, paddingTop: 8, gap: 14 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.accent}
            colors={[Colors.accent]}
          />
        }
      >
        {/* Saldo cards */}
        {dashLoading ? (
          <View style={{ height: 80, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator color={Colors.accent} />
          </View>
        ) : dashError ? (
          <Card style={{ padding: 16, alignItems: 'center' }}>
            <Text style={{ color: Colors.red, fontSize: 13 }}>Falha ao carregar resumo financeiro</Text>
            <TouchableOpacity onPress={() => refetchDash()} style={{ marginTop: 8 }}>
              <Text style={{ color: Colors.accent, fontSize: 12 }}>Tentar novamente</Text>
            </TouchableOpacity>
          </Card>
        ) : (
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {[
              { label: 'Saldo', value: fmtCurrency(dashboard?.saldo_total), color: Colors.text },
              { label: 'A Receber', value: fmtCurrency(dashboard?.contas_receber), color: Colors.green },
              { label: 'A Pagar', value: fmtCurrency(dashboard?.contas_pagar), color: Colors.red },
            ].map((c, i) => (
              <Card key={i} style={{ flex: 1, padding: 12, alignItems: 'center' }}>
                <Text style={{ fontSize: 9.5, color: Colors.muted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 5 }}>
                  {c.label}
                </Text>
                <Text style={{ fontSize: 12, fontWeight: '700', color: c.color }}>{c.value}</Text>
              </Card>
            ))}
          </View>
        )}

        {/* Contas a Receber */}
        <View>
          <SectionLabel text="Contas a Receber" />
          {crLoading ? (
            <View style={{ height: 80, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator color={Colors.accent} size="small" />
            </View>
          ) : !contasReceber || contasReceber.length === 0 ? (
            <Card style={{ padding: 16, alignItems: 'center' }}>
              <Text style={{ fontSize: 13, color: Colors.muted }}>Nenhuma conta a receber pendente</Text>
            </Card>
          ) : (
            <Card style={{ padding: 0, overflow: 'hidden' }}>
              {contasReceber.slice(0, 6).map((r, i) => {
                const st = statusContaReceber(r.status);
                return (
                  <View
                    key={r.id ?? i}
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: 12,
                      paddingHorizontal: 14,
                      borderBottomWidth: i < Math.min(contasReceber.length, 6) - 1 ? 1 : 0,
                      borderBottomColor: Colors.border,
                    }}
                  >
                    <View>
                      <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.text }} numberOfLines={1}>
                        {r.cliente_nome ?? r.descricao ?? `ID ${r.id}`}
                      </Text>
                      <Text style={{ fontSize: 11, color: Colors.muted, marginTop: 2 }}>
                        Venc: {fmtDate(r.data_vencimento)}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 4 }}>
                      <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.text }}>
                        {fmtCurrency(r.valor)}
                      </Text>
                      <StatusPill label={st.label} color={st.color} bg={st.bg} />
                    </View>
                  </View>
                );
              })}
            </Card>
          )}
        </View>

        {/* Contas a Pagar */}
        <View>
          <SectionLabel text="Contas a Pagar" />
          {cpLoading ? (
            <View style={{ height: 80, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator color={Colors.accent} size="small" />
            </View>
          ) : !contasPagar || contasPagar.length === 0 ? (
            <Card style={{ padding: 16, alignItems: 'center' }}>
              <Text style={{ fontSize: 13, color: Colors.muted }}>Nenhuma conta a pagar pendente</Text>
            </Card>
          ) : (
            <Card style={{ padding: 0, overflow: 'hidden' }}>
              {contasPagar.slice(0, 6).map((r, i) => {
                const st = statusContaReceber(r.status);
                return (
                  <View
                    key={r.id ?? i}
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: 12,
                      paddingHorizontal: 14,
                      borderBottomWidth: i < Math.min(contasPagar.length, 6) - 1 ? 1 : 0,
                      borderBottomColor: Colors.border,
                    }}
                  >
                    <View>
                      <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.text }} numberOfLines={1}>
                        {r.fornecedor_nome ?? r.descricao ?? `ID ${r.id}`}
                      </Text>
                      <Text style={{ fontSize: 11, color: Colors.muted, marginTop: 2 }}>
                        Venc: {fmtDate(r.data_vencimento)}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 4 }}>
                      <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.text }}>
                        {fmtCurrency(r.valor)}
                      </Text>
                      <StatusPill label={st.label} color={st.color} bg={st.bg} />
                    </View>
                  </View>
                );
              })}
            </Card>
          )}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
