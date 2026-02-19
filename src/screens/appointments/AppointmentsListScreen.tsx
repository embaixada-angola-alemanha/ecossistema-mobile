import React, { useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, SafeAreaView, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppointmentsStackParamList } from '@navigation/types';
import { useAgendamentos } from '@hooks/useAgendamentos';
import { Agendamento, EstadoAgendamento } from '@types/agendamento';
import { TIPO_ICONS, ESTADO_TERMINAL_AGENDAMENTO } from '@services/agendamento';
import { colors, spacing, borderRadius, typography } from '@config/theme';

type Nav = NativeStackNavigationProp<AppointmentsStackParamList>;

const STATUS_COLORS: Record<EstadoAgendamento, string> = {
  PENDENTE: colors.statusPending,
  CONFIRMADO: colors.success,
  REAGENDADO: colors.info,
  CANCELADO: colors.statusRejected,
  COMPLETADO: colors.primary,
  NAO_COMPARECEU: colors.textLight,
};

const STATUS_ICONS: Record<EstadoAgendamento, string> = {
  PENDENTE: 'clock-outline',
  CONFIRMADO: 'check-circle',
  REAGENDADO: 'calendar-refresh',
  CANCELADO: 'cancel',
  COMPLETADO: 'check-decagram',
  NAO_COMPARECEU: 'account-off',
};

type TabKey = 'upcoming' | 'past';

export function AppointmentsListScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const { data, isLoading, refetch, fetchNextPage, hasNextPage } = useAgendamentos();
  const [tab, setTab] = useState<TabKey>('upcoming');

  const allAgendamentos = data?.pages.flatMap(p => p.content) ?? [];
  const now = new Date();

  const upcoming = allAgendamentos.filter(a =>
    new Date(a.dataHora) >= now && !ESTADO_TERMINAL_AGENDAMENTO.includes(a.estado)
  );
  const past = allAgendamentos.filter(a =>
    new Date(a.dataHora) < now || ESTADO_TERMINAL_AGENDAMENTO.includes(a.estado)
  );

  const displayList = tab === 'upcoming' ? upcoming : past;

  const formatDateTime = (iso: string) => {
    const d = new Date(iso);
    return {
      date: d.toLocaleDateString('pt', { weekday: 'short', day: 'numeric', month: 'short' }),
      time: d.toLocaleTimeString('pt', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const renderAgendamento = ({ item }: { item: Agendamento }) => {
    const statusColor = STATUS_COLORS[item.estado] || colors.textLight;
    const statusIcon = STATUS_ICONS[item.estado] || 'help-circle';
    const tipoIcon = TIPO_ICONS[item.tipo] || 'help-circle';
    const { date, time } = formatDateTime(item.dataHora);
    const isActive = !ESTADO_TERMINAL_AGENDAMENTO.includes(item.estado);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('AppointmentDetail', { appointmentId: item.id })}
        activeOpacity={0.7}
      >
        {/* Date strip */}
        <View style={[styles.dateStrip, { backgroundColor: statusColor + '15' }]}>
          <Icon name="calendar" size={16} color={statusColor} />
          <Text style={[styles.dateText, { color: statusColor }]}>{date}</Text>
          <Text style={[styles.timeText, { color: statusColor }]}>{time}</Text>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Icon name={tipoIcon} size={20} color={colors.primary} />
              <Text style={styles.cardRef}>{item.numeroAgendamento}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: statusColor + '20' }]}>
              <Icon name={statusIcon} size={12} color={statusColor} />
              <Text style={[styles.badgeText, { color: statusColor }]}>{item.estado}</Text>
            </View>
          </View>

          <Text style={styles.cardType}>{item.tipo.replace(/_/g, ' ')}</Text>

          <View style={styles.cardLocationRow}>
            <Icon name="map-marker-outline" size={14} color={colors.textLight} />
            <Text style={styles.cardLocation}>{item.local}</Text>
          </View>

          {isActive && item.estado === 'CONFIRMADO' && (
            <View style={styles.qrHint}>
              <Icon name="qrcode" size={14} color={colors.primary} />
              <Text style={styles.qrHintText}>{t('appointments.showQR')}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('appointments.title')}</Text>
        <TouchableOpacity
          style={styles.newButton}
          onPress={() => navigation.navigate('NewAppointment')}
        >
          <Icon name="plus" size={20} color="#fff" />
          <Text style={styles.newText}>{t('appointments.new')}</Text>
        </TouchableOpacity>
      </View>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, tab === 'upcoming' && styles.tabActive]}
          onPress={() => setTab('upcoming')}
        >
          <Text style={[styles.tabText, tab === 'upcoming' && styles.tabTextActive]}>
            {t('appointments.upcoming')} ({upcoming.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'past' && styles.tabActive]}
          onPress={() => setTab('past')}
        >
          <Text style={[styles.tabText, tab === 'past' && styles.tabTextActive]}>
            {t('appointments.past')} ({past.length})
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.xxl }} />
      ) : displayList.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="calendar-blank" size={64} color={colors.textLight} />
          <Text style={styles.emptyTitle}>
            {tab === 'upcoming' ? t('appointments.noUpcoming') : t('appointments.noPast')}
          </Text>
          {tab === 'upcoming' && (
            <TouchableOpacity
              style={styles.emptyCTA}
              onPress={() => navigation.navigate('NewAppointment')}
            >
              <Text style={styles.emptyCTAText}>{t('appointments.new')}</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={displayList}
          keyExtractor={item => item.id}
          renderItem={renderAgendamento}
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
  newButton: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    backgroundColor: colors.accent, paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  newText: { ...typography.caption, color: '#fff', fontWeight: '600' },
  tabBar: {
    flexDirection: 'row', backgroundColor: colors.surface,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  tab: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: colors.primary },
  tabText: { ...typography.bodySmall, color: colors.textSecondary },
  tabTextActive: { color: colors.primary, fontWeight: '600' },
  list: { padding: spacing.lg },
  card: {
    backgroundColor: colors.surface, borderRadius: borderRadius.lg,
    marginBottom: spacing.md, overflow: 'hidden',
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3,
  },
  dateStrip: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
  },
  dateText: { ...typography.bodySmall, fontWeight: '600', flex: 1 },
  timeText: { ...typography.bodySmall, fontWeight: '700' },
  cardBody: { padding: spacing.md },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  cardRef: { ...typography.body, fontWeight: '600', color: colors.text },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.round,
  },
  badgeText: { ...typography.caption, fontWeight: '600' },
  cardType: { ...typography.bodySmall, color: colors.textSecondary, marginTop: spacing.xs },
  cardLocationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  cardLocation: { ...typography.caption, color: colors.textLight },
  qrHint: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    marginTop: spacing.sm, paddingTop: spacing.sm,
    borderTopWidth: 0.5, borderTopColor: colors.border,
  },
  qrHintText: { ...typography.bodySmall, color: colors.primary, fontWeight: '500' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyTitle: { ...typography.body, color: colors.textLight, marginTop: spacing.md },
  emptyCTA: {
    marginTop: spacing.lg, backgroundColor: colors.accent,
    paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, borderRadius: borderRadius.md,
  },
  emptyCTAText: { ...typography.button, color: '#fff' },
});
