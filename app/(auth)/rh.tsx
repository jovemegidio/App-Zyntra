import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Alert, Linking } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rhApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Colors } from '@/lib/constants';
import {
  Card,
  SectionLabel,
  ScreenHeader,
  StatusPill,
  Badge,
  IconPlus,
  IconClock,
  IconDocument,
} from '@/components/ui';
import type { Funcionario, RegistroPonto, Holerite } from '@/types';

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
}

function statusFuncionario(status?: string): { label: string; color: string; bg: string } {
  switch (status) {
    case 'ativo':
      return { label: 'Presente', color: Colors.green, bg: Colors.greenDim };
    case 'ferias':
      return { label: 'Ferias', color: Colors.accent, bg: Colors.accentDim };
    case 'afastado':
      return { label: 'Afastado', color: Colors.orange, bg: Colors.orangeDim };
    case 'inativo':
      return { label: 'Inativo', color: Colors.red, bg: Colors.redDim };
    default:
      return { label: status ?? 'Ativo', color: Colors.green, bg: Colors.greenDim };
  }
}

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function fmtMoeda(v?: number) {
  if (v == null) return '--';
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// ── Espelho de ponto pessoal ──────────────────────────────────
const PONTO_MARCACOES: { campo: keyof RegistroPonto; label: string; tipo: 'entrada' | 'almoco_saida' | 'almoco_retorno' | 'saida' }[] = [
  { campo: 'entrada', label: 'Entrada', tipo: 'entrada' },
  { campo: 'almoco_saida', label: 'Saida almoco', tipo: 'almoco_saida' },
  { campo: 'almoco_retorno', label: 'Retorno almoco', tipo: 'almoco_retorno' },
  { campo: 'saida', label: 'Saida', tipo: 'saida' },
];

function MeuPonto() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['rh', 'ponto', 'hoje'],
    queryFn: () => rhApi.getPontoHoje(),
    retry: 1,
  });

  const registro: RegistroPonto | undefined = (data as any)?.data ?? (data as any) ?? undefined;

  const mutation = useMutation({
    mutationFn: (tipo: 'entrada' | 'saida' | 'almoco_saida' | 'almoco_retorno') => rhApi.registrarPonto(tipo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rh', 'ponto', 'hoje'] });
    },
    onError: () => Alert.alert('Ponto', 'Nao foi possivel registrar o ponto. Tente novamente.'),
  });

  // Próxima marcação pendente
  const proxima = PONTO_MARCACOES.find((m) => !registro?.[m.campo]);

  return (
    <View>
      <SectionLabel text="Meu Espelho de Ponto — Hoje" />
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {isLoading ? (
          <View style={{ height: 90, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator color={Colors.accent} size="small" />
          </View>
        ) : isError ? (
          <View style={{ padding: 16, alignItems: 'center' }}>
            <Text style={{ color: Colors.red, fontSize: 13 }}>Falha ao carregar seu ponto</Text>
            <TouchableOpacity onPress={() => refetch()} style={{ marginTop: 8 }}>
              <Text style={{ color: Colors.accent, fontSize: 12 }}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {PONTO_MARCACOES.map((m, i) => {
              const valor = registro?.[m.campo] as string | undefined;
              return (
                <View
                  key={m.campo}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 12,
                    paddingHorizontal: 14,
                    borderBottomWidth: 1,
                    borderBottomColor: Colors.border,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
                    <IconClock size={16} color={valor ? Colors.green : Colors.muted} />
                    <Text style={{ fontSize: 13, color: Colors.textSoft }}>{m.label}</Text>
                  </View>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: valor ? Colors.text : Colors.muted }}>
                    {valor ?? '--:--'}
                  </Text>
                </View>
              );
            })}

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, paddingHorizontal: 14 }}>
              <Text style={{ fontSize: 12, color: Colors.muted }}>
                Total: <Text style={{ color: Colors.text, fontWeight: '700' }}>{registro?.total_horas ?? '00:00'}</Text>
              </Text>
              {proxima ? (
                <TouchableOpacity
                  onPress={() => mutation.mutate(proxima.tipo)}
                  disabled={mutation.isPending}
                  activeOpacity={0.8}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    backgroundColor: Colors.accent,
                    paddingVertical: 8,
                    paddingHorizontal: 14,
                    borderRadius: 9,
                    opacity: mutation.isPending ? 0.6 : 1,
                  }}
                >
                  {mutation.isPending ? (
                    <ActivityIndicator color={Colors.bg} size="small" />
                  ) : (
                    <IconClock size={15} color={Colors.bg} />
                  )}
                  <Text style={{ fontSize: 12.5, fontWeight: '700', color: Colors.bg }}>
                    Bater {proxima.label.toLowerCase()}
                  </Text>
                </TouchableOpacity>
              ) : (
                <StatusPill label="Jornada completa" color={Colors.green} bg={Colors.greenDim} />
              )}
            </View>
          </>
        )}
      </Card>
    </View>
  );
}

