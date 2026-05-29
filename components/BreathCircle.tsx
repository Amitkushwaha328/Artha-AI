import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors, radius } from '../theme';

interface Props {
  phase: 'inhale' | 'hold' | 'exhale';
}

const phaseConfig = {
  inhale:  { label: 'Breathe In',  duration: 4000, scale: 1.4, color: colors.blue },
  hold:    { label: 'Hold',        duration: 4000, scale: 1.4, color: colors.purple },
  exhale:  { label: 'Breathe Out', duration: 6000, scale: 1.0, color: colors.green },
};

export function BreathCircle({ phase }: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const cfg = phaseConfig[phase];

  useEffect(() => {
    Animated.timing(scale, {
      toValue: cfg.scale,
      duration: cfg.duration,
      useNativeDriver: true,
    }).start();
  }, [phase]);

  return (
    <View style={styles.container}>
      {/* Outer glow ring */}
      <Animated.View style={[
        styles.outerRing,
        { borderColor: cfg.color + '44', transform: [{ scale }] }
      ]} />
      {/* Middle ring */}
      <Animated.View style={[
        styles.middleRing,
        { borderColor: cfg.color + '88', transform: [{ scale }] }
      ]} />
      {/* Core circle */}
      <Animated.View style={[
        styles.core,
        { backgroundColor: cfg.color + '22', borderColor: cfg.color, transform: [{ scale }] }
      ]}>
        <Text style={[styles.phaseText, { color: cfg.color }]}>{cfg.label}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: 240, height: 240, alignItems: 'center', justifyContent: 'center' },
  outerRing: { position: 'absolute', width: 240, height: 240, borderRadius: 120, borderWidth: 1 },
  middleRing: { position: 'absolute', width: 180, height: 180, borderRadius: 90, borderWidth: 1.5 },
  core: { width: 140, height: 140, borderRadius: 70, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  phaseText: { fontSize: 16, fontWeight: '700' },
});




