import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  RefreshControl, ActivityIndicator, Alert, Modal, FlatList,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pcpApi } from '@/lib/api';
import { Colors } from '@/lib/constants';
import { Card, SectionLabel, ScreenHeader, StatusPill, KPICard } from '@/components/ui';
import Svg, { Path, Circle } from 'react-native-svg';

// ─── tipos ────────────────────────────────────────────────────
interface OrdemProducao {
  id: number;
  codigo?: string;
  produto_nome?: string;
  quantidade?: number;
  unidade?: string;
  status?: string;
  prioridade?: string;
  data_prevista?: string;
  progresso?: number;
  responsavel?: string;
}

interface Apontamento {
  id: number;
  tipo_atividade: string;
  nome_atividade: string;
  operador?: string;
  hora_inicio?: string;
  hora_fim?: string;
  duracao_segundos?: number;
  quantidade_produzida?: number;
  quantidade_refugo?: number;
  ordem_producao_id?: number;
  produto_descricao?: string;
  maquina?: string;
  turno?: string;
  observacoes?: string;
  created_at?: string;
}

// ─── utils ────────────────────────────────────────────────────
function fmtDuracao(seg: number) {
  const h = Math.floor(seg / 3600);
  const m = Math.floor((seg % 3600) / 60);
  const s = seg % 60;
  if (h > 0) return `${h}h ${m.toString().padStart(2, '0')}min`;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function fmtHora(iso?: string) {
  if (!iso) return '--:--';
  try { return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }); }
  catch { return '--:--'; }
}

function statusOP(s?: string): { label: string; color: string; bg: string } {
  const l = (s ?? '').toLowerCase();
  if (l.includes('conclu') || l.includes('finaliz')) return { label: 'Concluída', color: Colors.green, bg: Colors.greenDim };
  if (l.includes('em_prod') || l.includes('producao') || l.includes('ativa'))
    return { label: 'Em Produção', color: Colors.yellow, bg: Colors.yellowDim };
  if (l.includes('cancel')) return { label: 'Cancelada', color: Colors.red, bg: Colors.redDim };
  return { label: s ?? 'Pendente', color: Colors.muted, bg: Colors.surface };
}

// ─── ícones ──────────────────────────────────────────────────
function IconPlay({ size = 20, color = '#fff' }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}><Path d="M5 3l14 9-14 9V3z" /></Svg>;
}
function IconStop({ size = 20, color = '#fff' }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}><Path d="M5 5h14v14H5z" /></Svg>;
}
function IconCheck({ size = 18, color = '#fff' }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M20 6L9 17l-5-5" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></Svg>;
}
function IconClock({ size = 16, color = '#60708c' }: { size?: number; color?: string }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8" /><Path d="M12 7v5l3 3" stroke={color} strokeWidth="1.8" strokeLinecap="round" /></Svg>;
}

// ─── tipos de atividade ───────────────────────────────────────
const TIPOS = [
  { id: 'producao',   label: 'Produção',    color: Colors.green },
  { id: 'setup',      label: 'Setup',       color: Colors.accent },
  { id: 'parada',     label: 'Parada',      color: Colors.red },
  { id: 'qualidade',  label: 'Qualidade',   color: Colors.purple },
  { id: 'manutencao', label: 'Manutenção',  color: Colors.orange },
];

const TURNOS = ['manha', 'tarde', 'noite'];

