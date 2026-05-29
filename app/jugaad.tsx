import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, type } from '../theme';
import { JugaadTipCard, JugaadTip } from '../components/JugaadTipCard';
import { useStore } from '../store/useStore';

const MOCK_TIPS: JugaadTip[] = [
  { id: '1', tip: 'Switch from Jio postpaid ₹999 to Jio prepaid ₹239/28 days. Same data, same calls, saves ₹760/mo instantly.', saving_per_month: 760, difficulty: 'easy', category: 'telecom' },
  { id: '2', tip: 'Cancel Netflix + Hotstar. Share a family plan with 2 friends. Each pays ₹133/mo instead of ₹649.', saving_per_month: 516, difficulty: 'easy', category: 'subscription' },
  { id: '3', tip: 'Use Blinkit\'s ₹0 delivery coupon between 11pm–1am when demand is low. Saves delivery fee on every grocery order.', saving_per_month: 280, difficulty: 'easy', category: 'groceries' },
  { id: '4', tip: 'Switch to Rapido bike taxi for distances under 8km in Hyderabad. 60% cheaper than Ola/Uber for same route.', saving_per_month: 420, difficulty: 'medium', category: 'transport' },
  { id: '5', tip: 'Set up UPI AutoPay for all subscriptions. Avoid late fees and unexpected deductions that trigger overdraft.', saving_per_month: 300, difficulty: 'easy', category: 'banking' },
];

export default function JugaadScreen() {
  const navigation = useNavigation<any>();
  const { jugaadScore, updateJugaadScore } = useStore();
  const [tips, setTips] = useState<JugaadTip[]>(MOCK_TIPS);

  const handleApply = (id: string) => {
    setTips(prev => prev.map(t => t.id === id ? { ...t, applied: true } : t));
    updateJugaadScore(Math.min(100, jugaadScore + 3));
  };

  const totalSavings = tips.filter(t => t.applied).reduce((s, t) => s + t.saving_per_month, 0);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Pressable onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color={colors.muted} />
          </Pressable>
          <View style={{ flex: 1, marginLeft: spacing.sm }}>
            <Text style={styles.title}>Jugaad Score</Text>
            <Text style={styles.subtitle}>India-specific money-saving intelligence</Text>
          </View>
        </View>

        {/* Score Ring Card */}
        <View style={styles.scoreCard}>
          <View style={styles.scoreCircle}>
            <Text style={[styles.scoreNum, { color: jugaadScore >= 80 ? colors.success : jugaadScore >= 60 ? colors.amber : colors.warning }]}>
              {jugaadScore}
            </Text>
            <Text style={styles.scoreLabel}>/ 100</Text>
          </View>
          <View style={{ flex: 1, marginLeft: spacing.xl }}>
            <Text style={styles.scoreTitle}>
              {jugaadScore >= 80 ? 'Master Jugaad 🏆' : jugaadScore >= 60 ? 'Good Jugaad 💡' : 'Room to Jugaad 🔧'}
            </Text>
            <Text style={styles.scoreDesc}>Apply tips below to improve your score and unlock savings</Text>
            {totalSavings > 0 && (
              <View style={styles.savingsBadge}>
                <Text style={styles.savingsText}>+₹{totalSavings.toLocaleString('en-IN')}/mo saved</Text>
              </View>
            )}
          </View>
        </View>

        {/* Score Bar */}
        <View style={styles.barBg}>
          <View style={[styles.barFill, {
            width: `${jugaadScore}%`,
            backgroundColor: jugaadScore >= 80 ? colors.success : jugaadScore >= 60 ? colors.amber : colors.warning
          }]} />
        </View>

        <Text style={styles.sectionTitle}>Your Personalised Jugaad Tips</Text>
        {tips.map(tip => (
          <JugaadTipCard key={tip.id} tip={tip} onApply={handleApply} />
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
  subtitle: { fontSize: 12, color: colors.muted, marginTop: 2, fontFamily: 'Inter_400Regular' },
  scoreCard: { backgroundColor: colors.s1, borderRadius: radius.lg, padding: spacing.xl, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md },
  scoreCircle: { width: 88, height: 88, borderRadius: 44, backgroundColor: colors.s2, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.border },
  scoreNum: { fontSize: 30, fontWeight: '800', fontFamily: 'Inter_700Bold' },
  scoreLabel: { fontSize: 12, color: colors.muted, fontFamily: 'Inter_400Regular' },
  scoreTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 6, fontFamily: 'Inter_700Bold' },
  scoreDesc: { fontSize: 12, color: colors.muted, lineHeight: 18, fontFamily: 'Inter_400Regular' },
  savingsBadge: { backgroundColor: colors.success + '22', borderRadius: 99, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start', marginTop: spacing.sm },
  savingsText: { fontSize: 12, color: colors.success, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },
  barBg: { height: 4, backgroundColor: colors.s2, borderRadius: 2, marginBottom: spacing.lg, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 2 },
  sectionTitle: { fontSize: 12, color: colors.muted, fontWeight: '600', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: spacing.md, fontFamily: 'Inter_600SemiBold' },
});
