import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  TextInput,
  Animated,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/lib/auth';
import { Colors, COMPANIES, Logos, getAvatarUrl } from '@/lib/constants';
import { Button } from '@/components/ui';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import type { User } from '@/types';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ─── tipos ────────────────────────────────────────────────────
type TabType = 'email' | 'cpf';
type CompanyKey = keyof typeof COMPANIES | 'neutral';

// ─── overlay de boas-vindas ───────────────────────────────────
function WelcomeOverlay({ user, visible }: { user: User | null; visible: boolean }) {
  const scale = useRef(new Animated.Value(0.7)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const bgOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(bgOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, friction: 6, tension: 100, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 350, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  if (!visible || !user) return null;

  const displayName = user.apelido || user.nome?.split(' ')[0] || 'Colaborador';
  const avatarUrl = getAvatarUrl(user.avatar || user.foto);
  const initials = (user.nome || 'C').split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Bom dia';
    if (h < 18) return 'Boa tarde';
    return 'Boa noite';
  })();

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        width: SCREEN_W, height: SCREEN_H,
        backgroundColor: 'rgba(15,22,45,0.88)',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: bgOpacity,
        zIndex: 999,
      }}
    >
      <Animated.View
        style={{
          backgroundColor: Colors.card,
          borderRadius: 22,
          paddingVertical: 36,
          paddingHorizontal: 40,
          alignItems: 'center',
          gap: 14,
          width: SCREEN_W * 0.78,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.3,
          shadowRadius: 24,
          elevation: 20,
          transform: [{ scale }],
          opacity,
        }}
      >
        {/* Avatar */}
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            style={{ width: 80, height: 80, borderRadius: 20, backgroundColor: Colors.surface }}
            resizeMode="cover"
          />
        ) : (
          <View
            style={{
              width: 80, height: 80, borderRadius: 20,
              backgroundColor: Colors.accent,
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 30, fontWeight: '700', color: '#fff' }}>{initials}</Text>
          </View>
        )}

        {/* Saudação */}
        <View style={{ alignItems: 'center', gap: 4 }}>
          <Text style={{ fontSize: 13, color: Colors.muted, fontWeight: '500' }}>{greeting},</Text>
          <Text style={{ fontSize: 24, fontWeight: '800', color: Colors.text, letterSpacing: -0.5, textAlign: 'center' }}>
            {displayName}!
          </Text>
        </View>

        <View
          style={{
            paddingVertical: 6,
            paddingHorizontal: 16,
            backgroundColor: Colors.greenDim,
            borderRadius: 999,
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: '600', color: Colors.green }}>
            Acesso liberado ✓
          </Text>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

interface CompanyConfig {
  id: CompanyKey;
  name: string;
  logo: any;
}

// ─── utilitários ─────────────────────────────────────────────
function detectCompany(email: string): CompanyKey {
  const at = email.lastIndexOf('@');
  if (at === -1) return 'neutral';
  const domain = email.slice(at + 1).toLowerCase().trim();
  if (domain.length < 2) return 'neutral';
  if (domain.endsWith('aluforce.ind.br')) return 'aluforce';
  if (domain.endsWith('labor.com.br')) return 'labor';
  return 'neutral';
}

