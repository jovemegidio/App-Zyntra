import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, MODULES } from '@/lib/constants';
import { Card, KPICard, SectionLabel, IconBell, ModuleIcon } from '@/components/ui';

export default function HomeScreen() {
  const kpis = [
    { title: 'Faturamento', value: 'R$ 1,24M', change: '+8,4%', up: true, color: Colors.accent, spark: [70, 90, 80, 110, 100, 130, 120, 145, 155, 170] },
    { title: 'Pedidos Abertos', value: '247', change: '+12 hoje', up: true, color: Colors.green, spark: [40, 52, 48, 65, 60, 74, 70, 82, 78, 90] },
    { title: 'Colaboradores', value: '184', sub: 'ativos hoje', color: Colors.purple, spark: [180, 181, 182, 181, 183, 182, 184, 183, 184, 184] },
    { title: 'Disponib. Estoque', value: '96%', change: '-2%', up: false, color: Colors.yellow, spark: [99, 98, 97, 99, 96, 98, 97, 96, 97, 96] },
  ];

  const resumo = [
    { label: 'NF-e emitidas hoje', value: '34', color: Colors.green },
    { label: 'Compras pendentes', value: '8', color: Colors.yellow },
    { label: 'Entregas em andamento', value: '22', color: Colors.teal },
    { label: 'Ordens de producao', value: '15', color: Colors.orange },
    { label: 'Aprovacoes aguardando', value: '5', color: Colors.red },
  ];

  const atividade = [
    { msg: 'Pedido #4821 aprovado por Carlos S.', time: '09:32', dot: Colors.green },
    { msg: 'NF-e #001204 emitida — R$ 12.540', time: '09:15', dot: Colors.accent },
    { msg: 'Entrega #892 concluida em SP', time: '08:50', dot: Colors.teal },
    { msg: 'PO-0431 aguardando aprovacao', time: '08:22', dot: Colors.yellow },
    { msg: 'Colaborador admitido: Ana Paula R.', time: '07:48', dot: Colors.purple },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }} edges={['top']}>
      {/* Header */}
      <View style={{ paddingHorizontal: 18, paddingTop: 14, paddingBottom: 10 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ fontSize: 12, color: Colors.muted, marginBottom: 2 }}>{getGreeting()},</Text>
            <Text style={{ fontSize: 20, fontWeight: '700', color: Colors.text, letterSpacing: -0.3 }}>
              Administrador
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <TouchableOpacity
              onPress={() => router.push('/(auth)/notificacoes')}
              style={{
                width: 38,
                height: 38,
                backgroundColor: Colors.card,
                borderWidth: 1,
                borderColor: Colors.border,
                borderRadius: 11,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconBell size={18} color={Colors.mutedLight} />
              <View
                style={{
                  position: 'absolute',
                  top: 7,
                  right: 7,
                  width: 7,
                  height: 7,
                  borderRadius: 3.5,
                  backgroundColor: Colors.red,
                  borderWidth: 1.5,
                  borderColor: Colors.bg,
                }}
              />
            </TouchableOpacity>
            <View
              style={{
                width: 38,
                height: 38,
                borderRadius: 11,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <View
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 11,
                  backgroundColor: Colors.accent,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>AD</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Scrollable body */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 14, paddingTop: 4, gap: 16 }}>
        {/* KPI grid */}
        <View>
          <SectionLabel text="Visao Geral" />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {kpis.map((k, i) => (
              <KPICard key={i} {...k} style={{ width: '48.5%' }} />
            ))}
          </View>
        </View>

        {/* Resumo do dia */}
        <View>
          <SectionLabel text="Resumo do Dia" />
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            {resumo.map((r, i) => (
              <View
                key={i}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 12,
                  paddingHorizontal: 16,
                  borderBottomWidth: i < resumo.length - 1 ? 1 : 0,
                  borderBottomColor: Colors.border,
                }}
              >
                <Text style={{ fontSize: 13, color: Colors.textSoft }}>{r.label}</Text>
                <Text style={{ fontSize: 16, fontWeight: '700', color: r.color }}>{r.value}</Text>
              </View>
            ))}
          </Card>
        </View>

        {/* Modulos rapidos */}
        <View>
          <SectionLabel text="Modulos" />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {MODULES.map((m) => (
              <TouchableOpacity
                key={m.id}
                onPress={() => router.push(`/(auth)/${m.id}` as any)}
                style={{
                  width: '23%',
                  backgroundColor: Colors.card,
                  borderWidth: 1,
                  borderColor: Colors.border,
                  borderRadius: 14,
                  paddingVertical: 12,
                  paddingHorizontal: 4,
                  alignItems: 'center',
                  gap: 7,
                }}
              >
                <View
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 11,
                    backgroundColor: m.dim,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ModuleIcon id={m.id} size={18} color={m.color} />
                </View>
                <Text
                  style={{
                    fontSize: 9.5,
                    fontWeight: '600',
                    color: Colors.mutedLight,
                    textAlign: 'center',
                    lineHeight: 12,
                  }}
                >
                  {m.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Atividade recente */}
        <View>
          <SectionLabel text="Atividade Recente" />
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            {atividade.map((a, i) => (
              <View
                key={i}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  padding: 11,
                  paddingHorizontal: 14,
                  borderBottomWidth: i < atividade.length - 1 ? 1 : 0,
                  borderBottomColor: Colors.border,
                }}
              >
                <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: a.dot }} />
                <Text style={{ flex: 1, fontSize: 12.5, color: Colors.textSoft, lineHeight: 18 }}>{a.msg}</Text>
                <Text style={{ fontSize: 11, color: Colors.muted }}>{a.time}</Text>
              </View>
            ))}
          </Card>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
