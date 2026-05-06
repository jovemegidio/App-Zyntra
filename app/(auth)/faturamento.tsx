import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/lib/constants';
import { Card, SectionLabel, ScreenHeader, KPICard, StatusPill, IconPlus } from '@/components/ui';

export default function FaturamentoScreen() {
  const notas = [
    { nf: 'NF-001204', dest: 'Alpha Ltda', valor: 'R$ 28.540', status: 'Autorizada', sc: Colors.green, sd: Colors.greenDim },
    { nf: 'NF-001205', dest: 'Beta S.A.', valor: 'R$ 12.000', status: 'Autorizada', sc: Colors.green, sd: Colors.greenDim },
    { nf: 'NF-001206', dest: 'Gama Corp', valor: 'R$ 45.800', status: 'Em processamento', sc: Colors.yellow, sd: Colors.yellowDim },
    { nf: 'NF-001207', dest: 'Delta Eireli', valor: 'R$ 9.200', status: 'Rejeitada', sc: Colors.red, sd: Colors.redDim },
    { nf: 'NF-001208', dest: 'Epsilon Ind.', valor: 'R$ 31.400', status: 'Autorizada', sc: Colors.green, sd: Colors.greenDim },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }} edges={['top']}>
      <ScreenHeader
        title="Faturamento"
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
          <KPICard title="NF-e hoje" value="34" change="+6 vs ontem" up={true} color={Colors.red} spark={[22, 28, 25, 30, 27, 32, 29, 34, 31, 34]} style={{ flex: 1 }} />
          <KPICard title="Total faturado" value="R$ 487K" change="+9%" up={true} color={Colors.orange} spark={[350, 380, 365, 410, 390, 440, 420, 460, 445, 487]} style={{ flex: 1 }} />
        </View>

        {/* NF-e Emitidas */}
        <View>
          <SectionLabel text="NF-e Emitidas Hoje" />
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            {notas.map((n, i) => (
              <View
                key={i}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 11,
                  paddingHorizontal: 14,
                  borderBottomWidth: i < notas.length - 1 ? 1 : 0,
                  borderBottomColor: Colors.border,
                }}
              >
                <View>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.text }}>{n.nf}</Text>
                  <Text style={{ fontSize: 11, color: Colors.muted, marginTop: 1 }}>{n.dest}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 3 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.text }}>{n.valor}</Text>
                  <StatusPill label={n.status} color={n.sc} bg={n.sd} />
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
