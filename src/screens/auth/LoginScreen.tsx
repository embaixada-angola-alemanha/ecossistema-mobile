import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@store/auth-store';
import { BiometricService } from '@services/biometric';
import { colors, spacing, borderRadius, typography } from '@config/theme';
import { ENV } from '@config/env';

export function LoginScreen() {
  const { t } = useTranslation();
  const login = useAuthStore(s => s.login);
  const [loading, setLoading] = useState(false);
  const [biometricType, setBiometricType] = useState<string | undefined>();

  useEffect(() => {
    if (ENV.BIOMETRIC_ENABLED) {
      BiometricService.isAvailable().then(({ available, biometryType }) => {
        if (available) setBiometricType(biometryType);
      });
    }
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await login();
    } catch (error) {
      Alert.alert(t('common.error'), t('auth.loginError'));
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    const authenticated = await BiometricService.authenticate();
    if (authenticated) {
      await handleLogin();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Icon name="shield-account" size={80} color={colors.primary} />
        <Text style={styles.title}>{t('app.name')}</Text>
        <Text style={styles.tagline}>{t('app.tagline')}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.prompt}>{t('auth.loginPrompt')}</Text>

        <TouchableOpacity
          style={[styles.loginButton, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Icon name="login" size={20} color="#fff" />
              <Text style={styles.loginButtonText}>{t('auth.login')}</Text>
            </>
          )}
        </TouchableOpacity>

        {biometricType && (
          <TouchableOpacity style={styles.biometricButton} onPress={handleBiometricLogin}>
            <Icon
              name={biometricType === 'FaceID' ? 'face-recognition' : 'fingerprint'}
              size={24}
              color={colors.primary}
            />
            <Text style={styles.biometricText}>{t('auth.biometric')}</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.footer}>
        Embaixada da República de Angola{'\n'}Berlim, Alemanha
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, justifyContent: 'space-between' },
  header: {
    alignItems: 'center',
    paddingTop: spacing.xxl * 2,
    paddingHorizontal: spacing.lg,
  },
  title: { ...typography.h1, color: colors.primary, marginTop: spacing.md, textAlign: 'center' },
  tagline: { ...typography.bodySmall, color: colors.textSecondary, marginTop: spacing.xs },
  content: { paddingHorizontal: spacing.xl },
  prompt: { ...typography.body, color: colors.text, textAlign: 'center', marginBottom: spacing.lg },
  loginButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  buttonDisabled: { opacity: 0.7 },
  loginButtonText: { ...typography.button, color: '#fff' },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginTop: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.primary,
    gap: spacing.sm,
  },
  biometricText: { ...typography.button, color: colors.primary },
  footer: {
    ...typography.caption,
    color: colors.textLight,
    textAlign: 'center',
    paddingBottom: spacing.xl,
  },
});
