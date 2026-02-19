import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity,
  ActivityIndicator, Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import QRCode from 'react-native-qrcode-svg';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { AppointmentsStackParamList } from '@navigation/types';
import { useAgendamento, useCancelAgendamento } from '@hooks/useAgendamentos';
import { EstadoAgendamento } from '@types/agendamento';
import { TIPO_ICONS, ESTADO_TERMINAL_AGENDAMENTO } from '@services/agendamento';
import { colors, spacing, borderRadius, typography } from '@config/theme';

type Route = RouteProp<AppointmentsStackParamList, 'AppointmentDetail'>;

const STATUS_COLORS: Record<EstadoAgendamento, string> = {
  PENDENTE: colors.statusPending,
  CONFIRMADO: colors.success,
  REAGENDADO: colors.info,
  CANCELADO: colors.statusRejected,
  COMPLETADO: colors.primary,
  NAO_COMPARECEU: colors.textLight,
};

export function AppointmentDetailScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute<Route>();
  const { appointmentId } = route.params;
  const { data: agendamento, isLoading } = useAgendamento(appointmentId);
  const cancelMutation = useCancelAgendamento();
  const [showQR, setShowQR] = useState(false);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('appointments.detail')}</Text>
          <View style={{ width: 24 }} />
        </View>
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.xxl }} />
      </SafeAreaView>
    );
  }

  if (!agendamento) return null;

  const statusColor = STATUS_COLORS[agendamento.estado] || colors.textLight;
  const isActive = !ESTADO_TERMINAL_AGENDAMENTO.includes(agendamento.estado);
  const canCheckIn = agendamento.estado === 'CONFIRMADO';

  const qrData = JSON.stringify({
    agendamentoId: agendamento.id,
    numero: agendamento.numeroAgendamento,
    tipo: agendamento.tipo,
    dataHora: agendamento.dataHora,
  });

  const handleCancel = () => {
    Alert.alert(
      t('appointments.cancelTitle'),
      t('appointments.cancelMessage'),
      [
        { text: t('common.back'), style: 'cancel' },
        {
          text: t('appointments.cancelConfirm'),
          style: 'destructive',
          onPress: () => {
            cancelMutation.mutate(
              { id: agendamento.id, motivo: 'Cancelado pelo cidadão' },
              {
                onSuccess: () => navigation.goBack(),
                onError: () => Alert.alert(t('common.error'), t('appointments.cancelError')),
              }
            );
          },
        },
      ]
    );
  };

  const formatDateTime = (iso: string) => {
    const d = new Date(iso);
    return {
      date: d.toLocaleDateString('pt', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
      time: d.toLocaleTimeString('pt', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const { date, time } = formatDateTime(agendamento.dataHora);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{agendamento.numeroAgendamento}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Status banner */}
        <View style={[styles.statusBanner, { backgroundColor: statusColor + '15' }]}>
          <Icon name="information" size={20} color={statusColor} />
          <Text style={[styles.statusText, { color: statusColor }]}>{agendamento.estado}</Text>
        </View>

        {/* Detail card */}
        <View style={styles.detailCard}>
          <View style={styles.detailRow}>
            <Icon name={TIPO_ICONS[agendamento.tipo]} size={20} color={colors.primary} />
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>{t('appointments.serviceType')}</Text>
              <Text style={styles.detailValue}>{agendamento.tipo.replace(/_/g, ' ')}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Icon name="calendar" size={20} color={colors.primary} />
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>{t('appointments.dateTime')}</Text>
              <Text style={styles.detailValue}>{date}</Text>
              <Text style={styles.detailValue}>{time} ({agendamento.duracaoMinutos} min)</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Icon name="map-marker" size={20} color={colors.primary} />
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>{t('appointments.location')}</Text>
              <Text style={styles.detailValue}>{agendamento.local}</Text>
            </View>
          </View>

          {agendamento.notas && (
            <>
              <View style={styles.divider} />
              <View style={styles.detailRow}>
                <Icon name="note-text" size={20} color={colors.primary} />
                <View style={styles.detailInfo}>
                  <Text style={styles.detailLabel}>{t('appointments.notes')}</Text>
                  <Text style={styles.detailValue}>{agendamento.notas}</Text>
                </View>
              </View>
            </>
          )}

          {agendamento.motivoCancelamento && (
            <>
              <View style={styles.divider} />
              <View style={styles.detailRow}>
                <Icon name="alert-circle" size={20} color={colors.error} />
                <View style={styles.detailInfo}>
                  <Text style={styles.detailLabel}>{t('appointments.cancellationReason')}</Text>
                  <Text style={[styles.detailValue, { color: colors.error }]}>
                    {agendamento.motivoCancelamento}
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>

        {/* QR Code section */}
        {canCheckIn && (
          <View style={styles.qrSection}>
            <TouchableOpacity
              style={styles.qrToggle}
              onPress={() => setShowQR(!showQR)}
            >
              <Icon name="qrcode" size={22} color={colors.primary} />
              <Text style={styles.qrToggleText}>
                {showQR ? t('appointments.hideQR') : t('appointments.showQR')}
              </Text>
              <Icon name={showQR ? 'chevron-up' : 'chevron-down'} size={20} color={colors.primary} />
            </TouchableOpacity>

            {showQR && (
              <View style={styles.qrContainer}>
                <QRCode
                  value={qrData}
                  size={200}
                  color={colors.text}
                  backgroundColor={colors.surface}
                />
                <Text style={styles.qrHint}>{t('appointments.qrHint')}</Text>
              </View>
            )}
          </View>
        )}

        {/* Actions */}
        {isActive && (
          <View style={styles.actions}>
            {canCheckIn && (
              <TouchableOpacity
                style={styles.primaryAction}
                onPress={() => setShowQR(true)}
              >
                <Icon name="qrcode-scan" size={20} color="#fff" />
                <Text style={styles.primaryActionText}>{t('appointments.checkIn')}</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.cancelAction}
              onPress={handleCancel}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? (
                <ActivityIndicator size="small" color={colors.error} />
              ) : (
                <>
                  <Icon name="cancel" size={18} color={colors.error} />
                  <Text style={styles.cancelText}>{t('appointments.cancelBooking')}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Reminder info */}
        {isActive && (
          <View style={styles.reminderCard}>
            <Icon name="bell-ring" size={18} color={colors.accent} />
            <Text style={styles.reminderText}>{t('appointments.reminderInfo')}</Text>
          </View>
        )}
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
  statusBanner: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    padding: spacing.md, borderRadius: borderRadius.md, marginBottom: spacing.lg,
  },
  statusText: { ...typography.body, fontWeight: '600' },
  detailCard: {
    backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.md,
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3,
  },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, paddingVertical: spacing.sm },
  detailInfo: { flex: 1 },
  detailLabel: { ...typography.caption, color: colors.textLight },
  detailValue: { ...typography.body, color: colors.text, fontWeight: '500' },
  divider: { height: 0.5, backgroundColor: colors.border },
  qrSection: {
    backgroundColor: colors.surface, borderRadius: borderRadius.lg,
    marginTop: spacing.lg, overflow: 'hidden',
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3,
  },
  qrToggle: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    padding: spacing.md,
  },
  qrToggleText: { ...typography.body, color: colors.primary, fontWeight: '500', flex: 1 },
  qrContainer: { alignItems: 'center', paddingBottom: spacing.lg },
  qrHint: { ...typography.caption, color: colors.textLight, marginTop: spacing.md, textAlign: 'center' },
  actions: { marginTop: spacing.lg, gap: spacing.sm },
  primaryAction: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    backgroundColor: colors.primary, paddingVertical: 14, borderRadius: borderRadius.lg,
  },
  primaryActionText: { ...typography.button, color: '#fff' },
  cancelAction: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    paddingVertical: 14, borderRadius: borderRadius.lg,
    borderWidth: 1, borderColor: colors.error,
  },
  cancelText: { ...typography.button, color: colors.error },
  reminderCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.accent + '10', padding: spacing.md,
    borderRadius: borderRadius.md, marginTop: spacing.lg,
  },
  reminderText: { ...typography.bodySmall, color: colors.textSecondary, flex: 1 },
});
