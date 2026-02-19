import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, Switch } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '@store/auth-store';
import { BiometricService } from '@services/biometric';
import { changeLanguage } from '@config/i18n';
import { colors, spacing, borderRadius, typography } from '@config/theme';

const LANGUAGES = [
  { code: 'pt', label: 'Português', flag: '🇦🇴' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
];

export function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const logout = useAuthStore(s => s.logout);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  useEffect(() => {
    BiometricService.isAvailable().then(({ available }) => setBiometricAvailable(available));
    BiometricService.isEnabled().then(setBiometricEnabled);
  }, []);

  const toggleBiometric = async (value: boolean) => {
    await BiometricService.setEnabled(value);
    setBiometricEnabled(value);
  };

  const handleLanguageChange = (code: string) => {
    changeLanguage(code);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('settings.title')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Language */}
        <Text style={styles.sectionTitle}>{t('settings.language')}</Text>
        <View style={styles.card}>
          {LANGUAGES.map(lang => (
            <TouchableOpacity
              key={lang.code}
              style={[styles.langRow, i18n.language === lang.code && styles.langActive]}
              onPress={() => handleLanguageChange(lang.code)}
            >
              <Text style={styles.langFlag}>{lang.flag}</Text>
              <Text style={styles.langLabel}>{lang.label}</Text>
              {i18n.language === lang.code && (
                <Icon name="check" size={20} color={colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Biometric */}
        {biometricAvailable && (
          <>
            <Text style={styles.sectionTitle}>{t('settings.biometric')}</Text>
            <View style={styles.card}>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Icon name="fingerprint" size={24} color={colors.primary} />
                  <Text style={styles.settingLabel}>{t('settings.biometric')}</Text>
                </View>
                <Switch
                  value={biometricEnabled}
                  onValueChange={toggleBiometric}
                  trackColor={{ false: colors.border, true: colors.primaryLight }}
                  thumbColor={biometricEnabled ? colors.primary : '#f4f3f4'}
                />
              </View>
            </View>
          </>
        )}

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Icon name="logout" size={20} color={colors.error} />
          <Text style={styles.logoutText}>{t('auth.logout')}</Text>
        </TouchableOpacity>

        <Text style={styles.version}>{t('settings.version')}: 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  headerTitle: { ...typography.h3, color: colors.text },
  content: { padding: spacing.lg },
  sectionTitle: { ...typography.body, color: colors.textSecondary, fontWeight: '600', marginBottom: spacing.sm, marginTop: spacing.lg },
  card: {
    backgroundColor: colors.surface, borderRadius: borderRadius.lg,
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3,
    overflow: 'hidden',
  },
  langRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: spacing.md, borderBottomWidth: 0.5, borderBottomColor: colors.border },
  langActive: { backgroundColor: colors.primary + '08' },
  langFlag: { fontSize: 20 },
  langLabel: { ...typography.body, color: colors.text, flex: 1 },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md },
  settingInfo: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  settingLabel: { ...typography.body, color: colors.text },
  logoutButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    marginTop: spacing.xl, paddingVertical: 14, borderRadius: borderRadius.lg,
    borderWidth: 1, borderColor: colors.error,
  },
  logoutText: { ...typography.button, color: colors.error },
  version: { ...typography.caption, color: colors.textLight, textAlign: 'center', marginTop: spacing.xl },
});
