import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, radius, type } from '../theme';
import { useAuthStore } from '../store/authStore';

export default function LoginScreen() {
  const nav = useNavigation<any>();
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password');
  
  const { login, isLoading, error, clearError } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in both fields');
      return;
    }
    const success = await login(email, password);
    if (!success && error) {
      Alert.alert('Login Failed', error);
      clearError();
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Enter your details to access Artha.</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Email address</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="test@example.com"
            placeholderTextColor={colors.hint}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor={colors.hint}
          />

          <TouchableOpacity 
            style={[styles.btn, isLoading && { opacity: 0.7 }]} 
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.bg} />
            ) : (
              <Text style={styles.btnText}>Log In</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => nav.navigate('Signup')}>
            <Text style={styles.footerLink}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1, padding: spacing.containerMargin, justifyContent: 'center' },
  header: { marginBottom: spacing.xl },
  title: { ...type.displayMobile, marginBottom: spacing.xs },
  subtitle: { ...type.bodyLg, color: colors.muted },
  form: { marginBottom: spacing.xl },
  label: { ...type.bodySm, color: colors.muted, marginBottom: spacing.xs },
  input: {
    backgroundColor: colors.s1,
    borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    color: colors.text,
    fontFamily: 'Inter_500Medium',
    marginBottom: spacing.lg,
  },
  btn: {
    backgroundColor: colors.accent,
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  btnText: { color: colors.bg, fontFamily: 'Inter_700Bold', fontSize: 16 },
  footer: { flexDirection: 'row', justifyContent: 'center' },
  footerText: { ...type.bodySm, color: colors.muted },
  footerLink: { ...type.bodySm, color: colors.accent, fontFamily: 'Inter_600SemiBold' },
});
