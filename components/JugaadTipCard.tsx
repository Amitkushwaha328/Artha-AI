import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, radius } from '../theme';
import { spacing } from '../theme';

export interface JugaadTip {
  id: string;
  tip: string;
  saving_per_month: number;
  difficulty: 'easy' | 'medium';
  category: string;
  applied?: boolean;
}

interface Props {
  tip: JugaadTip;
  onApply: (id: string) => void;
}

const difficultyColor = {
  easy: colors.green,
  medium: colors.amber,
};

export function JugaadTipCard({ tip, onApply }: Props) {
  return (
    <View style={[styles.card, tip.applied && styles.applied]}>
      <View style={styles.top}>
        <View style={[styles.badge, { backgroundColor: difficultyColor[tip.difficulty] + '22', borderColor: difficultyColor[tip.difficulty] + '44' }]}>
          <Text style={[styles.badgeText, { color: difficultyColor[tip.difficulty] }]}>{tip.difficulty.toUpperCase()}</Text>
        </View>
        <Text style={styles.saving}>Saves ₹{tip.saving_per_month.toLocaleString('en-IN')}/mo</Text>
      </View>
      <Text style={styles.tipText}>{tip.tip}</Text>
      {!tip.applied ? (
        <Pressable style={styles.applyBtn} onPress={() => onApply(tip.id)}>
          <Text style={styles.applyText}>Apply This Tip</Text>
        </Pressable>
      ) : (
        <View style={styles.appliedRow}>
          <Text style={styles.appliedText}>✓ Applied — Score +3</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.s1,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  applied: { borderColor: colors.green + '44', backgroundColor: 'rgba(52,211,153,0.05)' },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, borderWidth: 1 },
  badgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  saving: { fontSize: 13, color: colors.green, fontWeight: '600' },
  tipText: { fontSize: 14, color: colors.text, lineHeight: 20, marginBottom: 14 },
  applyBtn: { backgroundColor: colors.s3, borderRadius: radius.sm, paddingVertical: 8, alignItems: 'center' },
  applyText: { fontSize: 13, color: colors.accent, fontWeight: '600' },
  appliedRow: { alignItems: 'center', paddingVertical: 8 },
  appliedText: { fontSize: 13, color: colors.green, fontWeight: '600' },
});





