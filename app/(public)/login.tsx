import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/lib/auth';
import { Colors } from '@/lib/constants';
import { Button, Input, IconEye, IconBiometric } from '@/components/ui';

type TabType = 'email' | 'cpf';

export default function LoginScreen() {
  const { login, loginWithBiometrics, checkBiometrics, isLoading } = useAuth();
  
  const [tab, setTab] = useState<TabType>('email');
  const [field, setField] = useState('');
  const [senha, setSenha] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [canUseBiometrics, setCanUseBiometrics] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    checkBiometrics().then(setCanUseBiometrics);
  }, []);

  const handleLogin = async () => {
    if (!field.trim() || !senha.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    try {
      // API uses 'password' field, not 'senha'
      const credentials = { 
        email: field.trim(), 
        password: senha 
      };
      
      const response = await login(credentials);
      
      if (response.success) {
        setSuccess(true);
        
        // Check if password change is required
        if (response.forcePasswordChange) {
          Alert.alert(
            'Alterar Senha',
            'Sua senha precisa ser alterada. Acesse a versão web para atualizar.',
            [{ text: 'OK', onPress: () => router.replace('/(auth)') }]
          );
        } else {
          setTimeout(() => {
            router.replace('/(auth)');
          }, 500);
        }
      } else {
        Alert.alert('Erro', response.message || 'Falha no login');
      }
    } catch (error: any) {
      Alert.alert('Erro', error?.message || 'Falha no login. Verifique suas credenciais.');
    }
  };

  const handleBiometricLogin = async () => {
    try {
      await loginWithBiometrics();
      setSuccess(true);
      setTimeout(() => {
        router.replace('/(auth)');
      }, 500);
    } catch (error: any) {
      Alert.alert('Erro', error?.message || 'Falha na autenticacao biometrica.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 28 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Ambient glow effects */}
          <View
            style={{
              position: 'absolute',
              top: -100,
              left: '50%',
              marginLeft: -180,
              width: 360,
              height: 360,
              borderRadius: 180,
              backgroundColor: 'rgba(59,130,246,0.13)',
            }}
          />
          <View
            style={{
              position: 'absolute',
              bottom: -60,
              right: -60,
              width: 220,
              height: 220,
              borderRadius: 110,
              backgroundColor: 'rgba(168,85,247,0.08)',
            }}
          />

          {/* Logo */}
          <View style={{ alignItems: 'center', marginBottom: 36 }}>
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 20,
                backgroundColor: Colors.card,
                borderWidth: 1,
                borderColor: Colors.border,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: Colors.accent,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.18,
                shadowRadius: 32,
                elevation: 10,
              }}
            >
              <Text style={{ fontSize: 32, fontWeight: '800', color: Colors.accent }}>Z</Text>
            </View>
            <Text style={{ marginTop: 14, fontSize: 28, fontWeight: '700', color: Colors.text, letterSpacing: -0.5 }}>
              Zyntra
            </Text>
            <Text style={{ fontSize: 13, color: Colors.muted, marginTop: 2 }}>
              Plataforma ERP Completa
            </Text>
          </View>

          {/* Tab toggle */}
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: Colors.surface,
              borderRadius: 11,
              padding: 3,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: Colors.border,
            }}
          >
            {(['email', 'cpf'] as TabType[]).map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => setTab(t)}
                style={{
                  flex: 1,
                  paddingVertical: 8,
                  borderRadius: 9,
                  backgroundColor: tab === t ? Colors.accent : 'transparent',
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '700',
                    color: tab === t ? '#fff' : Colors.muted,
                    letterSpacing: 0.3,
                  }}
                >
                  {t.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Form */}
          <View style={{ gap: 11, marginBottom: 8 }}>
            <Input
              value={field}
              onChangeText={setField}
              placeholder={tab === 'email' ? 'E-mail corporativo' : 'CPF (000.000.000-00)'}
              keyboardType={tab === 'email' ? 'email-address' : 'numeric'}
              autoCapitalize="none"
            />
            <Input
              value={senha}
              onChangeText={setSenha}
              placeholder="Senha"
              secureTextEntry={!showPass}
              rightElement={
                <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                  <IconEye size={18} color={showPass ? Colors.accent : Colors.muted} />
                </TouchableOpacity>
              }
            />
          </View>

          {/* Remember me & forgot password */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
            <TouchableOpacity
              onPress={() => setRememberMe(!rememberMe)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
            >
              <View
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 5,
                  borderWidth: 1.5,
                  borderColor: rememberMe ? Colors.accent : Colors.border,
                  backgroundColor: rememberMe ? Colors.accent : Colors.surface,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {rememberMe && <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>✓</Text>}
              </View>
              <Text style={{ fontSize: 12, color: Colors.muted }}>Lembrar por 30 dias</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/(public)/recuperar-senha')}>
              <Text style={{ fontSize: 13, color: Colors.accent, fontWeight: '500' }}>Esqueceu a senha?</Text>
            </TouchableOpacity>
          </View>

          {/* Login button */}
          <Button
            onPress={handleLogin}
            loading={isLoading}
            disabled={isLoading || success}
            style={{
              backgroundColor: success ? Colors.green : Colors.accent,
              shadowColor: Colors.accent,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.3,
              shadowRadius: 24,
              elevation: 8,
            }}
          >
            {success ? 'Login realizado!' : 'Entrar'}
          </Button>

          {/* Divider */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 18 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: Colors.border }} />
            <Text style={{ fontSize: 12, color: Colors.muted }}>ou acesse com</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: Colors.border }} />
          </View>

          {/* Biometric button */}
          <Button
            variant="secondary"
            onPress={handleBiometricLogin}
            disabled={!canUseBiometrics}
            style={{ opacity: canUseBiometrics ? 1 : 0.5 }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <IconBiometric size={20} color={Colors.mutedLight} />
              <Text style={{ fontSize: 14, fontWeight: '500', color: Colors.textSoft }}>
                Face ID / Touch ID
              </Text>
            </View>
          </Button>
        </ScrollView>

        {/* Footer */}
        <View style={{ padding: 14, alignItems: 'center' }}>
          <Text style={{ fontSize: 11, color: Colors.muted }}>
            © 2026 Zyntra — Desenvolvido por Agencia do Japa
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
