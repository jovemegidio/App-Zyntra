import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, MODULES } from '@/lib/constants';
import { Badge, ModuleIcon } from '@/components/ui';

interface NotificationItem {
  titulo: string;
  msg: string;
  tempo: string;
  modulo: string;
  mc: string;
  unread: boolean;
}

export default function NotificacoesScreen() {
  const notifs: NotificationItem[] = [
    { titulo: 'Aprovacao pendente', msg: 'PO-0431 aguarda sua aprovacao — R$ 42.000', tempo: 'Agora', modulo: 'compras', mc: Colors.orange, unread: true },
    { titulo: 'NF-e rejeitada', msg: 'NF-001207 foi rejeitada pela SEFAZ. Verifique.', tempo: '15 min', modulo: 'faturamento', mc: Colors.red, unread: true },
    { titulo: 'Pedido aprovado', msg: 'Pedido #4821 aprovado por Carlos S. — R$ 12.540', tempo: '42 min', modulo: 'vendas', mc: Colors.green, unread: true },
    { titulo: 'OP-2403 concluida', msg: 'Ordem de producao OP-2403 finalizada com sucesso.', tempo: '1h', modulo: 'pcp', mc: Colors.yellow, unread: false },
    { titulo: 'Entrega concluida', msg: 'ENT-892 entregue em Sao Paulo — SP.', tempo: '2h', modulo: 'logistica', mc: Colors.teal, unread: false },
    { titulo: 'Colaborador admitido', msg: 'Ana Paula R. — Analista de RH ingressou hoje.', tempo: '3h', modulo: 'rh', mc: Colors.purple, unread: false },
    { titulo: 'Relatorio gerado', msg: 'DRE de Maio/2025 esta disponivel para download.', tempo: '5h', modulo: 'financeiro', mc: Colors.accent, unread: false },
    { titulo: 'Atualizacao do sistema', msg: 'Zyntra v2.8.1 instalada. Confira as novidades.', tempo: '1d', modulo: 'sistema', mc: Colors.mutedLight, unread: false },
  ];

  const [lidas, setLidas] = useState<number[]>([]);
  const markAll = () => setLidas(notifs.map((_, i) => i));

  const getModuleLabel = (moduleId: string) => {
    const mod = MODULES.find(m => m.id === moduleId);
    return mod?.label || moduleId.charAt(0).toUpperCase() + moduleId.slice(1);
  };

  const unreadCount = notifs.filter((n, i) => n.unread && !lidas.includes(i)).length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }} edges={['top']}>
      {/* Header */}
      <View style={{ paddingHorizontal: 18, paddingTop: 14, paddingBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View>
          <Text style={{ fontSize: 20, fontWeight: '700', color: Colors.text, letterSpacing: -0.3 }}>
            Notificacoes
          </Text>
          <Text style={{ fontSize: 13, color: Colors.muted, marginTop: 2 }}>
            {unreadCount} nao lidas
          </Text>
        </View>
        <TouchableOpacity
          onPress={markAll}
          style={{
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: Colors.border,
            borderRadius: 9,
            paddingVertical: 6,
            paddingHorizontal: 12,
          }}
        >
          <Text style={{ fontSize: 12, color: Colors.accent, fontWeight: '500' }}>Marcar lidas</Text>
        </TouchableOpacity>
      </View>

      {/* Notifications List */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 14, paddingTop: 4, gap: 8 }}>
        {notifs.map((n, i) => {
          const unread = n.unread && !lidas.includes(i);
          return (
            <TouchableOpacity
              key={i}
              onPress={() => setLidas((l) => [...l, i])}
              activeOpacity={0.7}
              style={{
                backgroundColor: unread ? Colors.card2 : Colors.card,
                borderWidth: 1,
                borderColor: unread ? Colors.borderLight : Colors.border,
                borderRadius: 14,
                padding: 13,
                paddingHorizontal: 14,
                flexDirection: 'row',
                gap: 12,
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: n.mc + '22',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ModuleIcon id={n.modulo} size={17} color={n.mc} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.text }}>{n.titulo}</Text>
                  <Text style={{ fontSize: 11, color: Colors.muted, marginLeft: 8 }}>{n.tempo}</Text>
                </View>
                <Text style={{ fontSize: 12, color: Colors.mutedLight, lineHeight: 18 }}>{n.msg}</Text>
                <View style={{ marginTop: 5 }}>
                  <Badge label={getModuleLabel(n.modulo)} color={n.mc} bg={n.mc + '22'} />
                </View>
              </View>
              {unread && (
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.accent, marginTop: 4 }} />
              )}
            </TouchableOpacity>
          );
        })}

        {/* Bottom spacing */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