// ─── modal seleção de OP ─────────────────────────────────────
function OPPickerModal({
  visible, ordens, onSelect, onClose,
}: {
  visible: boolean;
  ordens: OrdemProducao[];
  onSelect: (op: OrdemProducao | null) => void;
  onClose: () => void;
}) {
  const [busca, setBusca] = useState('');
  const filtered = ordens.filter(
    (o) =>
      !busca ||
      o.codigo?.toLowerCase().includes(busca.toLowerCase()) ||
      o.produto_nome?.toLowerCase().includes(busca.toLowerCase())
  );
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.border }}>
          <Text style={{ fontSize: 17, fontWeight: '700', color: Colors.text }}>Selecionar OP</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={{ fontSize: 15, color: Colors.accent, fontWeight: '500' }}>Cancelar</Text>
          </TouchableOpacity>
        </View>
        <View style={{ padding: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 12, height: 42, gap: 8 }}>
            <TextInput
              value={busca}
              onChangeText={setBusca}
              placeholder="Buscar OP ou produto..."
              placeholderTextColor={Colors.muted}
              style={{ flex: 1, fontSize: 14, color: Colors.text, padding: 0 }}
              autoFocus
            />
          </View>
        </View>
        <TouchableOpacity
          onPress={() => { onSelect(null); onClose(); }}
          style={{ marginHorizontal: 12, marginBottom: 8, padding: 14, backgroundColor: Colors.surface, borderRadius: 10, borderWidth: 1, borderColor: Colors.border }}
        >
          <Text style={{ fontSize: 14, color: Colors.muted, fontStyle: 'italic' }}>Sem OP vinculada</Text>
        </TouchableOpacity>
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 20 }}
          renderItem={({ item }) => {
            const st = statusOP(item.status);
            return (
              <TouchableOpacity
                onPress={() => { onSelect(item); onClose(); }}
                style={{ padding: 14, marginBottom: 8, backgroundColor: Colors.card, borderRadius: 10, borderWidth: 1, borderColor: Colors.border }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.text }}>{item.codigo ?? `OP #${item.id}`}</Text>
                  <StatusPill label={st.label} color={st.color} bg={st.bg} />
                </View>
                <Text style={{ fontSize: 13, color: Colors.textSoft, marginTop: 3 }}>{item.produto_nome}</Text>
                {item.quantidade ? (
                  <Text style={{ fontSize: 11, color: Colors.muted, marginTop: 2 }}>Qtd: {item.quantidade} {item.unidade ?? ''}</Text>
                ) : null}
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={{ paddingVertical: 32, alignItems: 'center' }}>
              <Text style={{ fontSize: 13, color: Colors.muted }}>Nenhuma OP encontrada</Text>
            </View>
          }
        />
      </SafeAreaView>
    </Modal>
  );
}