// ── Holerite pessoal ──────────────────────────────────────────
function MeuHolerite() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['rh', 'holerite', 'meu-ultimo'],
    queryFn: () => rhApi.getMeuUltimoHolerite(),
    retry: 1,
  });

  const holerite: Holerite | undefined = (data as any)?.data ?? (data as any) ?? undefined;

  const abrirArquivo = () => {
    if (holerite?.arquivo_url) {
      Linking.openURL(holerite.arquivo_url).catch(() =>
        Alert.alert('Holerite', 'Nao foi possivel abrir o arquivo.'),
      );
    } else {
      Alert.alert('Holerite', 'Arquivo do holerite indisponivel.');
    }
  };

  return (
    <View>
      <SectionLabel text="Meu Holerite" />
      {isLoading ? (
        <Card style={{ height: 90, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator color={Colors.accent} size="small" />
        </Card>
      ) : isError ? (
        <Card style={{ padding: 16, alignItems: 'center' }}>
          <Text style={{ color: Colors.red, fontSize: 13 }}>Falha ao carregar holerite</Text>
          <TouchableOpacity onPress={() => refetch()} style={{ marginTop: 8 }}>
            <Text style={{ color: Colors.accent, fontSize: 12 }}>Tentar novamente</Text>
          </TouchableOpacity>
        </Card>
      ) : !holerite ? (
        <Card style={{ padding: 16, alignItems: 'center' }}>
          <Text style={{ fontSize: 13, color: Colors.muted }}>Nenhum holerite disponivel</Text>
        </Card>
      ) : (
        <Card style={{ padding: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
              <View style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: Colors.accentDim, alignItems: 'center', justifyContent: 'center' }}>
                <IconDocument size={17} color={Colors.accent} />
              </View>
              <View>
                <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.text }}>
                  {MESES[(holerite.mes ?? 1) - 1] ?? holerite.mes}/{holerite.ano}
                </Text>
                <Text style={{ fontSize: 11, color: Colors.muted }}>Competencia</Text>
              </View>
            </View>
            <Badge label="Disponivel" color={Colors.green} bg={Colors.greenDim} />
          </View>

          <View style={{ gap: 8 }}>
            {[
              { label: 'Salario bruto', value: fmtMoeda(holerite.salario_bruto), color: Colors.text },
              { label: 'Descontos', value: `- ${fmtMoeda(holerite.descontos)}`, color: Colors.red },
            ].map((r) => (
              <View key={r.label} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 12.5, color: Colors.muted }}>{r.label}</Text>
                <Text style={{ fontSize: 12.5, color: r.color, fontWeight: '500' }}>{r.value}</Text>
              </View>
            ))}
            <View style={{ height: 1, backgroundColor: Colors.border, marginVertical: 2 }} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 13, color: Colors.textSoft, fontWeight: '600' }}>Liquido a receber</Text>
              <Text style={{ fontSize: 17, color: Colors.green, fontWeight: '800' }}>{fmtMoeda(holerite.salario_liquido)}</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={abrirArquivo}
            activeOpacity={0.8}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 7,
              marginTop: 14,
              paddingVertical: 11,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: Colors.border,
              backgroundColor: Colors.surface,
            }}
          >
            <IconDocument size={16} color={Colors.accent} />
            <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.accent }}>Ver demonstrativo completo</Text>
          </TouchableOpacity>
        </Card>
      )}
    </View>
  );
}

