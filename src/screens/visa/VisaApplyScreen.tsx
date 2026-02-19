import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity,
  TextInput, ActivityIndicator, Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { VisaStackParamList } from '@navigation/types';
import { TipoVisto } from '@types/visto';
import { VistoService } from '@services/visto';
import { useCreateVisto } from '@hooks/useVistos';
import { colors, spacing, borderRadius, typography } from '@config/theme';

type Nav = NativeStackNavigationProp<VisaStackParamList>;

const VISA_TYPES: { key: TipoVisto; icon: string }[] = [
  { key: 'TURISMO', icon: 'airplane' },
  { key: 'NEGOCIOS', icon: 'briefcase' },
  { key: 'TRABALHO', icon: 'hammer-wrench' },
  { key: 'ESTUDO', icon: 'school' },
  { key: 'TRANSITO', icon: 'transit-connection-variant' },
  { key: 'DIPLOMATICO', icon: 'shield-star' },
  { key: 'CORTESIA', icon: 'hand-heart' },
];

export function VisaApplyScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const createVisto = useCreateVisto();

  const [selectedType, setSelectedType] = useState<TipoVisto | null>(null);
  const [motivoViagem, setMotivoViagem] = useState('');
  const [localAlojamento, setLocalAlojamento] = useState('');
  const [dataEntrada, setDataEntrada] = useState('');
  const [dataSaida, setDataSaida] = useState('');

  const canSubmit = !!selectedType && !createVisto.isPending;

  const handleSubmit = () => {
    if (!selectedType) return;

    const request = {
      tipo: selectedType,
      motivoViagem: motivoViagem.trim() || undefined,
      localAlojamento: localAlojamento.trim() || undefined,
      dataEntrada: dataEntrada.trim() || undefined,
      dataSaida: dataSaida.trim() || undefined,
    };

    createVisto.mutate(request, {
      onSuccess: (visto) => {
        Alert.alert(
          t('visa.submitSuccess'),
          t('visa.submitSuccessMessage'),
          [{ text: 'OK', onPress: () => navigation.navigate('VisaTracking', { vistoId: visto.id }) }]
        );
      },
      onError: () => {
        Alert.alert(t('common.error'), t('visa.submitError'));
      },
    });
  };

  const handleSaveDraft = async () => {
    if (!selectedType) return;

    const draftId = `draft_${Date.now()}`;
    await VistoService.saveDraft({
      draftId,
      tipo: selectedType,
      motivoViagem: motivoViagem.trim() || undefined,
      localAlojamento: localAlojamento.trim() || undefined,
      dataEntrada: dataEntrada.trim() || undefined,
      dataSaida: dataSaida.trim() || undefined,
    });

    Alert.alert(
      t('visa.draftSaved'),
      t('visa.draftSavedMessage'),
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('visa.apply')}</Text>
        <TouchableOpacity onPress={handleSaveDraft} disabled={!selectedType}>
          <Icon name="content-save-outline" size={24} color={selectedType ? colors.primary : colors.textLight} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>{t('visa.type')}</Text>
        <View style={styles.typeGrid}>
          {VISA_TYPES.map(vt => (
            <TouchableOpacity
              key={vt.key}
              style={[styles.typeCard, selectedType === vt.key && styles.typeCardActive]}
              onPress={() => setSelectedType(vt.key)}
            >
              <Icon name={vt.icon} size={28} color={selectedType === vt.key ? colors.primary : colors.textSecondary} />
              <Text style={[styles.typeLabel, selectedType === vt.key && styles.typeLabelActive]}>
                {vt.key}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>{t('visa.travelReason')}</Text>
        <TextInput
          style={styles.textInput}
          placeholder={t('visa.travelReasonPlaceholder')}
          placeholderTextColor={colors.textLight}
          multiline
          numberOfLines={4}
          value={motivoViagem}
          onChangeText={setMotivoViagem}
        />

        <Text style={styles.sectionTitle}>{t('visa.accommodation')}</Text>
        <TextInput
          style={styles.inputField}
          placeholder={t('visa.accommodationPlaceholder')}
          placeholderTextColor={colors.textLight}
          value={localAlojamento}
          onChangeText={setLocalAlojamento}
        />

        <View style={styles.dateRow}>
          <View style={styles.dateField}>
            <Text style={styles.dateLabel}>{t('visa.entryDate')}</Text>
            <TextInput
              style={styles.inputField}
              placeholder="DD/MM/AAAA"
              placeholderTextColor={colors.textLight}
              value={dataEntrada}
              onChangeText={setDataEntrada}
              keyboardType="numeric"
              maxLength={10}
            />
          </View>
          <View style={styles.dateField}>
            <Text style={styles.dateLabel}>{t('visa.exitDate')}</Text>
            <TextInput
              style={styles.inputField}
              placeholder="DD/MM/AAAA"
              placeholderTextColor={colors.textLight}
              value={dataSaida}
              onChangeText={setDataSaida}
              keyboardType="numeric"
              maxLength={10}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, !canSubmit && styles.submitDisabled]}
          disabled={!canSubmit}
          onPress={handleSubmit}
        >
          {createVisto.isPending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.submitText}>{t('visa.submit')}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.draftButton}
          disabled={!selectedType}
          onPress={handleSaveDraft}
        >
          <Icon name="content-save-outline" size={18} color={selectedType ? colors.primary : colors.textLight} />
          <Text style={[styles.draftText, !selectedType && { color: colors.textLight }]}>
            {t('visa.saveDraft')}
          </Text>
        </TouchableOpacity>
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
  sectionTitle: {
    ...typography.body, color: colors.textSecondary, fontWeight: '600',
    marginBottom: spacing.sm, marginTop: spacing.md,
  },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  typeCard: {
    width: '30%', backgroundColor: colors.surface, borderRadius: borderRadius.lg,
    padding: spacing.md, alignItems: 'center', borderWidth: 1.5, borderColor: colors.border,
  },
  typeCardActive: { borderColor: colors.primary, backgroundColor: colors.primary + '08' },
  typeLabel: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs, textAlign: 'center' },
  typeLabelActive: { color: colors.primary, fontWeight: '600' },
  textInput: {
    backgroundColor: colors.surface, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border,
    padding: spacing.md, ...typography.body, color: colors.text, textAlignVertical: 'top', minHeight: 100,
  },
  inputField: {
    backgroundColor: colors.surface, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border,
    padding: spacing.md, ...typography.body, color: colors.text, height: 48,
  },
  dateRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  dateField: { flex: 1 },
  dateLabel: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.xs },
  submitButton: {
    backgroundColor: colors.primary, paddingVertical: 14, borderRadius: borderRadius.lg,
    alignItems: 'center', marginTop: spacing.xl,
  },
  submitDisabled: { opacity: 0.5 },
  submitText: { ...typography.button, color: '#fff' },
  draftButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs,
    paddingVertical: spacing.md, marginTop: spacing.sm,
  },
  draftText: { ...typography.body, color: colors.primary, fontWeight: '500' },
});
