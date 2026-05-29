import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, type } from '../theme';
import { AlertRow, AlertData } from '../components/AlertRow';
import { useStore } from '../store/useStore';

const INITIAL_ALERTS: AlertData[] = [
  { id: '1', type: 'danger', title: 'Danger Window in 11 days', description: 'Projected ₹2,140 shortfall on Day 23. Your EMI + rent overlap will exceed available balance.', action: 'Fix with 1 Tap' },
  { id: '2', type: 'warning', title: 'Doom Spending: 7 micro-buys in 48hrs', description: '₹923 in impulse purchases detected. Artha recommends a 2-hour payment pause.', action: 'Activate Shield' },
  { id: '3', type: 'info', title: 'PMJDY Scheme Match Found', description: 'As a Jan Dhan account holder, you qualify for a ₹10,000 overdraft facility — no application needed.', action: 'View Scheme' },
];

export default function AlertsScreen() {
  const navigation = useNavigation<any>();
  const { setAlerts } = useStore();
  const [alerts, setAlertsState] = useState<AlertData[]>(INITIAL_ALERTS);

  const handleAction = (id: string) => {
    setAlertsState(prev => prev.map(a => a.id === id ? { ...a, resolved: true } : a));
    const remaining = alerts.filter(a => !a.resolved && a.id !== id).length;
    setAlerts(remaining);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={24} color={colors.muted} />
          </Pressable>
          <View style={{ flex: 1, marginLeft: spacing.sm }}>
            <Text style={styles.title}>AI Agent Alerts</Text>
            <Text style={styles.subtitle}>{alerts.filter(a => !a.resolved).length} requiring attention</Text>
          </View>
        </View>

        <Pressable style={styles.fixAllBtn} onPress={() => {
          setAlertsState(prev => prev.map(a => ({ ...a, resolved: true })));
          setAlerts(0);
        }}>
          <Ionicons name="flash" size={16} color="#000" />
          <Text style={styles.fixAllText}>Fix All in 1 Tap</Text>
        </Pressable>

        {alerts.map(alert => (
          <AlertRow key={alert.id} alert={alert} onAction={handleAction} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: 100 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg },
  title: { fontSize: 22, fontWeight: '800', color: colors.text, fontFamily: 'Inter_700Bold' },
  subtitle: { fontSize: 13, color: colors.muted, marginTop: 2, fontFamily: 'Inter_400Regular' },
  fixAllBtn: { backgroundColor: colors.accent, borderRadius: radius.md, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: spacing.lg },
  fixAllText: { fontSize: 15, fontWeight: '700', color: '#000', fontFamily: 'Inter_700Bold' },
});
