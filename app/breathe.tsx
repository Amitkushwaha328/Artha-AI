import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Animated, Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, radius, type } from '../theme';

const PHASES = [
  { label: 'INHALE',   count: 4, color: colors.accent  },
  { label: 'HOLD',     count: 4, color: colors.amber   },
  { label: 'EXHALE',   count: 6, color: colors.success },
  { label: 'HOLD',     count: 4, color: colors.amber   },
];
const TOTAL_CYCLES = 5;

export default function BreatheScreen() {
  const nav = useNavigation<any>();
  const [running, setRunning]       = useState(false);
  const [phase, setPhase]           = useState(0);
  const [count, setCount]           = useState(PHASES[0].count);
  const [cycle, setCycle]           = useState(0);

  const scale      = useRef(new Animated.Value(1)).current;
  const outerGlow  = useRef(new Animated.Value(0)).current;
  const timerRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const animRef    = useRef<Animated.CompositeAnimation | null>(null);

  const stopAll = () => {
    timerRef.current && clearInterval(timerRef.current);
    animRef.current?.stop();
    scale.setValue(1);
    outerGlow.setValue(0);
  };

  const runPhase = (p: number) => {
    const { count: dur } = PHASES[p];
    const isExpand = p === 0 || p === 1;

    animRef.current = Animated.parallel([
      Animated.timing(scale, {
        toValue: isExpand ? 1.3 : 0.85,
        duration: dur * 1000,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(outerGlow, {
        toValue: isExpand ? 1 : 0,
        duration: dur * 1000,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
    ]);
    animRef.current.start();
  };

  useEffect(() => {
    if (!running) { stopAll(); return; }
    let p = 0, c = PHASES[0].count, cyc = 0;
    setPhase(0); setCount(PHASES[0].count); setCycle(0);
    runPhase(0);

    timerRef.current = setInterval(() => {
      c -= 1;
      setCount(c);
      if (c <= 0) {
        p = (p + 1) % PHASES.length;
        if (p === 0) {
          cyc += 1;
          setCycle(cyc);
          if (cyc >= TOTAL_CYCLES) { setRunning(false); return; }
        }
        setPhase(p);
        c = PHASES[p].count;
        setCount(c);
        runPhase(p);
      }
    }, 1000);

    return stopAll;
  }, [running]);

  const cur = PHASES[phase];

  const glowOpacity = outerGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 0.7],
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => nav.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Breathe</Text>
          <Text style={styles.headerSub}>4-4-6 Box Breathing</Text>
        </View>
        <View style={{ width: 22 }} />
      </View>

      {/* ── MAIN CIRCLE ── */}
      <View style={styles.centerWrap}>
        {/* Outer glow ring */}
        <Animated.View style={[styles.outerGlow, { opacity: glowOpacity, borderColor: cur.color }]} />

        {/* Pulsing circle */}
        <Animated.View style={[styles.circle, { transform: [{ scale }], borderColor: cur.color }]}>
          <Text style={[styles.phaseLabel, { color: cur.color }]}>{cur.label}</Text>
          <Text style={[type.currencyHero, { color: cur.color, fontSize: 64, lineHeight: 70 }]}>{count}</Text>
        </Animated.View>

        {/* Instruction */}
        <Text style={styles.instruction}>
          Breathe in for 4... Hold for 4... Breathe out for 6...
        </Text>

        {/* Cycle dots */}
        <View style={styles.dots}>
          {Array.from({ length: TOTAL_CYCLES }).map((_, i) => (
            <View key={i} style={[styles.dot, i < cycle && { backgroundColor: colors.accent }]} />
          ))}
        </View>
      </View>

      {/* ── BOTTOM CARD ── */}
      <View style={styles.bottomCard}>
        <Text style={styles.bottomText}>
          💛 Financial anxiety is real. This moment of calm{'\n'}
          helps your brain make better money decisions.
        </Text>
      </View>

      {/* ── START / PAUSE ── */}
      <View style={styles.btnWrap}>
        <TouchableOpacity
          style={[styles.startBtn, { backgroundColor: running ? colors.s2 : colors.accent }]}
          onPress={() => setRunning(r => !r)}
          activeOpacity={0.85}
        >
          <Ionicons name={running ? 'pause' : 'play'} size={20} color="#fff" />
          <Text style={styles.startLabel}>{running ? 'Pause' : 'Start Breathing'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const CIRCLE_SIZE = 200;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.containerMargin,
    paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
    backgroundColor: 'rgba(10,10,15,0.70)',
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle:  { ...type.headline },
  headerSub:    { ...type.bodySm, color: colors.muted, marginTop: 2 },

  centerWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
    paddingHorizontal: spacing.containerMargin,
  },

  outerGlow: {
    position: 'absolute',
    width: CIRCLE_SIZE + 60,
    height: CIRCLE_SIZE + 60,
    borderRadius: (CIRCLE_SIZE + 60) / 2,
    borderWidth: 2,
    borderStyle: 'dashed',
  },

  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: colors.s2,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },

  phaseLabel: { ...type.label, fontSize: 13, letterSpacing: 2 },

  instruction: {
    ...type.bodySm,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 22,
  },

  dots:  { flexDirection: 'row', gap: spacing.sm },
  dot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: colors.border,
    borderWidth: 1, borderColor: colors.muted,
  },

  bottomCard: {
    marginHorizontal: spacing.containerMargin,
    backgroundColor: colors.s1,
    borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.base,
    marginBottom: spacing.md,
  },
  bottomText: {
    ...type.bodySm,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 22,
  },

  btnWrap: {
    paddingHorizontal: spacing.containerMargin,
    paddingBottom: spacing.xxl,
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.xl,
    paddingVertical: 16,
  },
  startLabel: { ...type.bodyLg, color: '#fff', fontFamily: 'Inter_600SemiBold' },
});