// ─── aba: novo apontamento ────────────────────────────────────
function NovoApontamento({ ordens }: { ordens: OrdemProducao[] }) {
  const queryClient = useQueryClient();

  const [tipo, setTipo] = useState(TIPOS[0]);
  const [opSelecionada, setOpSelecionada] = useState<OrdemProducao | null>(null);
  const [showOpModal, setShowOpModal] = useState(false);
  const [rodando, setRodando] = useState(false);
  const [inicio, setInicio] = useState<Date | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [qtdProd, setQtdProd] = useState('');
  const [qtdRefugo, setQtdRefugo] = useState('');
  const [maquina, setMaquina] = useState('');
  const [turno, setTurno] = useState(TURNOS[0]);
  const [obs, setObs] = useState('');
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (rodando) {
      timer.current = setInterval(() => setElapsed((p) => p + 1), 1000);
    } else {
      if (timer.current) clearInterval(timer.current);
    }
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [rodando]);

  const mutation = useMutation({
    mutationFn: pcpApi.registrarApontamento,
    onSuccess: (data) => {
      if (data?.success) {
        Alert.alert('Apontamento registrado!', `ID #${data.id} salvo com sucesso.`);
        queryClient.invalidateQueries({ queryKey: ['pcp', 'meus-apontamentos'] });
        queryClient.invalidateQueries({ queryKey: ['pcp', 'stats'] });
        // reset
        setRodando(false);
        setInicio(null);
        setElapsed(0);
        setQtdProd('');
        setQtdRefugo('');
        setObs('');
        setOpSelecionada(null);
      } else {
        Alert.alert('Erro', data?.message ?? 'Não foi possível salvar o apontamento.');
      }
    },
    onError: () => Alert.alert('Erro', 'Falha na conexão. Tente novamente.'),
  });

  const handleToggle = () => {
    if (!rodando) {
      setInicio(new Date());
      setElapsed(0);
      setRodando(true);
    } else {
      setRodando(false);
    }
  };

  const handleRegistrar = () => {
    if (!inicio) {
      Alert.alert('Atenção', 'Inicie o cronômetro antes de registrar.');
      return;
    }
    const fim = new Date();
    const durSeg = Math.round((fim.getTime() - inicio.getTime()) / 1000);
    mutation.mutate({
      tipo_atividade: tipo.id,
      nome_atividade: tipo.label,
      hora_inicio: inicio.toISOString(),
      hora_fim: fim.toISOString(),
      duracao_segundos: durSeg,
      ordem_producao_id: opSelecionada?.id ?? null,
      produto_descricao: opSelecionada?.produto_nome,
      quantidade_produzida: qtdProd ? Number(qtdProd) : 0,
      quantidade_refugo: qtdRefugo ? Number(qtdRefugo) : 0,
      maquina: maquina || undefined,
      turno,
      observacoes: obs || undefined,
    });
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 14, gap: 16 }} keyboardShouldPersistTaps="handled">
      {/* Tipo de atividade */}
      <View>
        <SectionLabel text="Tipo de Atividade" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {TIPOS.map((t) => (
            <TouchableOpacity
              key={t.id}
              onPress={() => setTipo(t)}
              style={{
                paddingHorizontal: 16, paddingVertical: 9, borderRadius: 10,
                backgroundColor: tipo.id === t.id ? t.color : Colors.card,
                borderWidth: 1,
                borderColor: tipo.id === t.id ? t.color : Colors.border,
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: '600', color: tipo.id === t.id ? '#fff' : Colors.textSoft }}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Cronômetro */}
      <Card style={{ alignItems: 'center', padding: 24, gap: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <IconClock size={18} color={rodando ? tipo.color : Colors.muted} />
          <Text style={{ fontSize: 42, fontWeight: '800', color: rodando ? tipo.color : Colors.text, letterSpacing: -1 }}>
            {fmtDuracao(elapsed)}
          </Text>
        </View>
        {inicio && (
          <Text style={{ fontSize: 12, color: Colors.muted }}>
            Início: {fmtHora(inicio.toISOString())}
          </Text>
        )}
        <TouchableOpacity
          onPress={handleToggle}
          style={{
            width: 72, height: 72, borderRadius: 36,
            backgroundColor: rodando ? Colors.red : tipo.color,
            alignItems: 'center', justifyContent: 'center',
            shadowColor: rodando ? Colors.red : tipo.color,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.35, shadowRadius: 12, elevation: 6,
          }}
        >
          {rodando ? <IconStop size={26} color="#fff" /> : <IconPlay size={26} color="#fff" />}
        </TouchableOpacity>
        <Text style={{ fontSize: 12, color: Colors.muted }}>
          {rodando ? 'Toque para parar' : inicio ? 'Retomar' : 'Iniciar cronômetro'}
        </Text>
      </Card>

      {/* Selecionar OP */}
      <View>
        <SectionLabel text="Ordem de Produção (opcional)" />
        <TouchableOpacity
          onPress={() => setShowOpModal(true)}
          style={{
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            padding: 14, backgroundColor: Colors.card, borderRadius: 10,
            borderWidth: 1, borderColor: opSelecionada ? tipo.color : Colors.border,
          }}
        >
          {opSelecionada ? (
            <View>
              <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.text }}>{opSelecionada.codigo ?? `OP #${opSelecionada.id}`}</Text>
              <Text style={{ fontSize: 12, color: Colors.muted, marginTop: 1 }}>{opSelecionada.produto_nome}</Text>
            </View>
          ) : (
            <Text style={{ fontSize: 14, color: Colors.muted }}>Selecionar OP...</Text>
          )}
          <Text style={{ fontSize: 20, color: Colors.muted }}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Quantidades */}
      <View>
        <SectionLabel text="Quantidades" />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {[
            { label: 'Produzido', value: qtdProd, setter: setQtdProd, color: Colors.green },
            { label: 'Refugo', value: qtdRefugo, setter: setQtdRefugo, color: Colors.red },
          ].map((f) => (
            <View key={f.label} style={{ flex: 1, gap: 5 }}>
              <Text style={{ fontSize: 12.5, fontWeight: '500', color: Colors.text }}>{f.label}</Text>
              <View style={{ backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: 9, paddingHorizontal: 12, height: 46, justifyContent: 'center' }}>
                <TextInput
                  value={f.value}
                  onChangeText={f.setter}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={Colors.muted}
                  style={{ fontSize: 16, color: f.color, fontWeight: '600', padding: 0 }}
                />
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Turno e Máquina */}
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1 }}>
          <SectionLabel text="Turno" />
          <View style={{ flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: 9, padding: 3, gap: 3 }}>
            {TURNOS.map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => setTurno(t)}
                style={{
                  flex: 1, paddingVertical: 7, borderRadius: 7, alignItems: 'center',
                  backgroundColor: turno === t ? Colors.card : 'transparent',
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: '600', color: turno === t ? Colors.text : Colors.muted, textTransform: 'capitalize' }}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <View>
        <SectionLabel text="Máquina / Equipamento" />
        <View style={{ backgroundColor: Colors.card, borderRadius: 9, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 12, height: 44, justifyContent: 'center' }}>
          <TextInput
            value={maquina}
            onChangeText={setMaquina}
            placeholder="Ex: Extrusora 01, Torno CNC..."
            placeholderTextColor={Colors.muted}
            style={{ fontSize: 14, color: Colors.text, padding: 0 }}
          />
        </View>
      </View>

      {/* Observações */}
      <View>
        <SectionLabel text="Observações" />
        <View style={{ backgroundColor: Colors.card, borderRadius: 9, borderWidth: 1, borderColor: Colors.border, padding: 12 }}>
          <TextInput
            value={obs}
            onChangeText={setObs}
            placeholder="Anotações adicionais sobre o apontamento..."
            placeholderTextColor={Colors.muted}
            multiline
            numberOfLines={3}
            style={{ fontSize: 14, color: Colors.text, minHeight: 72, textAlignVertical: 'top', padding: 0 }}
          />
        </View>
      </View>

      {/* Botão registrar */}
      <TouchableOpacity
        onPress={handleRegistrar}
        disabled={mutation.isPending || !inicio}
        style={{
          height: 50, borderRadius: 10,
          backgroundColor: !inicio ? Colors.surface : tipo.color,
          flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
          opacity: mutation.isPending ? 0.7 : 1,
          shadowColor: !inicio ? 'transparent' : tipo.color,
          shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 4,
        }}
      >
        {mutation.isPending ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <>
            <IconCheck size={18} color="#fff" />
            <Text style={{ fontSize: 16, fontWeight: '700', color: inicio ? '#fff' : Colors.muted }}>
              Registrar Apontamento
            </Text>
          </>
        )}
      </TouchableOpacity>

      <View style={{ height: 30 }} />

      <OPPickerModal
        visible={showOpModal}
        ordens={ordens}
        onSelect={setOpSelecionada}
        onClose={() => setShowOpModal(false)}
      />
    </ScrollView>
  );
}

