import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, MODULES } from '@/lib/constants';
import { ModuleIcon } from '@/components/ui';

export default function ModulosScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }} edges={['top']}>
      {/* Header */}
      <View style={{ paddingHorizontal: 18, paddingTop: 14, paddingBottom: 10 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', color: Colors.text, letterSpacing: -0.3 }}>
          Modulos
        </Text>
        <Text style={{ fontSize: 13, color: Colors.muted, marginTop: 2 }}>
          Plataforma ERP Zyntra
        </Text>
      </View>

      {/* Modules Grid */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 14, paddingTop: 8 }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {MODULES.map((m) => (
            <TouchableOpacity
              key={m.id}
              onPress={() => router.push(`/(auth)/${m.id}` as any)}
              activeOpacity={0.7}
              style={{
                width: '48%',
                backgroundColor: Colors.card,
                borderWidth: 1,
                borderColor: Colors.border,
                borderRadius: 18,
                padding: 20,
                paddingHorizontal: 16,
                gap: 10,
              }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 13,
                  backgroundColor: m.dim,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ModuleIcon id={m.id} size={22} color={m.color} />
              </View>
              <View>
                <Text style={{ fontSize: 15, fontWeight: '700', color: Colors.text }}>{m.label}</Text>
                <Text style={{ fontSize: 11, color: Colors.muted, marginTop: 2 }}>{m.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
