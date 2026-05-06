import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/lib/constants';
import { Card, SectionLabel, ScreenHeader, StatusPill, Badge, IconPlus } from '@/components/ui';

export default function RHScreen() {
  const cols = [
    { nome: 'Ana Paula R.', cargo: 'Analista de RH', dept: 'RH', status: 'Presente', sc: Colors.green, sd: Colors.greenDim },
    { nome: 'Carlos Santos', cargo: 'Gerente Comercial', dept: 'Vendas', status: 'Presente', sc: Colors.green, sd: Colors.greenDim },
    { nome: 'Fernanda Lima', cargo: 'Operadora de PCP', dept: 'PCP', status: 'Ferias', sc: Colors.accent, sd: Colors.accentDim },
    { nome: 'Ricardo Moura', cargo: 'Motorista', dept: 'Logistica', status: 'Em rota', sc: Colors.teal, sd: Colors.tealDim },
    { nome: 'Juliana Costa', cargo: 'Assist. Financeiro', dept: 'Financeiro', status: 'Ausente', sc: Colors.red, sd: Colors.redDim },
  ];

  const ponto = [
    { label: 'Entrada normal (ate 08:05)', value: '152', color: Colors.green },
    { label: 'Atraso (apos 08:05)', value: '12', color: Colors.yellow },
    { label: 'Falta justificada', value: '8', color: Colors.orange },
    { label: 'Falta nao justificada', value: '5', color: Colors.red },
    { label: 'Home office', value: '7', color: Colors.accent },
  ];

  const aniversarios = [
    { nome: 'Marcos Oliveira', data: '05/06', dept: 'TI' },
    { nome: 'Patricia Souza', data: '14/06', dept: 'RH' },
    { nome: 'Joao Ferreira', data: '22/06', dept: 'Logistica' },
  ];

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).slice(0, 2).join('');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }} edges={['top']}>
      <ScreenHeader
        title="Recursos Humanos"
        onBack={() => router.back()}
        right={
          <TouchableOpacity>
            <IconPlus size={18} color={Colors.accent} />
          </TouchableOpacity>
        }
      />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 14, paddingTop: 8, gap: 14 }}>
        {/* KPIs */}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {[
            { label: 'Total', value: '184', color: Colors.text },
            { label: 'Presentes', value: '171', color: Colors.green },
            { label: 'Ausentes', value: '13', color: Colors.red },
          ].map((c, i) => (
            <Card key={i} style={{ flex: 1, padding: 12, alignItems: 'center' }}>
              <Text style={{ fontSize: 9.5, color: Colors.muted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                {c.label}
              </Text>
              <Text style={{ fontSize: 20, fontWeight: '700', color: c.color }}>{c.value}</Text>
            </Card>
          ))}
        </View>

        {/* Ponto do dia */}
        <View>
          <SectionLabel text="Ponto Eletronico — Hoje" />
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            {ponto.map((r, i) => (
              <View
                key={i}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 11,
                  paddingHorizontal: 14,
                  borderBottomWidth: i < ponto.length - 1 ? 1 : 0,
                  borderBottomColor: Colors.border,
                }}
              >
                <Text style={{ fontSize: 12.5, color: Colors.textSoft }}>{r.label}</Text>
                <Text style={{ fontSize: 15, fontWeight: '700', color: r.color }}>{r.value}</Text>
              </View>
            ))}
          </Card>
        </View>

        {/* Colaboradores */}
        <View>
          <SectionLabel text="Colaboradores" />
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            {cols.map((c, i) => (
              <View
                key={i}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  padding: 11,
                  paddingHorizontal: 14,
                  borderBottomWidth: i < cols.length - 1 ? 1 : 0,
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
                  <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.accent }}>{getInitials(c.nome)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.text }} numberOfLines={1}>{c.nome}</Text>
                  <Text style={{ fontSize: 11, color: Colors.muted }}>{c.cargo} · {c.dept}</Text>
                </View>
                <StatusPill label={c.status} color={c.sc} bg={c.sd} />
              </View>
            ))}
          </Card>
        </View>

        {/* Aniversarios */}
        <View>
          <SectionLabel text="Aniversarios do Mes" />
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            {aniversarios.map((a, i) => (
              <View
                key={i}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 11,
                  paddingHorizontal: 14,
                  borderBottomWidth: i < aniversarios.length - 1 ? 1 : 0,
                  borderBottomColor: Colors.border,
                }}
              >
                <View>
                  <Text style={{ fontSize: 13, color: Colors.text, fontWeight: '500' }}>{a.nome}</Text>
                  <Text style={{ fontSize: 11, color: Colors.muted }}>{a.dept}</Text>
                </View>
                <Badge label={a.data} color={Colors.purple} bg={Colors.purpleDim} />
              </View>
            ))}
          </Card>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