// ─── aba: histórico ───────────────────────────────────────────
function MeusApontamentos() {
  const { data = [], isLoading, refetch, isRefetching } = useQuery<Apontamento[]>({
    queryKey: ['pcp', 'meus-apontamentos'],
    queryFn: pcpApi.getMeusApontamentos,
    retry: 1,
  });

  const tipoConfig = (id?: string) =>
    TIPOS.find((t) => t.id === id) ?? { color: Colors.muted, label: id ?? 'Atividade' };

  return (
    <ScrollView
      contentContainerStyle={{ padding: 14, gap: 10 }}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.accent} colors={[Colors.accent]} />}
    >
      {isLoading ? (
        <View style={{ paddingVertical: 40, alignItems: 'center' }}><ActivityIndicator color={Colors.accent} /></View>
      ) : data.length === 0 ? (
        <View style={{ paddingVertical: 48, alignItems: 'center' }}>
          <Text style={{ fontSize: 15, fontWeight: '600', color: Colors.text }}>Sem apontamentos</Text>
          <Text style={{ fontSize: 13, color: Colors.muted, marginTop: 4 }}>Use a aba "Apontar" para registrar</Text>
        </View>
      ) : (
        data.map((a) => {
          const tc = tipoConfig(a.tipo_atividade);
          return (
            <Card key={a.id} style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: tc.color }} />
                  <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.text }}>{tc.label}</Text>
                </View>
                {a.duracao_segundos ? (
                  <Text style={{ fontSize: 12, color: Colors.muted }}>{fmtDuracao(a.duracao_segundos)}</Text>
                ) : null}
              </View>
              {a.produto_descricao || a.ordem_producao_id ? (
                <Text style={{ fontSize: 13, color: Colors.textSoft }}>
                  {a.produto_descricao ?? `OP #${a.ordem_producao_id}`}
                </Text>
              ) : null}
              <View style={{ flexDirection: 'row', gap: 16 }}>
                <Text style={{ fontSize: 12, color: Colors.muted }}>
                  {fmtHora(a.hora_inicio)} → {fmtHora(a.hora_fim)}
                </Text>
                {a.quantidade_produzida ? (
                  <Text style={{ fontSize: 12, color: Colors.green, fontWeight: '600' }}>
                    Prod: {a.quantidade_produzida}
                  </Text>
                ) : null}
                {a.quantidade_refugo ? (
                  <Text style={{ fontSize: 12, color: Colors.red, fontWeight: '600' }}>
                    Ref: {a.quantidade_refugo}
                  </Text>
                ) : null}
              </View>
              {a.maquina ? <Text style={{ fontSize: 11, color: Colors.muted }}>Máq: {a.maquina}</Text> : null}
              {a.observacoes ? <Text style={{ fontSize: 12, color: Colors.muted, fontStyle: 'italic' }}>{a.observacoes}</Text> : null}
            </Card>
          );
        })
      )}
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

// ─── tela principal ───────────────────────────────────────────
type TabId = 'ordens' | 'apontar' | 'historico';