export default function RHScreen() {
  const { user } = useAuth();
  const isAdmin = !!user?.is_admin || user?.role === 'admin' || user?.role === 'gestor';

  const {
    data: funcionariosRaw,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery<Funcionario[]>({
    queryKey: ['rh', 'funcionarios'],
    queryFn: async () => {
      const res = await rhApi.getFuncionarios();
      return Array.isArray(res) ? res : res?.data ?? [];
    },
    retry: 1,
    enabled: isAdmin,
  });

  const {
    data: aniversariantesRaw,
    isLoading: aniLoading,
    refetch: refetchAni,
  } = useQuery({
    queryKey: ['rh', 'aniversariantes'],
    queryFn: async () => {
      const res = await rhApi.getAniversariantes();
      return Array.isArray(res) ? res : res?.data ?? [];
    },
    retry: 1,
    enabled: isAdmin,
  });

  const funcionarios: Funcionario[] = funcionariosRaw ?? [];
  const aniversariantes = Array.isArray(aniversariantesRaw) ? aniversariantesRaw : [];

  const ativos = funcionarios.filter((f) => f.status === 'ativo').length;
  const ferias = funcionarios.filter((f) => f.status === 'ferias').length;
  const ausentes = funcionarios.filter((f) => f.status === 'inativo' || f.status === 'afastado').length;

  const handleRefresh = () => {
    refetch();
    refetchAni();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }} edges={['top']}>
      <ScreenHeader
        title="Recursos Humanos"
        onBack={() => router.back()}
        right={
          isAdmin ? (
            <TouchableOpacity>
              <IconPlus size={18} color={Colors.accent} />
            </TouchableOpacity>
          ) : undefined
        }
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 14, paddingTop: 8, gap: 14 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            tintColor={Colors.accent}
            colors={[Colors.accent]}
          />
        }
      >
        {/* ── Área pessoal (visível para todos) ── */}
        <MeuPonto />
        <MeuHolerite />

        {/* ── Área gerencial (somente admins/gestores) ── */}
        {isAdmin && (
          <>
            {/* KPIs */}
            {isLoading ? (
              <View style={{ height: 80, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator color={Colors.accent} />
              </View>
            ) : (
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {[
                  { label: 'Total', value: String(funcionarios.length), color: Colors.text },
                  { label: 'Ativos', value: String(ativos), color: Colors.green },
                  { label: 'Outros', value: String(ferias + ausentes), color: Colors.yellow },
                ].map((c, i) => (
                  <Card key={i} style={{ flex: 1, padding: 12, alignItems: 'center' }}>
                    <Text style={{ fontSize: 9.5, color: Colors.muted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                      {c.label}
                    </Text>
                    <Text style={{ fontSize: 20, fontWeight: '700', color: c.color }}>{c.value}</Text>
                  </Card>
                ))}
              </View>
            )}

            {/* Colaboradores */}
            <View>
              <SectionLabel text="Colaboradores" />
              {isLoading ? (
                <View style={{ height: 80, justifyContent: 'center', alignItems: 'center' }}>
                  <ActivityIndicator color={Colors.accent} size="small" />
                </View>
              ) : isError ? (
                <Card style={{ padding: 16, alignItems: 'center' }}>
                  <Text style={{ color: Colors.red, fontSize: 13 }}>Falha ao carregar colaboradores</Text>
                  <TouchableOpacity onPress={() => refetch()} style={{ marginTop: 8 }}>
                    <Text style={{ color: Colors.accent, fontSize: 12 }}>Tentar novamente</Text>
                  </TouchableOpacity>
                </Card>
              ) : funcionarios.length === 0 ? (
                <Card style={{ padding: 16, alignItems: 'center' }}>
                  <Text style={{ fontSize: 13, color: Colors.muted }}>Nenhum colaborador encontrado</Text>
                </Card>
              ) : (
                <Card style={{ padding: 0, overflow: 'hidden' }}>
                  {funcionarios.slice(0, 10).map((c, i) => {
                    const st = statusFuncionario(c.status);
                    return (
                      <View
                        key={c.id}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 10,
                          padding: 11,
                          paddingHorizontal: 14,
                          borderBottomWidth: i < Math.min(funcionarios.length, 10) - 1 ? 1 : 0,
                          borderBottomColor: Colors.border,
                        }}
                      >
                        <View
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            backgroundColor: Colors.card2,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.accent }}>
                            {getInitials(c.nome)}
                          </Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.text }} numberOfLines={1}>
                            {c.nome}
                          </Text>
                          <Text style={{ fontSize: 11, color: Colors.muted }}>
                            {c.cargo ?? 'Colaborador'}{c.setor ? ` · ${c.setor}` : ''}
                          </Text>
                        </View>
                        <StatusPill label={st.label} color={st.color} bg={st.bg} />
                      </View>
                    );
                  })}
                </Card>
              )}
            </View>

            {/* Aniversariantes */}
            {!aniLoading && aniversariantes.length > 0 && (
              <View>
                <SectionLabel text="Aniversarios do Mes" />
                <Card style={{ padding: 0, overflow: 'hidden' }}>
                  {aniversariantes.map((a: any, i: number) => (
                    <View
                      key={i}
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: 11,
                        paddingHorizontal: 14,
                        borderBottomWidth: i < aniversariantes.length - 1 ? 1 : 0,
                        borderBottomColor: Colors.border,
                      }}
                    >
                      <View>
                        <Text style={{ fontSize: 13, color: Colors.text, fontWeight: '500' }}>
                          {a.nome}
                        </Text>
                        <Text style={{ fontSize: 11, color: Colors.muted }}>{a.setor ?? a.cargo}</Text>
                      </View>
                      <Badge
                        label={a.data_nascimento
                          ? new Date(a.data_nascimento).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
                          : ''}
                        color={Colors.purple}
                        bg={Colors.purpleDim}
                      />
                    </View>
                  ))}
                </Card>
              </View>
            )}
          </>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
