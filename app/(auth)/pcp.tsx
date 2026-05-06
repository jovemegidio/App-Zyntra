import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/lib/constants';
import { Card, SectionLabel, ScreenHeader, KPICard, StatusPill, IconPlus } from '@/components/ui';

export default function PCPScreen() {
  const ordens = [
    { op: 'OP-2401', prod: 'Perfil 45x90', qtd: '500 kg', prog: 75, status: 'Em producao', sc: Colors.yellow, sd: Colors.yellowDim },
    { op: 'OP-2402', prod: 'Tubo Ret. 40x20', qtd: '300 kg', prog: 40, status: 'Em producao', sc: Colors.yellow, sd: Colors.yellowDim },
    { op: 'OP-2403', prod: 'Chapa 3mm', qtd: '1.200 kg', prog: 100, status: 'Concluida', sc: Colors.green, sd: Colors.greenDim },
    { op: 'OP-2404', prod: 'Barra Chata 3/16', qtd: '800 kg', prog: 10, status: 'Iniciando', sc: Colors.accent, sd: Colors.accentDim },
    { op: 'OP-2405', prod: 'Cantoneira 1.1/4', qtd: '450 kg', prog: 0, status: 'Aguardando', sc: Colors.muted, sd: Colors.surface },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }} edges={['top']}>
      <ScreenHeader
        title="PCP"
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
          <KPICard title="OP em andamento" value="15" color={Colors.yellow} spark={[10, 12, 11, 14, 13, 15, 14, 16, 15, 15]} style={{ flex: 1 }} />
          <KPICard title="Eficiencia" value="87%" change="+3%" up={true} color={Colors.green} spark={[80, 82, 81, 84, 83, 85, 84, 86, 85, 87]} style={{ flex: 1 }} />
        </View>

        {/* Ordens de Producao */}
        <View>
          <SectionLabel text="Ordens de Producao" />
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            {ordens.map((o, i) => (
              <View key={i} style={{ padding: 11, paddingHorizontal: 14, borderBottomWidth: i < ordens.length - 1 ? 1 : 0, borderBottomColor: Colors.border }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.text }}>{o.op}</Text>
                    <Text style={{ fontSize: 12, color: Colors.muted }}> — {o.prod}</Text>
                  </View>
                  <StatusPill label={o.status} color={o.sc} bg={o.sd} />
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={{ flex: 1, height: 5, backgroundColor: Colors.surface, borderRadius: 4, overflow: 'hidden' }}>
                    <View style={{ width: `${o.prog}%`, height: '100%', backgroundColor: o.sc, borderRadius: 4 }} />
                  </View>
                  <Text style={{ fontSize: 11, fontWeight: '600', color: o.sc, width: 30, textAlign: 'right' }}>{o.prog}%</Text>
                </View>
                <Text style={{ fontSize: 11, color: Colors.muted, marginTop: 3 }}>{o.qtd}</Text>
              </View>
            ))}
          </Card>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