export default function PCPScreen() {
  const [tab, setTab] = useState<TabId>('ordens');

  const {
    data: ordens = [], isLoading: ordensLoading, refetch: refetchOrdens, isRefetching: ordensRefetching,
  } = useQuery<OrdemProducao[]>({
    queryKey: ['pcp', 'ordens-apontamento'],
    queryFn: () => pcpApi.getOrdensParaApontamento(),
    retry: 1,
  });

  const { data: stats } = useQuery({
    queryKey: ['pcp', 'stats'],
    queryFn: pcpApi.getApontamentosStats,
    retry: 1,
  });

  const TABS: { id: TabId; label: string }[] = [
    { id: 'ordens',    label: 'Ordens' },
    { id: 'apontar',   label: 'Apontar' },
    { id: 'historico', label: 'Histórico' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }} edges={['top']}>
      <ScreenHeader title="PCP — Apontamentos" onBack={() => router.back()} />

      {/* KPIs */}
      <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 14, paddingBottom: 10 }}>
        <KPICard
          title="Hoje"
          value={String((stats as any)?.apontamentos_hoje ?? '--')}
          sub="apontamentos"
          color={Colors.accent}
          style={{ flex: 1 }}
        />
        <KPICard
          title="OPs Ativas"
          value={String(ordens.length)}
          color={Colors.yellow}
          style={{ flex: 1 }}
        />
        <KPICard
          title="Produzido"
          value={String((stats as any)?.quantidade_total ?? '--')}
          sub={(stats as any)?.unidade ?? 'un'}
          color={Colors.green}
          style={{ flex: 1 }}
        />
      </View>

      {/* Tabs */}
      <View style={{ flexDirection: 'row', marginHorizontal: 14, backgroundColor: Colors.surface, borderRadius: 10, padding: 3, gap: 3, marginBottom: 4 }}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t.id}
            onPress={() => setTab(t.id)}
            style={{
              flex: 1, paddingVertical: 9, borderRadius: 8, alignItems: 'center',
              backgroundColor: tab === t.id ? Colors.card : 'transparent',
              shadowColor: tab === t.id ? '#000' : 'transparent',
              shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 3,
              elevation: tab === t.id ? 1 : 0,
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: '600', color: tab === t.id ? Colors.accent : Colors.muted }}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Conteúdo */}
      {tab === 'ordens' && (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 14, gap: 10 }}
          refreshControl={<RefreshControl refreshing={ordensRefetching} onRefresh={refetchOrdens} tintColor={Colors.accent} colors={[Colors.accent]} />}
        >
          {ordensLoading ? (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}><ActivityIndicator color={Colors.accent} /></View>
          ) : ordens.length === 0 ? (
            <View style={{ paddingVertical: 48, alignItems: 'center' }}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: Colors.text }}>Nenhuma OP ativa</Text>
              <Text style={{ fontSize: 13, color: Colors.muted, marginTop: 4 }}>Todas as ordens estão concluídas</Text>
            </View>
          ) : (
            ordens.map((o) => {
              const st = statusOP(o.status);
              const prog = o.progresso ?? 0;
              return (
                <Card key={o.id}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.text }}>{o.codigo ?? `OP #${o.id}`}</Text>
                      <Text style={{ fontSize: 13, color: Colors.textSoft, marginTop: 2 }}>{o.produto_nome}</Text>
                    </View>
                    <StatusPill label={st.label} color={st.color} bg={st.bg} />
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={{ flex: 1, height: 6, backgroundColor: Colors.surface, borderRadius: 4, overflow: 'hidden' }}>
                      <View style={{ width: `${Math.min(prog, 100)}%`, height: '100%', backgroundColor: st.color, borderRadius: 4 }} />
                    </View>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: st.color, width: 34, textAlign: 'right' }}>{prog}%</Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 16, marginTop: 6 }}>
                    {o.quantidade ? <Text style={{ fontSize: 11, color: Colors.muted }}>Qtd: {o.quantidade} {o.unidade ?? ''}</Text> : null}
                    {o.data_prevista ? <Text style={{ fontSize: 11, color: Colors.muted }}>Prazo: {new Date(o.data_prevista).toLocaleDateString('pt-BR')}</Text> : null}
                  </View>
                  <TouchableOpacity
                    onPress={() => setTab('apontar')}
                    style={{ marginTop: 10, paddingVertical: 8, backgroundColor: Colors.accentDim, borderRadius: 8, alignItems: 'center' }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.accent }}>Apontar nesta OP</Text>
                  </TouchableOpacity>
                </Card>
              );
            })
          )}
          <View style={{ height: 20 }} />
        </ScrollView>
      )}

      {tab === 'apontar' && <NovoApontamento ordens={ordens} />}
      {tab === 'historico' && <MeusApontamentos />}
    </SafeAreaView>
  );
}
