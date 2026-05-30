import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificacoesApi } from '@/lib/api';
import { Colors, MODULES } from '@/lib/constants';
import { Badge, ModuleIcon } from '@/components/ui';
import type { Notification } from '@/types';

function getModuleLabel(moduleId?: string) {
  if (!moduleId) return 'Sistema';
  const mod = MODULES.find((m) => m.id === moduleId);
  return mod?.label ?? moduleId.charAt(0).toUpperCase() + moduleId.slice(1);
}

function getModuleColor(moduleId?: string) {
  const mod = MODULES.find((m) => m.id === moduleId);
  return mod?.color ?? Colors.mutedLight;
}

function tipoColor(tipo?: string) {
  switch (tipo) {
    case 'error':
      return Colors.red;
    case 'warning':
      return Colors.yellow;
    case 'success':
      return Colors.green;
    default:
      return Colors.accent;
  }
}

export default function NotificacoesScreen() {
  const queryClient = useQueryClient();

  const {
    data: notificacoes,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery<Notification[]>({
    queryKey: ['notificacoes'],
    queryFn: async () => {
      const res = await notificacoesApi.getAll({ limit: 30 });
      return Array.isArray(res) ? res : res?.data ?? [];
    },
    retry: 1,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: number) => notificacoesApi.markAsRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notificacoes'] }),
  });

  const markAllMutation = useMutation({
    mutationFn: () => notificacoesApi.markAllAsRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notificacoes'] }),
  });

  const items: Notification[] = notificacoes ?? [];
  const unreadCount = items.filter((n) => !n.lida).length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }} edges={['top']}>
      {/* Header */}
      <View style={{ paddingHorizontal: 18, paddingTop: 14, paddingBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View>
          <Text style={{ fontSize: 20, fontWeight: '700', color: Colors.text, letterSpacing: -0.3 }}>
            Notificacoes
          </Text>
          <Text style={{ fontSize: 13, color: Colors.muted, marginTop: 2 }}>
            {unreadCount > 0 ? `${unreadCount} nao lidas` : 'Todas lidas'}
          </Text>
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity
            onPress={() => markAllMutation.mutate()}
            disabled={markAllMutation.isPending}
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
        )}
      </View>

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator color={Colors.accent} />
        </View>
      ) : isError ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
          <Text style={{ color: Colors.red, fontSize: 14, textAlign: 'center' }}>
            Falha ao carregar notificacoes
          </Text>
          <TouchableOpacity onPress={() => refetch()} style={{ marginTop: 12 }}>
            <Text style={{ color: Colors.accent, fontSize: 13 }}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 14, paddingTop: 4, gap: 8 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={Colors.accent}
              colors={[Colors.accent]}
            />
          }
        >
          {items.length === 0 ? (
            <View style={{ paddingVertical: 48, alignItems: 'center' }}>
              <Text style={{ fontSize: 14, color: Colors.muted }}>Nenhuma notificacao</Text>
            </View>
          ) : (
            items.map((n) => {
              const modColor = getModuleColor((n as any).modulo);
              return (
                <TouchableOpacity
                  key={n.id}
                  onPress={() => !n.lida && markReadMutation.mutate(n.id)}
                  activeOpacity={0.7}
                  style={{
                    backgroundColor: !n.lida ? Colors.card2 : Colors.card,
                    borderWidth: 1,
                    borderColor: !n.lida ? Colors.borderLight : Colors.border,
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
                      backgroundColor: tipoColor(n.tipo) + '22',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <ModuleIcon id={(n as any).modulo ?? 'sistema'} size={17} color={tipoColor(n.tipo)} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
                      <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.text }}>{n.titulo}</Text>
                      <Text style={{ fontSize: 11, color: Colors.muted, marginLeft: 8 }}>
                        {new Date(n.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 12, color: Colors.mutedLight, lineHeight: 18 }}>{n.mensagem}</Text>
                    <View style={{ marginTop: 5 }}>
                      <Badge
                        label={getModuleLabel((n as any).modulo)}
                        color={modColor}
                        bg={modColor + '22'}
                      />
                    </View>
                  </View>
                  {!n.lida && (
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.accent, marginTop: 4 }} />
                  )}
                </TouchableOpacity>
              );
            })
          )}
          <View style={{ height: 20 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
