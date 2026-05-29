import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { colors, radius } from '../theme';
import { spacing } from '../theme';

interface Props {
  amount: number;
  percentUsed: number;
  onPress?: () => void;
}

export function SafeToSpendCard({ amount, percentUsed, onPress }: Props) {
  const pulse = useRef(new Animated.Value(1)).current;
  const countAnim = useRef(new Animated.Value(0)).current;

  // Pulse animation on the live dot
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.6, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const color =
    amount < 2000 ? colors.red :
    amount < 5000 ? colors.amber :
    colors.green;

  const clampedPercent = Math.min(100, Math.max(0, percentUsed));

  return (
    <Pressable style={styles.card} onPress={onPress}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.pulseWrapper}>
          <Animated.View style={[styles.pulseDot, { backgroundColor: color, transform: [{ scale: pulse }] }]} />
          <View style={[styles.coreDot, { backgroundColor: color }]} />
        </View>
        <Text style={styles.label}>SAFE TO SPEND TODAY</Text>
      </View>

      {/* Big Number */}
      <Text style={[styles.amount, { color }]}>
        ₹{amount.toLocaleString('en-IN')}
      </Text>
      <Text style={styles.subtitle}>Artha has reserved all your bills & EMIs</Text>

      {/* Progress Bar */}
      <View style={styles.barBg}>
        <Animated.View style={[styles.barFill, { width: `${clampedPercent}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.barLabel}>{Math.round(clampedPercent)}% of safe budget used this month</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.s1,
    borderRadius: radius.lg,
    padding: spacing.xl,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  pulseWrapper: { width: 18, height: 18, alignItems: 'center', justifyContent: 'center' },
  pulseDot: { position: 'absolute', width: 18, height: 18, borderRadius: 9, opacity: 0.3 },
  coreDot: { width: 10, height: 10, borderRadius: 5 },
  label: { fontSize: 11, color: colors.muted, letterSpacing: 1, fontWeight: '600' },
  amount: { fontSize: 48, fontWeight: '800', lineHeight: 56, marginBottom: 4 },
  subtitle: { fontSize: 13, color: colors.muted, marginBottom: 16 },
  barBg: { height: 4, backgroundColor: colors.s3, borderRadius: 2, overflow: 'hidden', marginBottom: 6 },
  barFill: { height: '100%', borderRadius: 2 },
  barLabel: { fontSize: 11, color: colors.muted },
});





