import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { colors, radius } from '../theme';
import { spacing } from '../theme';
import type { DayForecast } from '../engine/dangerWindow';

interface Props {
  forecasts: DayForecast[];
  onDayPress?: (day: DayForecast) => void;
}

export function DangerWindowBar({ forecasts, onDayPress }: Props) {
  const riskColor = (level: string) =>
    level === 'danger' ? colors.red :
    level === 'warning' ? colors.amber :
    colors.green;

  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>30-Day Forecast</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
        {forecasts.map((f) => (
          <Pressable key={f.day} style={styles.dayCol} onPress={() => onDayPress?.(f)}>
            <View style={[styles.dayBar, {
              backgroundColor: riskColor(f.riskLevel),
              opacity: f.riskLevel === 'safe' ? 0.35 : 1,
              height: f.riskLevel === 'danger' ? 40 : f.riskLevel === 'warning' ? 28 : 16,
            }]} />
            <Text style={[styles.dayNum, { color: riskColor(f.riskLevel) }]}>
              {f.day}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.green }]} />
          <Text style={styles.legendText}>Safe</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.amber }]} />
          <Text style={styles.legendText}>Warning</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.red }]} />
          <Text style={styles.legendText}>Danger</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.s1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  title: { fontSize: 13, color: colors.muted, fontWeight: '600', letterSpacing: 0.8, marginBottom: 16, textTransform: 'uppercase' },
  scroll: { marginBottom: 12 },
  dayCol: { alignItems: 'center', marginRight: 5, width: 20, justifyContent: 'flex-end', height: 56 },
  dayBar: { width: 10, borderRadius: 4, marginBottom: 4 },
  dayNum: { fontSize: 9, fontWeight: '600' },
  legend: { flexDirection: 'row', gap: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, color: colors.muted },
});





