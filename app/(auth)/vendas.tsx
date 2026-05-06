import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/lib/constants';
import { Card, SectionLabel, ScreenHeader, KPICard, StatusPill, IconPlus, IconSearch } from '@/components/ui';

export default function VendasScreen() {
  const [busca, setBusca] = useState('');

  const pedidos = [
    { num: '#4821', cli: 'Alpha Ltda', valor: 'R$ 12.540', status: 'Aprovado', sc: Colors.green, sd: Colors.greenDim, data: '30/05' },
    { num: '#4820', cli: 'Beta S.A.', valor: 'R$ 8.200', status: 'Em analise', sc: Colors.yellow, sd: Colors.yellowDim, data: '29/05' },
    { num: '#4819', cli: 'Gama Eireli', valor: 'R$ 34.800', status: 'Aprovado', sc: Colors.green, sd: Colors.greenDim, data: '29/05' },
    { num: '#4818', cli: 'Delta Corp', valor: 'R$ 5.100', status: 'Cancelado', sc: Colors.red, sd: Colors.redDim, data: '28/05' },
    { num: '#4817', cli: 'Epsilon Ind.', valor: 'R$ 19.700', status: 'Entregue', sc: Colors.teal, sd: Colors.tealDim, data: '27/05' },
  ].filter((p) => p.cli.toLowerCase().includes(busca.toLowerCase()) || p.num.includes(busca));

  const funil = [
    { label: 'Prospeccao', value: 420, color: Colors.mutedLight },
    { label: 'Qualificacao', value: 280, color: Colors.accent },
    { label: 'Proposta', value: 140, color: Colors.yellow },
    { label: 'Negociacao', value: 72, color: Colors.orange },
    { label: 'Fechamento', value: 38, color: Colors.green },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }} edges={['top']}>
      <ScreenHeader
        title="Vendas"
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
          <KPICard title="Faturado/Mes" value="R$ 892K" change="+11%" up={true} color={Colors.green} spark={[60, 75, 70, 88, 82, 95, 90, 105, 98, 112]} style={{ flex: 1 }} />
          <KPICard title="Meta" value="82%" sub="R$ 1,09M meta" color={Colors.accent} spark={[50, 55, 60, 62, 65, 68, 72, 75, 78, 82]} style={{ flex: 1 }} />
        </View>

        {/* Meta progress */}
        <Card style={{ padding: 14 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ fontSize: 13, color: Colors.textSoft }}>Meta mensal — Junho</Text>
            <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.accent }}>82%</Text>
          </View>
          <View style={{ height: 8, backgroundColor: Colors.surface, borderRadius: 8, overflow: 'hidden' }}>
            <View style={{ width: '82%', height: '100%', borderRadius: 8, backgroundColor: Colors.accent }} />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
            <Text style={{ fontSize: 11, color: Colors.muted }}>R$ 892.000 realizado</Text>
            <Text style={{ fontSize: 11, color: Colors.muted }}>R$ 1.090.000 meta</Text>
          </View>
        </Card>

        {/* Funil */}
        <View>
          <SectionLabel text="Funil de Vendas" />
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            {funil.map((f, i) => (
              <View key={i} style={{ padding: 10, paddingHorizontal: 14, borderBottomWidth: i < funil.length - 1 ? 1 : 0, borderBottomColor: Colors.border }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                  <Text style={{ fontSize: 12, color: Colors.textSoft }}>{f.label}</Text>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: f.color }}>{f.value}</Text>
                </View>
                <View style={{ height: 5, backgroundColor: Colors.surface, borderRadius: 4, overflow: 'hidden' }}>
                  <View style={{ width: `${(f.value / 420) * 100}%`, height: '100%', backgroundColor: f.color, borderRadius: 4 }} />
                </View>
              </View>
            ))}
          </Card>
        </View>

        {/* Pedidos */}
        <View>
          <SectionLabel text="Pedidos Recentes" />
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: Colors.surface,
              borderRadius: 11,
              padding: 10,
              paddingHorizontal: 12,
              gap: 8,
              marginBottom: 10,
              borderWidth: 1,
              borderColor: Colors.border,
              alignItems: 'center',
            }}
          >
            <IconSearch size={16} color={Colors.muted} />
            <TextInput
              value={busca}
              onChangeText={setBusca}
              placeholder="Buscar pedido ou cliente..."
              placeholderTextColor={Colors.muted}
              style={{ flex: 1, fontSize: 13, color: Colors.text, padding: 0 }}
            />
          </View>
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            {pedidos.map((p, i) => (
              <View
                key={i}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 12,
                  paddingHorizontal: 14,
                  borderBottomWidth: i < pedidos.length - 1 ? 1 : 0,
                  borderBottomColor: Colors.border,
                }}
              >
                <View>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.text }}>{p.num} — {p.cli}</Text>
                  <Text style={{ fontSize: 11, color: Colors.muted, marginTop: 2 }}>{p.data}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.text }}>{p.valor}</Text>
                  <StatusPill label={p.status} color={p.sc} bg={p.sd} />
                </View>
              </View>
            ))}
          </Card>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
