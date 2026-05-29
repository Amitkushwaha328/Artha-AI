import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity,
  FlatList, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, type } from '../theme';
import * as SecureStore from 'expo-secure-store';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    emoji: '🛡️',
    title: 'Your Financial\nSafety Net',
    subtitle: 'Artha tells you exactly how much you can spend today — after bills, EMIs and safety buffers are set aside.',
    accent: colors.green,
    bg: '#0D1F1A',
  },
  {
    id: '2',
    emoji: '⚠️',
    title: 'See Danger\nBefore It Hits',
    subtitle: 'Artha forecasts your next 30 days. Know exactly when money gets tight, so you can act before the crisis.',
    accent: colors.amber,
    bg: '#1C1700',
  },
  {
    id: '3',
    emoji: '🌀',
    title: 'Break the\nDoom Loop',
    subtitle: 'Our AI detects impulse buying patterns — 5+ micro-purchases in 48 hours. It stops you before you regret it.',
    accent: '#A78BFA',
    bg: '#130D1F',
  },
  {
    id: '4',
    emoji: '💡',
    title: 'Jugaad Score',
    subtitle: 'India-specific money hacks that actually work. Switch plans, share subscriptions, save ₹3,000+ a month.',
    accent: '#FBBF24',
    bg: '#1A1500',
  },
  {
    id: '5',
    emoji: '🤖',
    title: 'AI Coach,\nAlways Ready',
    subtitle: 'Ask anything — "Can I afford this?", "When should I pay advance tax?" — Your personal financial advisor, 24/7.',
    accent: colors.blue,
    bg: '#0D1520',
  },
  {
    id: '6',
    emoji: '👨‍👩‍👧',
    title: 'Built for\nIndian Families',
    subtitle: 'Track gig income, family expenses, freelance invoices and government scheme eligibility — all in one place.',
    accent: '#34D399',
    bg: '#0D1A15',
  },
];

export default function OnboardScreen() {
  const nav = useNavigation<any>();
  const flatRef = useRef<FlatList>(null);
  const [current, setCurrent] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  const finishOnboarding = async () => {
    await SecureStore.setItemAsync('artha_onboarded', 'true');
    nav.navigate('Tabs');
  };

  const goNext = () => {
    if (current < SLIDES.length - 1) {
      flatRef.current?.scrollToIndex({ index: current + 1, animated: true });
      setCurrent(current + 1);
    } else {
      finishOnboarding();
    }
  };

  const goBack = () => {
    if (current > 0) {
      flatRef.current?.scrollToIndex({ index: current - 1, animated: true });
      setCurrent(current - 1);
    }
  };

  const skip = () => finishOnboarding();

  const isLast = current === SLIDES.length - 1;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Skip button */}
      {!isLast && (
        <TouchableOpacity style={styles.skipBtn} onPress={skip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* Slides */}
      <Animated.FlatList
        ref={flatRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        renderItem={({ item }) => (
          <View style={[styles.slide, { backgroundColor: item.bg }]}>
            {/* Glow circle background */}
            <View style={[styles.glowCircle, { backgroundColor: item.accent + '20' }]} />

            {/* Emoji icon — no logo, cleaner design */}
            <View style={[styles.emojiWrap, { borderColor: item.accent + '40', backgroundColor: item.accent + '15' }]}>
              <Text style={styles.emoji}>{item.emoji}</Text>
            </View>

            {/* Text */}
            <Text style={[styles.title, { color: item.accent }]}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </View>
        )}
      />

      {/* Bottom controls */}
      <View style={styles.bottom}>
        {/* Dot indicators */}
        <View style={styles.dots}>
          {SLIDES.map((s, i) => (
            <View
              key={s.id}
              style={[
                styles.dot,
                {
                  width: i === current ? 24 : 8,
                  backgroundColor: i === current ? SLIDES[current].accent : colors.border,
                },
              ]}
            />
          ))}
        </View>

        {/* Navigation buttons */}
        <View style={styles.navRow}>
          {current > 0 ? (
            <TouchableOpacity style={styles.backCircle} onPress={goBack}>
              <Ionicons name="arrow-back" size={20} color={colors.muted} />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 48 }} />
          )}

          <TouchableOpacity
            style={[styles.nextBtn, { backgroundColor: SLIDES[current].accent }]}
            onPress={goNext}
            activeOpacity={0.85}
          >
            {isLast ? (
              <Text style={styles.nextBtnText}>Get Started 🚀</Text>
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.nextBtnText}>Next</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },

  skipBtn: {
    position: 'absolute',
    top: 52,
    right: spacing.containerMargin,
    zIndex: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.s1,
  },
  skipText: {
    color: colors.muted,
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
  },

  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.containerMargin * 1.5,
    paddingTop: 60,
    paddingBottom: 160,
  },

  glowCircle: {
    position: 'absolute',
    top: -80,
    width: 320,
    height: 320,
    borderRadius: 160,
  },

  logo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: spacing.xl,
    opacity: 0.9,
  },

  emojiWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  emoji: { fontSize: 44 },

  title: {
    fontSize: 34,
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
    lineHeight: 42,
    marginBottom: spacing.base,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 26,
  },

  bottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 36,
    paddingHorizontal: spacing.containerMargin,
    backgroundColor: 'transparent',
    gap: spacing.lg,
  },

  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },

  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  backCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.s1,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  nextBtn: {
    flex: 1,
    marginLeft: spacing.md,
    height: 52,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  nextBtnText: {
    color: '#fff',
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
  },
});
