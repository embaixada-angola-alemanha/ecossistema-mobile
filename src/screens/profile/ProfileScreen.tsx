import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '@store/auth-store';
import { useProfile } from '@hooks/useProfile';
import { colors, spacing, borderRadius, typography } from '@config/theme';

export function ProfileScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const user = useAuthStore(s => s.user);
  const { data: cidadao, isLoading } = useProfile();

  const InfoRow = ({ icon, label, value }: { icon: string; label: string; value: string }) => (
    <View style={styles.infoRow}>
      <Icon name={icon} size={20} color={colors.textSecondary} />
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || '—'}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('profile.title')}</Text>
        <View style={{ width: 24 }} />
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.xxl }} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Icon name="account" size={48} color={colors.surface} />
            </View>
            <Text style={styles.userName}>
              {cidadao ? `${cidadao.nome} ${cidadao.apelido}` : user?.fullName || ''}
            </Text>
            <Text style={styles.userEmail}>{cidadao?.email || user?.email || ''}</Text>
            {cidadao && (
              <View style={[styles.statusBadge, { backgroundColor: cidadao.estado === 'ACTIVO' ? colors.success + '20' : colors.statusDraft + '20' }]}>
                <Text style={[styles.statusText, { color: cidadao.estado === 'ACTIVO' ? colors.success : colors.statusDraft }]}>
                  {cidadao.estado}
                </Text>
              </View>
            )}
          </View>

          {/* Personal Data */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('profile.personalData')}</Text>
            <View style={styles.card}>
              <InfoRow icon="account" label="Nome completo" value={cidadao ? `${cidadao.nome} ${cidadao.apelido}` : user?.fullName || ''} />
              <InfoRow icon="calendar" label="Data de nascimento" value={cidadao?.dataNascimento || '—'} />
              <InfoRow icon="gender-male-female" label="Sexo" value={cidadao?.sexo || '—'} />
              <InfoRow icon="earth" label="Nacionalidade" value={cidadao?.nacionalidade || 'Angolana'} />
              <InfoRow icon="map-marker" label="Naturalidade" value={cidadao?.naturalidade || '—'} />
              <InfoRow icon="card-account-details" label="NIF" value={cidadao?.nifAngolano || '—'} />
              <InfoRow icon="passport" label="Passaporte" value={cidadao?.passaporteNumero || '—'} />
            </View>
          </View>

          {/* Contact */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('profile.contactInfo')}</Text>
            <View style={styles.card}>
              <InfoRow icon="email" label="Email" value={cidadao?.email || user?.email || ''} />
              <InfoRow icon="phone" label="Telefone" value={cidadao?.telefone || '—'} />
            </View>
          </View>

          {/* Address */}
          {cidadao?.moradaAlemanha && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('profile.address')}</Text>
              <View style={styles.card}>
                <InfoRow icon="home" label="Morada" value={cidadao.moradaAlemanha} />
                <InfoRow icon="city" label="Cidade" value={cidadao.cidade || '—'} />
                <InfoRow icon="mailbox" label="Código postal" value={cidadao.codigoPostal || '—'} />
              </View>
            </View>
          )}
        </ScrollView>
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
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  avatarContainer: { alignItems: 'center', marginBottom: spacing.xl },
  avatar: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  userName: { ...typography.h3, color: colors.text, marginTop: spacing.md },
  userEmail: { ...typography.bodySmall, color: colors.textSecondary },
  statusBadge: { marginTop: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.round },
  statusText: { ...typography.caption, fontWeight: '600' },
  section: { marginBottom: spacing.lg },
  sectionTitle: { ...typography.body, color: colors.textSecondary, fontWeight: '600', marginBottom: spacing.sm },
  card: {
    backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.md,
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, gap: spacing.md },
  infoContent: { flex: 1 },
  infoLabel: { ...typography.caption, color: colors.textSecondary },
  infoValue: { ...typography.body, color: colors.text },
});
