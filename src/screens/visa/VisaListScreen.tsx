import React from 'react';
import {
  View, Text, FlatList, StyleSheet, SafeAreaView, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { VisaStackParamList } from '@navigation/types';
import { useVistos } from '@hooks/useVistos';
import { Visto, EstadoVisto } from '@types/visto';
import { ESTADO_TERMINAL } from '@services/visto';
import { colors, spacing, borderRadius, typography } from '@config/theme';

type Nav = NativeStackNavigationProp<VisaStackParamList>;

const STATUS_COLORS: Record<EstadoVisto, string> = {
  RASCUNHO: colors.statusDraft,
  SUBMETIDO: colors.info,
  EM_ANALISE: colors.statusInProgress,
  APROVADO: colors.statusApproved,
  REJEITADO: colors.statusRejected,
  EMITIDO: colors.statusIssued,
  ENTREGUE: colors.success,
  EXPIRADO: colors.textLight,
  CANCELADO: colors.statusRejected,
};

const STATUS_ICONS: Record<EstadoVisto, string> = {
  RASCUNHO: 'pencil',
  SUBMETIDO: 'send',
  EM_ANALISE: 'magnify',
  APROVADO: 'check-circle',
  REJEITADO: 'close-circle',
  EMITIDO: 'certificate',
  ENTREGUE: 'hand-extended',
  EXPIRADO: 'clock-alert',
  CANCELADO: 'cancel',
};

export function VisaListScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const { data, isLoading, refetch, fetchNextPage, hasNextPage } = useVistos();

  const vistos = data?.pages.flatMap(p => p.content) ?? [];

  const renderVisto = ({ item }: { item: Visto }) => {
    const statusColor = STATUS_COLORS[item.estado] || colors.textLight;
    const statusIcon = STATUS_ICONS[item.estado] || 'help-circle';
    const isTerminal = ESTADO_TERMINAL.includes(item.estado);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('VisaTracking', { vistoId: item.id })}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <Icon name={statusIcon} size={20} color={statusColor} />
            <Text style={styles.cardRef}>{item.referencia}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: statusColor + '20' }]}>
            <Text style={[styles.badgeText, { color: statusColor }]}>{item.estado}</Text>
          </View>
        </View>
        <View style={styles.cardBody}>
          <View style={styles.cardRow}>
            <Icon name="passport" size={16} color={colors.textSecondary} />
            <Text style={styles.cardType}>{item.tipo}</Text>
          </View>
          {item.dataEntrada && (
            <View style={styles.cardRow}>
              <Icon name="calendar-range" size={16} color={colors.textSecondary} />
              <Text style={styles.cardDate}>
                {new Date(item.dataEntrada).toLocaleDateString('pt')}
                {item.dataSaida && ` — ${new Date(item.dataSaida).toLocaleDateString('pt')}`}
              </Text>
            </View>
          )}
        </View>
        {!isTerminal && item.estado !== 'ENTREGUE' && (
          <View style={styles.cardFooter}>
            <Icon name="chevron-right" size={18} color={colors.primary} />
            <Text style={styles.trackText}>{t('visa.tracking')}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('visa.title')}</Text>
        <TouchableOpacity
          style={styles.applyButton}
          onPress={() => navigation.navigate('VisaApply')}
        >
          <Icon name="plus" size={20} color="#fff" />
          <Text style={styles.applyText}>{t('visa.apply')}</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.xxl }} />
      ) : vistos.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="passport" size={64} color={colors.textLight} />
          <Text style={styles.emptyTitle}>{t('visa.noVisas')}</Text>
          <TouchableOpacity
            style={styles.emptyApplyButton}
            onPress={() => navigation.navigate('VisaApply')}
          >
            <Text style={styles.emptyApplyText}>{t('visa.apply')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={vistos}
          keyExtractor={item => item.id}
          renderItem={renderVisto}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={() => refetch()} colors={[colors.primary]} />
          }
          onEndReached={() => hasNextPage && fetchNextPage()}
          onEndReachedThreshold={0.3}
        />
      )}
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
  applyButton: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    backgroundColor: colors.primary, paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  applyText: { ...typography.caption, color: '#fff', fontWeight: '600' },
  list: { padding: spacing.lg },
  card: {
    backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.md,
    marginBottom: spacing.md,
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  cardRef: { ...typography.body, fontWeight: '600', color: colors.text },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.round },
  badgeText: { ...typography.caption, fontWeight: '600' },
  cardBody: { marginTop: spacing.sm },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: 4 },
  cardType: { ...typography.bodySmall, color: colors.textSecondary },
  cardDate: { ...typography.caption, color: colors.textLight },
  cardFooter: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    marginTop: spacing.sm, paddingTop: spacing.sm,
    borderTopWidth: 0.5, borderTopColor: colors.border,
  },
  trackText: { ...typography.bodySmall, color: colors.primary, fontWeight: '500' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyTitle: { ...typography.body, color: colors.textLight, marginTop: spacing.md },
  emptyApplyButton: {
    marginTop: spacing.lg, backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, borderRadius: borderRadius.md,
  },
  emptyApplyText: { ...typography.button, color: '#fff' },
});
