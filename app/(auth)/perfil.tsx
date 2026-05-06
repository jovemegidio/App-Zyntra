import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth, setBiometricsEnabled, getBiometricsEnabled } from '@/lib/auth';
import { Colors, MODULES, APP_VERSION } from '@/lib/constants';
import { Card, SectionLabel, Row, Toggle, Badge, Button, IconChevron } from '@/components/ui';

export default function PerfilScreen() {
  const { user, logout } = useAuth();
  const [notifOn, setNotifOn] = useState(true);
  const [bioOn, setBioOn] = useState(true);
  const [darkOn, setDarkOn] = useState(true);

  const handleBioToggle = async () => {
    const newValue = !bioOn;
    setBioOn(newValue);
    await setBiometricsEnabled(newValue);
  };

  const handleLogout = () => {
    Alert.alert(
      'Sair da conta',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(public)/login');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }} edges={['top']}>
      {/* Header */}
      <View style={{ paddingHorizontal: 18, paddingTop: 14, paddingBottom: 10 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', color: Colors.text, letterSpacing: -0.3 }}>
          Perfil
        </Text>
      </View>

      {/* Content */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 14, paddingTop: 4, gap: 14 }}>
        {/* Avatar card */}
        <Card style={{ padding: 20, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              backgroundColor: Colors.accent,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: '700', color: '#fff' }}>AD</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 17, fontWeight: '700', color: Colors.text }}>
              {user?.nome || 'Administrador'}
            </Text>
            <Text style={{ fontSize: 13, color: Colors.muted, marginTop: 2 }}>
              {user?.email || 'ti@aluforce.ind.br'}
            </Text>
            <View style={{ marginTop: 6 }}>
              <Badge label="Super Admin" color={Colors.accent} bg={Colors.accentDim} />
            </View>
          </View>
          <IconChevron size={14} color={Colors.muted} />
        </Card>

        {/* Conta */}
        <View>
          <SectionLabel text="Conta" />
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <Row label="Empresa" value={user?.empresa || 'Aluforce'} />
            <Row label="Versao do app" value={APP_VERSION} />
            <Row label="Alterar senha" onPress={() => {}} right={<IconChevron size={13} color={Colors.muted} />} last />
          </Card>
        </View>

        {/* Preferencias */}
        <View>
          <SectionLabel text="Preferencias" />
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 13, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: Colors.border }}>
              <View>
                <Text style={{ fontSize: 14, color: Colors.textSoft }}>Notificacoes</Text>
                <Text style={{ fontSize: 11, color: Colors.muted, marginTop: 1 }}>Alertas e atualizacoes</Text>
              </View>
              <Toggle value={notifOn} onToggle={() => setNotifOn(!notifOn)} />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 13, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: Colors.border }}>
              <View>
                <Text style={{ fontSize: 14, color: Colors.textSoft }}>Face ID / Touch ID</Text>
                <Text style={{ fontSize: 11, color: Colors.muted, marginTop: 1 }}>Login biometrico</Text>
              </View>
              <Toggle value={bioOn} onToggle={handleBioToggle} />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 13, paddingHorizontal: 16 }}>
              <View>
                <Text style={{ fontSize: 14, color: Colors.textSoft }}>Tema escuro</Text>
              </View>
              <Toggle value={darkOn} onToggle={() => setDarkOn(!darkOn)} />
            </View>
          </Card>
        </View>

        {/* Modulos */}
        <View>
          <SectionLabel text="Acesso a Modulos" />
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            {MODULES.map((m, i) => (
              <View
                key={m.id}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 13,
                  paddingHorizontal: 16,
                  borderBottomWidth: i < MODULES.length - 1 ? 1 : 0,
                  borderBottomColor: Colors.border,
                }}
              >
                <Text style={{ fontSize: 14, color: Colors.textSoft }}>{m.label}</Text>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.green }} />
              </View>
            ))}
          </Card>
        </View>

        {/* Logout */}
        <Button variant="danger" onPress={handleLogout}>
          Sair da conta
        </Button>

        {/* Footer */}
        <Text style={{ textAlign: 'center', fontSize: 11, color: Colors.muted, paddingBottom: 4 }}>
          © 2026 Zyntra — Agencia do Japa
        </Text>

        {/* Bottom spacing */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
