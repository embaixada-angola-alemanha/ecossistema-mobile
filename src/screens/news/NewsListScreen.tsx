import React from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { NewsStackParamList } from '@navigation/types';
import { colors, spacing, borderRadius, typography } from '@config/theme';

type Nav = NativeStackNavigationProp<NewsStackParamList>;

export function NewsListScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('news.title')}</Text>
      </View>

      <View style={styles.emptyState}>
        <Icon name="newspaper-variant-outline" size={64} color={colors.textLight} />
        <Text style={styles.emptyTitle}>{t('common.noResults')}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  headerTitle: { ...typography.h3, color: colors.text },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyTitle: { ...typography.body, color: colors.textLight, marginTop: spacing.md },
});
