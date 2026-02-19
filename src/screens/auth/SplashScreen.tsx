import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text, Image } from 'react-native';
import { colors, spacing } from '@config/theme';

export function SplashScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.title}>Embaixada de Angola</Text>
        <Text style={styles.subtitle}>República de Angola na Alemanha</Text>
      </View>
      <ActivityIndicator size="large" color={colors.primary} style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  logoContainer: { alignItems: 'center', marginBottom: spacing.xxl },
  title: { fontSize: 24, fontWeight: '700', color: colors.primary, textAlign: 'center' },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: spacing.xs },
  spinner: { marginTop: spacing.xl },
});
