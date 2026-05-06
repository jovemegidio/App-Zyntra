import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/lib/constants';
import { Card, SectionLabel, ScreenHeader, StatusPill, IconPlus } from '@/components/ui';

export default function FinanceiroScreen() {
  const meses = ['Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const rec = [82, 95, 88, 110, 98, 124];
  const pag = [60, 72, 65, 80, 74, 91];
  const maxVal = Math.max(...rec);

  const contasReceber = [
    { cli: 'Empresa Alpha Ltda', venc: '03/06', valor: 'R$ 28.400', status: 'Vencendo', sc: Colors.yellow, sd: Colors.yellowDim },
    { cli: 'Grupo Beta S.A.', venc: '10/06', valor: 'R$ 15.200', status: 'A Vencer', sc: Colors.green, sd: Colors.greenDim },
    { cli: 'Ind. Gama Ltda', venc: '18/06', valor: 'R$ 42.000', status: 'A Vencer', sc: Colors.green, sd: Colors.greenDim },
    { cli: 'Com. Delta Eireli', venc: '28/05', valor: 'R$ 9.800', status: 'Vencida', sc: Colors.red, sd: Colors.redDim },
  ];

  const dre = [
    { label: 'Receita Bruta', value: 'R$ 1.240.000', color: Colors.text },
    { label: '(-) Deducoes', value: '- R$ 124.000', color: Colors.red },
    { label: 'Receita Liquida', value: 'R$ 1.116.000', color: Colors.text },
    { label: '(-) CMV', value: '- R$ 620.000', color: Colors.red },
    { label: 'Lucro Bruto', value: 'R$ 496.000', color: Colors.green, highlight: true },
    { label: '(-) Despesas Op.', value: '- R$ 248.000', color: Colors.red },
    { label: 'Lucro Liquido', value: 'R$ 248.000', color: Colors.accent, highlight: true },
  ];

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

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 14, paddingTop: 8, gap: 14 }}>
        {/* Saldo cards */}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {[
            { label: 'Saldo', value: 'R$ 342K', color: Colors.text },
            { label: 'A Receber', value: 'R$ 124K', color: Colors.green },
            { label: 'A Pagar', value: 'R$ 91K', color: Colors.red },
          ].map((c, i) => (
            <Card key={i} style={{ flex: 1, padding: 12, alignItems: 'center' }}>
              <Text style={{ fontSize: 9.5, color: Colors.muted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 5 }}>
                {c.label}
              </Text>
              <Text style={{ fontSize: 13, fontWeight: '700', color: c.color }}>{c.value}</Text>
            </Card>
          ))}
        </View>

        {/* Fluxo de caixa */}
        <View>
          <SectionLabel text="Fluxo de Caixa — 6 meses" />
          <Card style={{ padding: 14 }}>
            <View style={{ flexDirection: 'row', gap: 16, marginBottom: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: Colors.accent }} />
                <Text style={{ fontSize: 11, color: Colors.muted }}>Receita</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: Colors.red }} />
                <Text style={{ fontSize: 11, color: Colors.muted }}>Despesa</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 6, alignItems: 'flex-end', height: 80 }}>
              {meses.map((m, i) => (
                <View key={i} style={{ flex: 1, alignItems: 'center', gap: 3 }}>
                  <View style={{ width: '100%', flexDirection: 'row', gap: 2, alignItems: 'flex-end', height: 60 }}>
                    <View style={{ flex: 1, backgroundColor: Colors.accent, borderTopLeftRadius: 3, borderTopRightRadius: 3, height: (rec[i] / maxVal) * 60, opacity: 0.85 }} />
                    <View style={{ flex: 1, backgroundColor: Colors.red, borderTopLeftRadius: 3, borderTopRightRadius: 3, height: (pag[i] / maxVal) * 60, opacity: 0.7 }} />
                  </View>
                  <Text style={{ fontSize: 9, color: Colors.muted }}>{m}</Text>
                </View>
              ))}
            </View>
          </Card>
        </View>

        {/* Contas a Receber */}
        <View>
          <SectionLabel text="Contas a Receber" />
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            {contasReceber.map((r, i) => (
              <View
                key={i}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 12,
                  paddingHorizontal: 14,
                  borderBottomWidth: i < contasReceber.length - 1 ? 1 : 0,
                  borderBottomColor: Colors.border,
                }}
              >
                <View>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.text }}>{r.cli}</Text>
                  <Text style={{ fontSize: 11, color: Colors.muted, marginTop: 2 }}>Venc: {r.venc}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.text }}>{r.valor}</Text>
                  <StatusPill label={r.status} color={r.sc} bg={r.sd} />
                </View>
              </View>
            ))}
          </Card>
        </View>

        {/* DRE Resumo */}
        <View>
          <SectionLabel text="DRE — Dez/2025" />
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            {dre.map((r, i) => (
              <View
                key={i}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  padding: 10,
                  paddingHorizontal: 14,
                  borderBottomWidth: i < dre.length - 1 ? 1 : 0,
                  borderBottomColor: Colors.border,
                  backgroundColor: r.highlight ? Colors.accentGlow : 'transparent',
                }}
              >
                <Text style={{ fontSize: 13, color: Colors.textSoft }}>{r.label}</Text>
                <Text style={{ fontSize: 13, fontWeight: '600', color: r.color }}>{r.value}</Text>
              </View>
            ))}
          </Card>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
