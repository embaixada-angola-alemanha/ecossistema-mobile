import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '@store/auth-store';
import { colors, spacing, borderRadius, typography } from '@config/theme';
import { HomeStackParamList } from '@navigation/types';

type Nav = NativeStackNavigationProp<HomeStackParamList>;

const quickActions = [
  { key: 'documents', icon: 'file-document', color: colors.info, tab: 'DocumentsTab' },
  { key: 'visa', icon: 'passport', color: colors.primary, tab: 'VisaTab' },
  { key: 'appointments', icon: 'calendar-clock', color: colors.accent, tab: 'AppointmentsTab' },
  { key: 'news', icon: 'newspaper', color: colors.ember, tab: 'NewsTab' },
];

export function HomeScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const user = useAuthStore(s => s.user);
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // TODO: Refetch data
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header bar */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            {t('home.greeting', { name: user?.firstName || '' })}
          </Text>
          <Text style={styles.subtitle}>{t('app.tagline')}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Icon name="account-circle" size={32} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            <Icon name="cog" size={28} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
      >
        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>{t('home.quickActions')}</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map(action => (
            <TouchableOpacity
              key={action.key}
              style={styles.actionCard}
              onPress={() => navigation.getParent()?.navigate(action.tab)}
            >
              <View style={[styles.actionIcon, { backgroundColor: action.color + '15' }]}>
                <Icon name={action.icon} size={28} color={action.color} />
              </View>
              <Text style={styles.actionLabel}>{t(`tabs.${action.key}`)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Processes */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('home.recentProcesses')}</Text>
          <TouchableOpacity onPress={() => navigation.getParent()?.navigate('DocumentsTab')}>
            <Text style={styles.viewAll}>{t('home.viewAll')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.emptyState}>
          <Icon name="clipboard-text-outline" size={48} color={colors.textLight} />
          <Text style={styles.emptyText}>{t('home.noProcesses')}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  greeting: { ...typography.h3, color: colors.text },
  subtitle: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  scrollContent: { padding: spacing.lg, paddingBottom: spacing.xxl },
  sectionTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.md },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.lg, marginBottom: spacing.md },
  viewAll: { ...typography.bodySmall, color: colors.primaryLight, fontWeight: '600' },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  actionCard: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  actionIcon: { width: 56, height: 56, borderRadius: borderRadius.xl, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.sm },
  actionLabel: { ...typography.bodySmall, color: colors.text, fontWeight: '500', textAlign: 'center' },
  emptyState: { alignItems: 'center', paddingVertical: spacing.xxl },
  emptyText: { ...typography.body, color: colors.textLight, marginTop: spacing.sm },
});
