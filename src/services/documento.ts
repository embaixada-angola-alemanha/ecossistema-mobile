import { sgcApi, unwrap, fetchPaged } from './api';
import { ApiResponse, PagedData } from '@types/api';
import { Documento, Processo } from '@types/documento';
import RNFS from 'react-native-fs';
import { Platform } from 'react-native';

export const DocumentoService = {
  async getByProcesso(processoId: string): Promise<Documento[]> {
    const response = await sgcApi.get<ApiResponse<Documento[]>>(`/processos/${processoId}/documentos`);
    return unwrap(response);
  },

  async upload(processoId: string, fileUri: string, fileName: string, mimeType: string): Promise<Documento> {
    const formData = new FormData();
    formData.append('file', {
      uri: Platform.OS === 'ios' ? fileUri.replace('file://', '') : fileUri,
      name: fileName,
      type: mimeType,
    } as unknown as Blob);

    const response = await sgcApi.post<ApiResponse<Documento>>(
      `/processos/${processoId}/documentos`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return unwrap(response);
  },

  async download(documentId: string, fileName: string): Promise<string> {
    const downloadDir = Platform.OS === 'ios'
      ? RNFS.DocumentDirectoryPath
      : RNFS.DownloadDirectoryPath;
    const filePath = `${downloadDir}/${fileName}`;

    const token = (await sgcApi.defaults.headers.common.Authorization) as string;
    await RNFS.downloadFile({
      fromUrl: `${sgcApi.defaults.baseURL}/documentos/${documentId}/download`,
      toFile: filePath,
      headers: { Authorization: token },
    }).promise;

    return filePath;
  },

  async delete(documentId: string): Promise<void> {
    await sgcApi.delete(`/documentos/${documentId}`);
  },
};

export const ProcessoService = {
  async getMyProcessos(page = 0, size = 20): Promise<PagedData<Processo>> {
    return fetchPaged<Processo>(sgcApi, '/processos/me', page, size);
  },

  async getById(id: string): Promise<Processo> {
    const response = await sgcApi.get<ApiResponse<Processo>>(`/processos/${id}`);
    return unwrap(response);
  },
};
