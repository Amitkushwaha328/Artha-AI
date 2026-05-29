import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../theme';
import { spacing } from '../theme';

export interface Invoice {
  id: number;
  client: string;
  project: string;
  amount: number;
  status: 'pending' | 'collected' | 'overdue';
  due_date: string;
  reminded_at?: string;
}

interface Props {
  invoice: Invoice;
  onRemind?: (id: number) => void;
}

const statusConfig = {
  pending:   { color: colors.amber, label: 'PENDING',   icon: 'time-outline' as const },
  collected: { color: colors.green, label: 'COLLECTED', icon: 'checkmark-circle-outline' as const },
  overdue:   { color: colors.red,   label: 'OVERDUE',   icon: 'alert-circle-outline' as const },
};

export function InvoiceItem({ invoice, onRemind }: Props) {
  const cfg = statusConfig[invoice.status];
  return (
    <View style={styles.row}>
      <View style={[styles.iconWrap, { backgroundColor: cfg.color + '18' }]}>
        <Ionicons name={cfg.icon} size={20} color={cfg.color} />
      </View>
      <View style={styles.content}>
        <Text style={styles.client}>{invoice.client}</Text>
        <Text style={styles.project}>{invoice.project}</Text>
      </View>
      <View style={styles.right}>
        <Text style={[styles.amount, { color: invoice.status === 'collected' ? colors.green : colors.text }]}>
          ₹{invoice.amount.toLocaleString('en-IN')}
        </Text>
        <View style={[styles.badge, { backgroundColor: cfg.color + '18' }]}>
          <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
        {invoice.status === 'overdue' && (
          <Pressable style={styles.remindBtn} onPress={() => onRemind?.(invoice.id)}>
            <Text style={styles.remindText}>Send Reminder</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border, gap: spacing.md },
  iconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1 },
  client: { fontSize: 14, fontWeight: '600', color: colors.text },
  project: { fontSize: 12, color: colors.muted, marginTop: 2 },
  right: { alignItems: 'flex-end', gap: 4 },
  amount: { fontSize: 15, fontWeight: '700' },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  badgeText: { fontSize: 10, fontWeight: '700' },
  remindBtn: { marginTop: 2 },
  remindText: { fontSize: 11, color: colors.blue, fontWeight: '600' },
});




