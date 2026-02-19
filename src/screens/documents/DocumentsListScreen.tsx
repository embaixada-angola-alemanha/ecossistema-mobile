import React, { useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, SafeAreaView, TouchableOpacity,
  ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { launchCamera, launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
import { useProcessos } from '@hooks/useProcessos';
import { Processo, EstadoProcesso } from '@types/documento';
import { DocumentoService } from '@services/documento';
import { colors, spacing, borderRadius, typography } from '@config/theme';

const STATUS_COLORS: Record<EstadoProcesso, string> = {
  RASCUNHO: colors.statusDraft,
  SUBMETIDO: colors.info,
  EM_ANALISE: colors.statusInProgress,
  APROVADO: colors.statusApproved,
  REJEITADO: colors.statusRejected,
  CERTIFICADO_EMITIDO: colors.success,
  ENTREGUE: colors.statusIssued,
  ARQUIVADO: colors.textLight,
};

const STATUS_ICONS: Record<EstadoProcesso, string> = {
  RASCUNHO: 'pencil',
  SUBMETIDO: 'send',
  EM_ANALISE: 'magnify',
  APROVADO: 'check-circle',
  REJEITADO: 'close-circle',
  CERTIFICADO_EMITIDO: 'certificate',
  ENTREGUE: 'hand-extended',
  ARQUIVADO: 'archive',
};

export function DocumentsListScreen() {
  const { t } = useTranslation();
  const { data, isLoading, refetch, fetchNextPage, hasNextPage } = useProcessos();
  const [uploading, setUploading] = useState(false);

  const processos = data?.pages.flatMap(p => p.content) ?? [];

  const handleUpload = () => {
    Alert.alert(
      t('documents.upload'),
      'Escolha a origem do documento',
      [
        {
          text: 'Câmara',
          onPress: () => launchCamera({ mediaType: 'photo', quality: 0.8 }, handleImageResult),
        },
        {
          text: 'Galeria',
          onPress: () => launchImageLibrary({ mediaType: 'mixed' }, handleImageResult),
        },
        { text: t('common.cancel'), style: 'cancel' },
      ]
    );
  };

  const handleImageResult = async (response: ImagePickerResponse) => {
    if (response.didCancel || !response.assets?.[0]) return;
    const asset = response.assets[0];
    if (!asset.uri || !asset.fileName) return;

    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      Alert.alert('Sucesso', 'Documento capturado. Seleccione o processo de destino.');
    }, 1000);
  };

  const handleDownloadCertificate = async (processoId: string, referencia: string) => {
    try {
      const path = await DocumentoService.download(processoId, `certificado_${referencia}.pdf`);
      Alert.alert('Sucesso', `Certificado guardado em: ${path}`);
    } catch {
      Alert.alert(t('common.error'), 'Erro ao descarregar certificado');
    }
  };

  const renderProcesso = ({ item }: { item: Processo }) => {
    const statusColor = STATUS_COLORS[item.estado] || colors.textLight;
    const statusIcon = STATUS_ICONS[item.estado] || 'help-circle';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <Icon name={statusIcon} size={20} color={statusColor} />
            <Text style={styles.cardRef}>{item.referencia}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: statusColor + '20' }]}>
            <Text style={[styles.badgeText, { color: statusColor }]}>{item.estado}</Text>
          </View>
        </View>
        <Text style={styles.cardType}>{item.tipo}</Text>
        <Text style={styles.cardDate}>{new Date(item.createdAt).toLocaleDateString('pt')}</Text>

        {item.estado === 'CERTIFICADO_EMITIDO' && (
          <TouchableOpacity
            style={styles.downloadButton}
            onPress={() => handleDownloadCertificate(item.id, item.referencia)}
          >
            <Icon name="download" size={16} color={colors.primary} />
            <Text style={styles.downloadText}>{t('documents.certificate')}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('documents.title')}</Text>
        <TouchableOpacity style={styles.uploadButton} onPress={handleUpload} disabled={uploading}>
          {uploading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Icon name="camera" size={18} color="#fff" />
              <Text style={styles.uploadText}>{t('documents.upload')}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.xxl }} />
      ) : processos.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="file-document-outline" size={64} color={colors.textLight} />
          <Text style={styles.emptyTitle}>{t('documents.noDocuments')}</Text>
        </View>
      ) : (
        <FlatList
          data={processos}
          keyExtractor={item => item.id}
          renderItem={renderProcesso}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={false} onRefresh={() => refetch()} colors={[colors.primary]} />}
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
  uploadButton: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    backgroundColor: colors.primary, paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  uploadText: { ...typography.caption, color: '#fff', fontWeight: '600' },
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
  cardType: { ...typography.bodySmall, color: colors.textSecondary, marginTop: spacing.xs },
  cardDate: { ...typography.caption, color: colors.textLight, marginTop: 2 },
  downloadButton: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    marginTop: spacing.sm, paddingVertical: spacing.sm,
    borderTopWidth: 0.5, borderTopColor: colors.border,
  },
  downloadText: { ...typography.bodySmall, color: colors.primary, fontWeight: '500' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyTitle: { ...typography.body, color: colors.textLight, marginTop: spacing.md },
});
