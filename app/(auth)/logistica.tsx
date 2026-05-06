import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { Colors } from '@/lib/constants';
import { Card, SectionLabel, ScreenHeader, StatusPill, IconFilter } from '@/components/ui';

export default function LogisticaScreen() {
  const entregas = [
    { id: 'ENT-892', dest: 'Sao Paulo — SP', transp: 'LogFast', status: 'Concluida', sc: Colors.green, sd: Colors.greenDim },
    { id: 'ENT-893', dest: 'Campinas — SP', transp: 'RapidLog', status: 'Em rota', sc: Colors.yellow, sd: Colors.yellowDim },
    { id: 'ENT-894', dest: 'Santos — SP', transp: 'TransSul', status: 'Em rota', sc: Colors.yellow, sd: Colors.yellowDim },
    { id: 'ENT-895', dest: 'Ribeirao Preto', transp: 'LogFast', status: 'Aguardando', sc: Colors.muted, sd: Colors.surface },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }} edges={['top']}>
      <ScreenHeader
        title="Logistica"
        onBack={() => router.back()}
        right={
          <TouchableOpacity>
            <IconFilter size={18} color={Colors.accent} />
          </TouchableOpacity>
        }
      />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 14, paddingTop: 8, gap: 14 }}>
        {/* KPIs */}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {[
            { label: 'Entregas', value: '22', color: Colors.teal },
            { label: 'Em rota', value: '14', color: Colors.yellow },
            { label: 'Concluidas', value: '8', color: Colors.green },
          ].map((k, i) => (
            <Card key={i} style={{ flex: 1, padding: 12, alignItems: 'center' }}>
              <Text style={{ fontSize: 9, color: Colors.muted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                {k.label}
              </Text>
              <Text style={{ fontSize: 22, fontWeight: '700', color: k.color }}>{k.value}</Text>
            </Card>
          ))}
        </View>

        {/* Mapa placeholder */}
        <Card style={{ height: 120, alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
            <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke={Colors.teal} strokeWidth="1.7" />
            <Circle cx="12" cy="9" r="2.5" stroke={Colors.teal} strokeWidth="1.5" />
          </Svg>
          <Text style={{ fontSize: 12, color: Colors.muted }}>Mapa de Rotas</Text>
        </Card>

        {/* Entregas do Dia */}
        <View>
          <SectionLabel text="Entregas do Dia" />
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            {entregas.map((e, i) => (
              <View
                key={i}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 12,
                  paddingHorizontal: 14,
                  borderBottomWidth: i < entregas.length - 1 ? 1 : 0,
                  borderBottomColor: Colors.border,
                }}
              >
                <View>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.text }}>{e.id}</Text>
                  <Text style={{ fontSize: 11, color: Colors.muted, marginTop: 1 }}>{e.dest} · {e.transp}</Text>
                </View>
                <StatusPill label={e.status} color={e.sc} bg={e.sd} />
              </View>
            ))}
          </Card>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