function formatCpf(raw: string) {
  const d = raw.replace(/\D/g, '').slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

// ─── icons inline ────────────────────────────────────────────
function IconMail({ size = 16, color = '#60708c' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="2" y="4" width="20" height="16" rx="2" stroke={color} strokeWidth="1.8" />
      <Path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}

function IconUser({ size = 16, color = '#60708c' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="7" r="4" stroke={color} strokeWidth="1.8" />
      <Path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}

function IconLock({ size = 16, color = '#60708c' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="11" width="18" height="11" rx="2" stroke={color} strokeWidth="1.8" />
      <Path d="M7 11V7a5 5 0 0 1 10 0v4" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}

function IconEye({ open = true, size = 16, color = '#60708c' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {open ? (
        <>
          <Path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" stroke={color} strokeWidth="1.8" />
          <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.8" />
        </>
      ) : (
        <>
          <Path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49M14.084 14.158a3 3 0 0 1-4.242-4.242M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143M2 2l20 20" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
        </>
      )}
    </Svg>
  );
}

function IconShield({ size = 13, color = '#19295e' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1Z" stroke={color} strokeWidth="1.8" />
    </Svg>
  );
}

function IconArrow({ size = 16, color = '#fff' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M5 12h14M12 5l7 7-7 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ─── componente de campo ──────────────────────────────────────
interface FieldInputProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  keyboardType?: TextInput['props']['keyboardType'];
  autoCapitalize?: TextInput['props']['autoCapitalize'];
  secure?: boolean;
  showPass?: boolean;
  onTogglePass?: () => void;
  leftIcon: React.ReactNode;
  focused: boolean;
  onFocus: () => void;
  onBlur: () => void;
}

function FieldInput({
  label, value, onChange, placeholder, keyboardType = 'default',
  autoCapitalize = 'none', secure = false, showPass, onTogglePass,
  leftIcon, focused, onFocus, onBlur,
}: FieldInputProps) {
  return (
    <View style={{ gap: 5 }}>
      <Text style={{ fontSize: 13.5, fontWeight: '500', color: Colors.text }}>{label}</Text>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          height: 46,
          backgroundColor: Colors.card,
          borderRadius: 9,
          borderWidth: focused ? 1.5 : 1,
          borderColor: focused ? Colors.accent : Colors.border,
          paddingHorizontal: 12,
          gap: 10,
          shadowColor: focused ? Colors.accent : 'transparent',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: focused ? 0.12 : 0,
          shadowRadius: 8,
          elevation: focused ? 2 : 0,
        }}
      >
        {leftIcon}
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={Colors.muted}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          secureTextEntry={secure && !showPass}
          onFocus={onFocus}
          onBlur={onBlur}
          style={{ flex: 1, fontSize: 15, color: Colors.text, padding: 0 }}
          autoCorrect={false}
        />
        {secure && onTogglePass && (
          <TouchableOpacity onPress={onTogglePass} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <IconEye open={!!showPass} size={17} color={Colors.muted} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ─── tela principal ───────────────────────────────────────────
export default function LoginScreen() {
  const { login, loginWithBiometrics, checkBiometrics, isLoading } = useAuth();

  const [tab, setTab] = useState<TabType>('email');
  const [field, setField] = useState('');
  const [senha, setSenha] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [focusedField, setFocusedField] = useState<'id' | 'pw' | null>(null);
  const [canUseBiometrics, setCanUseBiometrics] = useState(false);
  const [success, setSuccess] = useState(false);
  const [company, setCompany] = useState<CompanyKey>('neutral');
  const [welcomeUser, setWelcomeUser] = useState<User | null>(null);

  // fade animado ao trocar empresa
  const logoOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    checkBiometrics().then(setCanUseBiometrics);
  }, []);

  const handleFieldChange = (value: string) => {
    const formatted = tab === 'cpf' ? formatCpf(value) : value;
    setField(formatted);
    if (tab === 'email') {
      const detected = detectCompany(value);
      if (detected !== company) {
        Animated.sequence([
          Animated.timing(logoOpacity, { toValue: 0, duration: 150, useNativeDriver: true }),
          Animated.timing(logoOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        ]).start();
        setCompany(detected);
      }
    }
  };

  const handleTabChange = (t: TabType) => {
    setTab(t);
    setField('');
    setCompany('neutral');
  };

  const getLogoSource = () => {
    if (company === 'aluforce') return Logos.aluforceAzul;
    if (company === 'labor') return Logos.laborAzul;
    return Logos.aluforceAzul;
  };

  const getCompanyName = () => {
    if (company === 'aluforce') return COMPANIES.aluforce.name;
    if (company === 'labor') return COMPANIES.labor.name;
    return 'Grupo Corporativo';
  };

  const handleLogin = async () => {
    if (!field.trim() || !senha.trim()) {
      Alert.alert('Campos obrigatórios', 'Preencha o e-mail/CPF e a senha.');
      return;
    }
    try {
      const credentials = { email: field.trim(), password: senha };
      const response = await login(credentials);
      if (response.success) {
        setSuccess(true);
        if (response.user) setWelcomeUser(response.user as User);
        setTimeout(() => router.replace('/(auth)'), 2200);
      } else {
        Alert.alert('Acesso negado', response.message || 'Credenciais inválidas.');
      }
    } catch (error: any) {
      Alert.alert('Acesso negado', error?.message || 'Credenciais inválidas. Tente novamente.');
    }
  };

  const handleBiometricLogin = async () => {
    try {
      await loginWithBiometrics();
      setSuccess(true);
      setTimeout(() => router.replace('/(auth)'), 2200);
    } catch (error: any) {
      Alert.alert('Erro', error?.message || 'Falha na autenticação biométrica.');
    }
  };

  const primary = Colors.accent; // #19295e

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }}>
      <WelcomeOverlay user={welcomeUser} visible={success} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Logo / cabeçalho ── */}
          <View style={{ alignItems: 'center', marginBottom: 32 }}>
            <Animated.View style={{ opacity: logoOpacity, marginBottom: 16 }}>
              <Image
                source={getLogoSource()}
                style={{ height: 44, width: 180 }}
                resizeMode="contain"
              />
            </Animated.View>

            {/* Badge "Acesso restrito" */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
                borderWidth: 1,
                borderColor: Colors.border,
                backgroundColor: Colors.surface,
                borderRadius: 999,
                paddingVertical: 4,
                paddingHorizontal: 12,
                marginBottom: 10,
              }}
            >
              <IconShield size={12} color={primary} />
              <Text style={{ fontSize: 10, fontWeight: '700', color: Colors.muted, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                Acesso restrito a colaboradores
              </Text>
            </View>

            <Text style={{ fontSize: 22, fontWeight: '700', color: Colors.text, letterSpacing: -0.4, textAlign: 'center' }}>
              Acesso ao sistema
            </Text>
            <Text style={{ fontSize: 13.5, color: Colors.muted, marginTop: 4, textAlign: 'center', lineHeight: 20 }}>
              Use suas credenciais corporativas —{' '}
              <Text style={{ color: Colors.text, fontWeight: '500' }}>{getCompanyName()}</Text>
            </Text>
          </View>

          {/* ── Card do formulário ── */}
          <View
            style={{
              backgroundColor: Colors.card,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: Colors.border,
              padding: 20,
              shadowColor: '#1e2a42',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.07,
              shadowRadius: 12,
              elevation: 3,
              gap: 18,
            }}
          >
            {/* Tabs E-mail / CPF */}
            <View
              style={{
                flexDirection: 'row',
                backgroundColor: Colors.surface,
                borderRadius: 8,
                padding: 3,
                gap: 3,
              }}
            >
              {(['email', 'cpf'] as TabType[]).map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => handleTabChange(t)}
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    paddingVertical: 8,
                    borderRadius: 6,
                    backgroundColor: tab === t ? Colors.card : 'transparent',
                    shadowColor: tab === t ? '#000' : 'transparent',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: tab === t ? 0.08 : 0,
                    shadowRadius: 3,
                    elevation: tab === t ? 1 : 0,
                  }}
                >
                  {t === 'email'
                    ? <IconMail size={14} color={tab === t ? primary : Colors.muted} />
                    : <IconUser size={14} color={tab === t ? primary : Colors.muted} />}
                  <Text
                    style={{
                      fontSize: 13.5,
                      fontWeight: '500',
                      color: tab === t ? Colors.text : Colors.muted,
                    }}
                  >
                    {t === 'email' ? 'E-mail' : 'CPF'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Campo identificação */}
            <FieldInput
              label={tab === 'email' ? 'E-mail corporativo' : 'CPF'}
              value={field}
              onChange={handleFieldChange}
              placeholder={tab === 'email' ? 'voce@empresa.com.br' : '000.000.000-00'}
              keyboardType={tab === 'email' ? 'email-address' : 'numeric'}
              leftIcon={
                tab === 'email'
                  ? <IconMail size={16} color={focusedField === 'id' ? primary : Colors.muted} />
                  : <IconUser size={16} color={focusedField === 'id' ? primary : Colors.muted} />
              }
              focused={focusedField === 'id'}
              onFocus={() => setFocusedField('id')}
              onBlur={() => setFocusedField(null)}
            />

            {/* Campo senha */}
            <View style={{ gap: 5 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 13.5, fontWeight: '500', color: Colors.text }}>Senha</Text>
                <TouchableOpacity onPress={() => router.push('/(public)/recuperar-senha')}>
                  <Text style={{ fontSize: 12.5, fontWeight: '500', color: primary }}>Esqueceu a senha?</Text>
                </TouchableOpacity>
              </View>
              <FieldInput
                label=""
                value={senha}
                onChange={setSenha}
                placeholder="Digite sua senha"
                secure
                showPass={showPass}
                onTogglePass={() => setShowPass((p) => !p)}
                leftIcon={<IconLock size={16} color={focusedField === 'pw' ? primary : Colors.muted} />}
                focused={focusedField === 'pw'}
                onFocus={() => setFocusedField('pw')}
                onBlur={() => setFocusedField(null)}
              />
            </View>

            {/* Botão entrar */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={isLoading || success}
              activeOpacity={0.88}
              style={{
                height: 48,
                borderRadius: 9,
                backgroundColor: success ? Colors.green : primary,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                opacity: isLoading || success ? 0.85 : 1,
                shadowColor: primary,
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.22,
                shadowRadius: 10,
                elevation: 4,
              }}
            >
              <Text style={{ fontSize: 15.5, fontWeight: '700', color: '#fff', letterSpacing: 0.1 }}>
                {isLoading ? 'Entrando...' : success ? 'Acesso liberado!' : 'Entrar'}
              </Text>
              {!isLoading && !success && <IconArrow size={16} color="#fff" />}
            </TouchableOpacity>

            {/* Biometria */}
            {canUseBiometrics && (
              <>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{ flex: 1, height: 1, backgroundColor: Colors.border }} />
                  <Text style={{ fontSize: 11.5, color: Colors.muted }}>ou acesse com</Text>
                  <View style={{ flex: 1, height: 1, backgroundColor: Colors.border }} />
                </View>
                <TouchableOpacity
                  onPress={handleBiometricLogin}
                  activeOpacity={0.8}
                  style={{
                    height: 44,
                    borderRadius: 9,
                    borderWidth: 1,
                    borderColor: Colors.border,
                    backgroundColor: Colors.surface,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontSize: 14, fontWeight: '500', color: Colors.textSoft }}>
                    Face ID / Touch ID
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Logos das empresas */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 20, marginTop: 28 }}>
            <Image source={Logos.aluforceAzul} style={{ height: 22, width: 90 }} resizeMode="contain" />
            <View style={{ width: 1, height: 20, backgroundColor: Colors.border }} />
            <Image source={Logos.laborAzul} style={{ height: 20, width: 70 }} resizeMode="contain" />
            <Image source={Logos.energyAzul} style={{ height: 20, width: 70 }} resizeMode="contain" />
          </View>

          {/* Footer */}
          <Text style={{ textAlign: 'center', fontSize: 11, color: Colors.muted, marginTop: 20 }}>
            © 2026 Zyntra · Sistema interno · Uso autorizado
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
