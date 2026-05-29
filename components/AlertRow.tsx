import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../theme';
import { spacing } from '../theme';

export interface AlertData {
  id: string;
  type: 'danger' | 'warning' | 'info' | 'success';
  title: string;
  description: string;
  action?: string;
  resolved?: boolean;
}

interface Props {
  alert: AlertData;
  onAction?: (id: string) => void;
}

const typeConfig = {
  danger:  { color: colors.red,    icon: 'warning' as const,        bg: 'rgba(248,113,113,0.08)' },
  warning: { color: colors.amber,  icon: 'alert-circle' as const,   bg: 'rgba(251,191,36,0.08)' },
  info:    { color: colors.blue,   icon: 'information-circle' as const, bg: 'rgba(96,165,250,0.08)' },
  success: { color: colors.green,  icon: 'checkmark-circle' as const, bg: 'rgba(52,211,153,0.08)' },
};

export function AlertRow({ alert, onAction }: Props) {
  const cfg = typeConfig[alert.type];
  return (
    <View style={[styles.row, { backgroundColor: cfg.bg, borderColor: cfg.color + '33', opacity: alert.resolved ? 0.5 : 1 }]}>
      <View style={[styles.iconWrap, { backgroundColor: cfg.color + '22' }]}>
        <Ionicons name={alert.resolved ? 'checkmark-circle' : cfg.icon} size={22} color={alert.resolved ? colors.green : cfg.color} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{alert.title}</Text>
        <Text style={styles.desc}>{alert.description}</Text>
        {alert.action && !alert.resolved && (
          <Pressable style={[styles.actionBtn, { borderColor: cfg.color }]} onPress={() => onAction?.(alert.id)}>
            <Text style={[styles.actionText, { color: cfg.color }]}>{alert.action}</Text>
          </Pressable>
        )}
        {alert.resolved && <Text style={styles.resolvedText}>✓ Resolved</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { borderRadius: radius.md, padding: spacing.md, borderWidth: 1, marginBottom: spacing.sm, flexDirection: 'row', gap: spacing.md },
  iconWrap: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1 },
  title: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 4 },
  desc: { fontSize: 12, color: colors.muted, lineHeight: 18 },
  actionBtn: { marginTop: 10, borderWidth: 1, borderRadius: radius.sm, paddingVertical: 6, paddingHorizontal: 12, alignSelf: 'flex-start' },
  actionText: { fontSize: 12, fontWeight: '600' },
  resolvedText: { fontSize: 12, color: colors.green, marginTop: 6 },
});




