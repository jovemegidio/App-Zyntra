import { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing, StyleSheet, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { APP_VERSION } from '@/lib/constants';

// ─── Paleta do splash (variante escura — espelha o ícone do app) ───
const SPLASH = {
  bgTop: '#0b1020',
  bgBottom: '#090c14',
  light: '#eef2f9',
  lightDim: '#c3cbdc',
  blue: '#3b82f6',
  muted: '#6b7894',
  ring: 'rgba(59,130,246,0.10)',
};

const { width: SCREEN_W } = Dimensions.get('window');

// ─── Gerador de path da engrenagem (cog) ───
function buildGearPath(
  cx: number,
  cy: number,
  teeth: number,
  rOuter: number,
  rInner: number,
  toothRatio = 0.46,
) {
  const step = (Math.PI * 2) / teeth;
  const half = step / 2;
  const tTop = half * toothRatio;
  const P = (r: number, a: number) =>
    `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`;
  const pts: string[] = [];
  for (let i = 0; i < teeth; i++) {
    const c = i * step - Math.PI / 2;
    pts.push(P(rInner, c - half));
    pts.push(P(rOuter, c - tTop));
    pts.push(P(rOuter, c + tTop));
    pts.push(P(rInner, c + half));
  }
  return 'M' + pts.join(' L') + ' Z';
}

const GEAR_PATH = buildGearPath(80, 80, 9, 73, 55);

export function SplashScreen() {
  // valores animados
  const logoScale = useRef(new Animated.Value(0.7)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const gearSpin = useRef(new Animated.Value(0)).current;
  const wordOpacity = useRef(new Animated.Value(0)).current;
  const wordTranslate = useRef(new Animated.Value(14)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;
  const footerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // entrada do logo
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 6,
        tension: 70,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // rotação contínua e sutil da engrenagem
    Animated.loop(
      Animated.timing(gearSpin, {
        toValue: 1,
        duration: 14000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();

    // wordmark
    Animated.parallel([
      Animated.timing(wordOpacity, {
        toValue: 1,
        duration: 500,
        delay: 380,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(wordTranslate, {
        toValue: 0,
        duration: 600,
        delay: 380,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // tagline
    Animated.timing(taglineOpacity, {
      toValue: 1,
      duration: 500,
      delay: 640,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    // footer
    Animated.timing(footerOpacity, {
      toValue: 1,
      duration: 600,
      delay: 800,
      useNativeDriver: true,
    }).start();

    // barra de progresso
    Animated.timing(progress, {
      toValue: 1,
      duration: 2000,
      delay: 500,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, []);

  const spin = gearSpin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const barWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 180],
  });

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* leve sobreposição superior para profundidade */}
      <View style={styles.bgFill} />

      <View style={styles.center}>
        {/* glow sutil atrás do logo */}
        <View style={styles.glow} />

        <Animated.View
          style={{
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
            alignItems: 'center',
            justifyContent: 'center',
            width: 160,
            height: 160,
          }}
        >
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <Svg width={160} height={160} viewBox="0 0 160 160">
              <Defs>
                <LinearGradient id="gear" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor="#ffffff" />
                  <Stop offset="1" stopColor="#cbd5ea" />
                </LinearGradient>
              </Defs>
              <Path d={GEAR_PATH} fill="url(#gear)" />
              {/* anel interno escuro para destacar o Z */}
              <Circle cx="80" cy="80" r="42" fill={SPLASH.bgBottom} />
            </Svg>
          </Animated.View>

          {/* letra Z sobreposta (nítida, fora da rotação) */}
          <View style={styles.zWrap} pointerEvents="none">
            <Text style={styles.zLetter}>Z</Text>
          </View>
        </Animated.View>

        {/* wordmark */}
        <Animated.View
          style={{
            opacity: wordOpacity,
            transform: [{ translateY: wordTranslate }],
            marginTop: 26,
            alignItems: 'center',
          }}
        >
          <Text style={styles.wordmark}>ZYNTRA</Text>
        </Animated.View>

        <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
          Gestão Empresarial Integrada
        </Animated.Text>

        {/* barra de progresso */}
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { width: barWidth }]} />
        </View>
      </View>

      {/* rodapé */}
      <Animated.View style={[styles.footer, { opacity: footerOpacity }]}>
        <Text style={styles.footerBrand}>Aluforce · Grupo Labor</Text>
        <Text style={styles.footerVersion}>Versão {APP_VERSION}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SPLASH.bgBottom,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bgFill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: SPLASH.bgTop,
    opacity: 0.0,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: SPLASH.ring,
    top: '50%',
    marginTop: -190,
  },
  zWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zLetter: {
    fontSize: 50,
    fontWeight: '800',
    color: SPLASH.light,
    letterSpacing: 1,
    marginTop: -2,
  },
  wordmark: {
    fontSize: 34,
    fontWeight: '800',
    color: SPLASH.light,
    letterSpacing: 6,
  },
  tagline: {
    marginTop: 10,
    fontSize: 12.5,
    fontWeight: '500',
    color: SPLASH.lightDim,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  progressTrack: {
    marginTop: 40,
    width: 180,
    height: 3,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  progressFill: {
    height: 3,
    borderRadius: 3,
    backgroundColor: SPLASH.blue,
  },
  footer: {
    position: 'absolute',
    bottom: 44,
    alignItems: 'center',
  },
  footerBrand: {
    fontSize: 12,
    fontWeight: '600',
    color: SPLASH.lightDim,
    letterSpacing: 0.5,
  },
  footerVersion: {
    marginTop: 4,
    fontSize: 11,
    color: SPLASH.muted,
    letterSpacing: 0.5,
  },
});
