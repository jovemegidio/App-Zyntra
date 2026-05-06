import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/lib/constants';
import { Card, SectionLabel, ScreenHeader, StatusPill, IconPlus } from '@/components/ui';

export default function ComprasScreen() {
  const pedidos = [
    { pc: 'PC-0431', forn: 'AluBras Ltda', valor: 'R$ 42.000', status: 'Aprovacao', sc: Colors.yellow, sd: Colors.yellowDim },
    { pc: 'PC-0430', forn: 'MetalPrime', valor: 'R$ 18.500', status: 'Aprovado', sc: Colors.green, sd: Colors.greenDim },
    { pc: 'PC-0429', forn: 'Insumos Sul', valor: 'R$ 7.800', status: 'Recebido', sc: Colors.teal, sd: Colors.tealDim },
    { pc: 'PC-0428', forn: 'ForjaMax', valor: 'R$ 63.200', status: 'Aprovado', sc: Colors.green, sd: Colors.greenDim },
    { pc: 'PC-0427', forn: 'AluBras Ltda', valor: 'R$ 29.400', status: 'Cancelado', sc: Colors.red, sd: Colors.redDim },
  ];

  const fornecedores = [
    { nome: 'AluBras Ltda', cat: 'Aluminio', vol: 'R$ 280K' },
    { nome: 'MetalPrime', cat: 'Inox / Aco', vol: 'R$ 195K' },
    { nome: 'ForjaMax', cat: 'Pecas forjadas', vol: 'R$ 142K' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }} edges={['top']}>
      <ScreenHeader
        title="Compras"
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
            { label: 'PC Abertos', value: '8', color: Colors.orange },
            { label: 'Aprovados', value: '24', color: Colors.green },
            { label: 'Aguardando', value: '5', color: Colors.yellow },
          ].map((k, i) => (
            <Card key={i} style={{ flex: 1, padding: 12, alignItems: 'center' }}>
              <Text style={{ fontSize: 9, color: Colors.muted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                {k.label}
              </Text>
              <Text style={{ fontSize: 20, fontWeight: '700', color: k.color }}>{k.value}</Text>
            </Card>
          ))}
        </View>

        {/* Pedidos de Compra */}
        <View>
          <SectionLabel text="Pedidos de Compra" />
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
                  <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.text }}>{p.pc}</Text>
                  <Text style={{ fontSize: 11, color: Colors.muted, marginTop: 1 }}>{p.forn}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 3 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.text }}>{p.valor}</Text>
                  <StatusPill label={p.status} color={p.sc} bg={p.sd} />
                </View>
              </View>
            ))}
          </Card>
        </View>

        {/* Fornecedores */}
        <View>
          <SectionLabel text="Principais Fornecedores" />
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            {fornecedores.map((f, i) => (
              <View
                key={i}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 12,
                  paddingHorizontal: 14,
                  borderBottomWidth: i < fornecedores.length - 1 ? 1 : 0,
                  borderBottomColor: Colors.border,
                }}
              >
                <View>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.text }}>{f.nome}</Text>
                  <Text style={{ fontSize: 11, color: Colors.muted }}>{f.cat}</Text>
                </View>
                <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.orange }}>{f.vol}</Text>
              </View>
            ))}
          </Card>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
