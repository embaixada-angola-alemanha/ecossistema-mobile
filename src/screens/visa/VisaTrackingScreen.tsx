import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { VisaStackParamList } from '@navigation/types';
import { EstadoVisto, VistoTimelineEntry } from '@types/visto';
import { useVisto, useVistoTimeline } from '@hooks/useVistos';
import { ESTADO_ORDER, ESTADO_TERMINAL } from '@services/visto';
import { colors, spacing, borderRadius, typography } from '@config/theme';

type Route = RouteProp<VisaStackParamList, 'VisaTracking'>;

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

export function VisaTrackingScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute<Route>();
  const { vistoId } = route.params;

  const { data: visto, isLoading: vistoLoading } = useVisto(vistoId);
  const { data: timeline, isLoading: timelineLoading } = useVistoTimeline(vistoId);

  const isLoading = vistoLoading || timelineLoading;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('visa.tracking')}</Text>
          <View style={{ width: 24 }} />
        </View>
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.xxl }} />
      </SafeAreaView>
    );
  }

  if (!visto) return null;

  const currentState = visto.estado;
  const isTerminal = ESTADO_TERMINAL.includes(currentState);
  const currentIndex = ESTADO_ORDER.indexOf(currentState);

  // Build completed states from timeline entries
  const completedStates = new Set(timeline?.map((e: VistoTimelineEntry) => e.estado) ?? []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('visa.tracking')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Visa summary card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('visa.reference')}</Text>
            <Text style={styles.summaryValue}>{visto.referencia}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('visa.type')}</Text>
            <Text style={styles.summaryValue}>{visto.tipo}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('visa.status')}</Text>
            <View style={[styles.statusBadge, { backgroundColor: (STATUS_COLORS[currentState] || colors.textLight) + '20' }]}>
              <Icon name={STATUS_ICONS[currentState] || 'help-circle'} size={14} color={STATUS_COLORS[currentState]} />
              <Text style={[styles.statusText, { color: STATUS_COLORS[currentState] }]}>{currentState}</Text>
            </View>
          </View>
          {visto.dataEntrada && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('visa.entryDate')}</Text>
              <Text style={styles.summaryValue}>{new Date(visto.dataEntrada).toLocaleDateString('pt')}</Text>
            </View>
          )}
          {visto.dataSaida && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('visa.exitDate')}</Text>
              <Text style={styles.summaryValue}>{new Date(visto.dataSaida).toLocaleDateString('pt')}</Text>
            </View>
          )}
          {visto.motivoViagem && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('visa.travelReason')}</Text>
              <Text style={[styles.summaryValue, { flex: 1 }]}>{visto.motivoViagem}</Text>
            </View>
          )}
        </View>

        {/* Terminal state banner */}
        {isTerminal && (
          <View style={[styles.terminalBanner, { backgroundColor: (STATUS_COLORS[currentState] || colors.textLight) + '15' }]}>
            <Icon name={STATUS_ICONS[currentState]} size={22} color={STATUS_COLORS[currentState]} />
            <Text style={[styles.terminalText, { color: STATUS_COLORS[currentState] }]}>
              {currentState === 'REJEITADO' && t('visa.rejected')}
              {currentState === 'EXPIRADO' && t('visa.expired')}
              {currentState === 'CANCELADO' && t('visa.cancelled')}
            </Text>
          </View>
        )}

        {/* Timeline */}
        <Text style={styles.sectionTitle}>{t('visa.timeline')}</Text>

        <View style={styles.timeline}>
          {ESTADO_ORDER.map((estado, index) => {
            const isCompleted = completedStates.has(estado) && index < currentIndex;
            const isCurrent = estado === currentState;
            const isPast = index < currentIndex;
            const color = isCompleted || isPast
              ? colors.success
              : isCurrent
                ? STATUS_COLORS[currentState]
                : colors.textLight;

            const timelineEntry = timeline?.find((e: VistoTimelineEntry) => e.estado === estado);

            return (
              <View key={estado} style={styles.timelineStep}>
                <View style={styles.timelineIndicator}>
                  <View style={[styles.timelineDot, { backgroundColor: color }]}>
                    <Icon
                      name={isPast && !isCurrent ? 'check' : STATUS_ICONS[estado]}
                      size={16}
                      color="#fff"
                    />
                  </View>
                  {index < ESTADO_ORDER.length - 1 && (
                    <View style={[styles.timelineLine, isPast && { backgroundColor: colors.success }]} />
                  )}
                </View>
                <View style={styles.timelineContent}>
                  <Text style={[styles.timelineLabel, isCurrent && styles.timelineLabelActive]}>
                    {estado.replace(/_/g, ' ')}
                  </Text>
                  {timelineEntry && (
                    <Text style={styles.timelineDate}>
                      {new Date(timelineEntry.data).toLocaleDateString('pt', {
                        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                    </Text>
                  )}
                  {timelineEntry?.comentario && (
                    <Text style={styles.timelineComment}>{timelineEntry.comentario}</Text>
                  )}
                  {isCurrent && !timelineEntry && (
                    <Text style={styles.timelineCurrent}>{t('visa.currentStatus')}</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
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
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  summaryCard: {
    backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.md,
    marginBottom: spacing.lg,
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3,
  },
  summaryRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  summaryLabel: { ...typography.bodySmall, color: colors.textSecondary },
  summaryValue: { ...typography.body, color: colors.text, fontWeight: '500' },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.round,
  },
  statusText: { ...typography.caption, fontWeight: '600' },
  terminalBanner: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    padding: spacing.md, borderRadius: borderRadius.md, marginBottom: spacing.lg,
  },
  terminalText: { ...typography.body, fontWeight: '600' },
  sectionTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.lg },
  timeline: { paddingLeft: spacing.sm },
  timelineStep: { flexDirection: 'row', minHeight: 72 },
  timelineIndicator: { alignItems: 'center', width: 36 },
  timelineDot: {
    width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center',
  },
  timelineLine: {
    width: 2, flex: 1, backgroundColor: colors.border, marginVertical: spacing.xs,
  },
  timelineContent: { flex: 1, paddingLeft: spacing.md, paddingTop: spacing.xs },
  timelineLabel: { ...typography.body, color: colors.text },
  timelineLabelActive: { fontWeight: '700', color: colors.primary },
  timelineDate: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  timelineComment: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 4, fontStyle: 'italic' },
  timelineCurrent: { ...typography.caption, color: colors.info, marginTop: 2 },
});
