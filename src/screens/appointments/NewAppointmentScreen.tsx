import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity,
  ActivityIndicator, Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppointmentsStackParamList } from '@navigation/types';
import { TipoAgendamento, SlotDisponivel } from '@types/agendamento';
import { TIPO_ICONS } from '@services/agendamento';
import { useAvailableSlots, useCreateAgendamento } from '@hooks/useAgendamentos';
import { colors, spacing, borderRadius, typography } from '@config/theme';

type Nav = NativeStackNavigationProp<AppointmentsStackParamList>;

const APPOINTMENT_TYPES: TipoAgendamento[] = [
  'PASSAPORTE', 'VISTO', 'LEGALIZACAO', 'REGISTO_CONSULAR',
  'CERTIDAO', 'NOTARIADO', 'CONSULTA_GERAL',
];

/** Generate next 14 days for calendar strip */
function getNext14Days(): Date[] {
  const days: Date[] = [];
  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    // Skip weekends
    if (d.getDay() !== 0 && d.getDay() !== 6) {
      days.push(d);
    }
  }
  return days;
}

export function NewAppointmentScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const createAgendamento = useCreateAgendamento();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedType, setSelectedType] = useState<TipoAgendamento | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<SlotDisponivel | null>(null);

  const availableDays = useMemo(() => getNext14Days(), []);

  const dateParam = selectedDate
    ? selectedDate.toISOString().split('T')[0]
    : null;

  const { data: slots, isLoading: slotsLoading } = useAvailableSlots(selectedType, dateParam);

  const handleSelectType = (tipo: TipoAgendamento) => {
    setSelectedType(tipo);
    setSelectedDate(null);
    setSelectedSlot(null);
    setStep(2);
  };

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleSelectSlot = (slot: SlotDisponivel) => {
    setSelectedSlot(slot);
    setStep(3);
  };

  const handleConfirm = () => {
    if (!selectedType || !selectedSlot) return;

    createAgendamento.mutate(
      { tipo: selectedType, dataHora: selectedSlot.dataHora },
      {
        onSuccess: (agendamento) => {
          Alert.alert(
            t('appointments.confirmed'),
            t('appointments.confirmedMessage', { ref: agendamento.numeroAgendamento }),
            [{
              text: 'OK',
              onPress: () => navigation.navigate('AppointmentDetail', { appointmentId: agendamento.id }),
            }]
          );
        },
        onError: () => {
          Alert.alert(t('common.error'), t('appointments.bookingError'));
        },
      }
    );
  };

  const formatSlotTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString('pt', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          if (step > 1) setStep((step - 1) as 1 | 2);
          else navigation.goBack();
        }}>
          <Icon name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('appointments.new')}</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Progress indicator */}
      <View style={styles.progressBar}>
        {[1, 2, 3].map(s => (
          <View key={s} style={styles.progressStep}>
            <View style={[styles.progressDot, step >= s && styles.progressDotActive]} />
            <Text style={[styles.progressLabel, step >= s && styles.progressLabelActive]}>
              {s === 1 ? t('appointments.stepType') : s === 2 ? t('appointments.stepDateTime') : t('appointments.stepConfirm')}
            </Text>
          </View>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Step 1: Select type */}
        {step === 1 && (
          <>
            <Text style={styles.sectionTitle}>{t('appointments.selectType')}</Text>
            <View style={styles.typeGrid}>
              {APPOINTMENT_TYPES.map(tipo => (
                <TouchableOpacity
                  key={tipo}
                  style={[styles.typeCard, selectedType === tipo && styles.typeCardActive]}
                  onPress={() => handleSelectType(tipo)}
                >
                  <Icon
                    name={TIPO_ICONS[tipo]}
                    size={32}
                    color={selectedType === tipo ? colors.primary : colors.textSecondary}
                  />
                  <Text style={[styles.typeLabel, selectedType === tipo && styles.typeLabelActive]}>
                    {tipo.replace(/_/g, ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* Step 2: Select date + slot */}
        {step === 2 && selectedType && (
          <>
            <Text style={styles.sectionTitle}>{t('appointments.selectDate')}</Text>

            {/* Calendar strip */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.calendarStrip}>
              {availableDays.map((day) => {
                const isSelected = selectedDate?.toDateString() === day.toDateString();
                const isToday = day.toDateString() === new Date().toDateString();
                return (
                  <TouchableOpacity
                    key={day.toISOString()}
                    style={[styles.dayCard, isSelected && styles.dayCardActive]}
                    onPress={() => handleSelectDate(day)}
                  >
                    <Text style={[styles.dayWeekday, isSelected && styles.dayTextActive]}>
                      {day.toLocaleDateString('pt', { weekday: 'short' }).slice(0, 3)}
                    </Text>
                    <Text style={[styles.dayNumber, isSelected && styles.dayTextActive]}>
                      {day.getDate()}
                    </Text>
                    <Text style={[styles.dayMonth, isSelected && styles.dayTextActive]}>
                      {day.toLocaleDateString('pt', { month: 'short' })}
                    </Text>
                    {isToday && <View style={styles.todayDot} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Time slots */}
            {selectedDate && (
              <>
                <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>
                  {t('appointments.selectTime')}
                </Text>
                {slotsLoading ? (
                  <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: spacing.md }} />
                ) : !slots || slots.length === 0 ? (
                  <View style={styles.noSlots}>
                    <Icon name="calendar-remove" size={32} color={colors.textLight} />
                    <Text style={styles.noSlotsText}>{t('appointments.noSlots')}</Text>
                  </View>
                ) : (
                  <View style={styles.slotsGrid}>
                    {slots.map((slot, idx) => {
                      const isSelected = selectedSlot?.dataHora === slot.dataHora;
                      return (
                        <TouchableOpacity
                          key={idx}
                          style={[styles.slotChip, isSelected && styles.slotChipActive]}
                          onPress={() => handleSelectSlot(slot)}
                        >
                          <Icon
                            name="clock-outline"
                            size={14}
                            color={isSelected ? '#fff' : colors.primary}
                          />
                          <Text style={[styles.slotText, isSelected && styles.slotTextActive]}>
                            {formatSlotTime(slot.dataHora)}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </>
            )}
          </>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && selectedType && selectedSlot && (
          <>
            <Text style={styles.sectionTitle}>{t('appointments.reviewBooking')}</Text>

            <View style={styles.confirmCard}>
              <View style={styles.confirmRow}>
                <Icon name={TIPO_ICONS[selectedType]} size={20} color={colors.primary} />
                <View style={styles.confirmDetail}>
                  <Text style={styles.confirmLabel}>{t('appointments.serviceType')}</Text>
                  <Text style={styles.confirmValue}>{selectedType.replace(/_/g, ' ')}</Text>
                </View>
              </View>

              <View style={styles.confirmDivider} />

              <View style={styles.confirmRow}>
                <Icon name="calendar" size={20} color={colors.primary} />
                <View style={styles.confirmDetail}>
                  <Text style={styles.confirmLabel}>{t('appointments.dateTime')}</Text>
                  <Text style={styles.confirmValue}>
                    {new Date(selectedSlot.dataHora).toLocaleDateString('pt', {
                      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </Text>
                  <Text style={styles.confirmValue}>
                    {formatSlotTime(selectedSlot.dataHora)} ({selectedSlot.duracaoMinutos} min)
                  </Text>
                </View>
              </View>

              <View style={styles.confirmDivider} />

              <View style={styles.confirmRow}>
                <Icon name="map-marker" size={20} color={colors.primary} />
                <View style={styles.confirmDetail}>
                  <Text style={styles.confirmLabel}>{t('appointments.location')}</Text>
                  <Text style={styles.confirmValue}>Embaixada de Angola — Berlim</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.confirmButton, createAgendamento.isPending && styles.confirmDisabled]}
              onPress={handleConfirm}
              disabled={createAgendamento.isPending}
            >
              {createAgendamento.isPending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Icon name="check-circle" size={20} color="#fff" />
                  <Text style={styles.confirmButtonText}>{t('appointments.confirmBooking')}</Text>
                </>
              )}
            </TouchableOpacity>
          </>
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
  progressBar: {
    flexDirection: 'row', justifyContent: 'space-around',
    paddingVertical: spacing.md, backgroundColor: colors.surface,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  progressStep: { alignItems: 'center' },
  progressDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: colors.border, marginBottom: 4,
  },
  progressDotActive: { backgroundColor: colors.primary },
  progressLabel: { ...typography.caption, color: colors.textLight },
  progressLabelActive: { color: colors.primary, fontWeight: '600' },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  sectionTitle: { ...typography.body, color: colors.textSecondary, fontWeight: '600', marginBottom: spacing.sm },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  typeCard: {
    width: '47%', backgroundColor: colors.surface, borderRadius: borderRadius.lg,
    padding: spacing.md, alignItems: 'center', borderWidth: 1.5, borderColor: colors.border,
  },
  typeCardActive: { borderColor: colors.primary, backgroundColor: colors.primary + '08' },
  typeLabel: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs, textAlign: 'center' },
  typeLabelActive: { color: colors.primary, fontWeight: '600' },
  calendarStrip: { maxHeight: 100 },
  dayCard: {
    width: 64, alignItems: 'center', paddingVertical: spacing.sm, marginRight: spacing.sm,
    borderRadius: borderRadius.lg, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border,
  },
  dayCardActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  dayWeekday: { ...typography.caption, color: colors.textSecondary, textTransform: 'uppercase' },
  dayNumber: { ...typography.h3, color: colors.text },
  dayMonth: { ...typography.caption, color: colors.textLight },
  dayTextActive: { color: '#fff' },
  todayDot: {
    width: 4, height: 4, borderRadius: 2,
    backgroundColor: colors.accent, marginTop: 2,
  },
  noSlots: { alignItems: 'center', paddingVertical: spacing.xl },
  noSlotsText: { ...typography.bodySmall, color: colors.textLight, marginTop: spacing.sm },
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  slotChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: borderRadius.round, borderWidth: 1, borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  slotChipActive: { backgroundColor: colors.primary },
  slotText: { ...typography.bodySmall, color: colors.primary, fontWeight: '500' },
  slotTextActive: { color: '#fff' },
  confirmCard: {
    backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.md,
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3,
  },
  confirmRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, paddingVertical: spacing.sm },
  confirmDetail: { flex: 1 },
  confirmLabel: { ...typography.caption, color: colors.textLight },
  confirmValue: { ...typography.body, color: colors.text, fontWeight: '500' },
  confirmDivider: { height: 0.5, backgroundColor: colors.border, marginVertical: spacing.xs },
  confirmButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    backgroundColor: colors.primary, paddingVertical: 14, borderRadius: borderRadius.lg,
    marginTop: spacing.xl,
  },
  confirmDisabled: { opacity: 0.5 },
  confirmButtonText: { ...typography.button, color: '#fff' },
});
