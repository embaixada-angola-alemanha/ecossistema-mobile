import { sgcApi, unwrap, fetchPaged } from './api';
import { ApiResponse, PagedData } from '@types/api';
import { Visto, VistoCreateRequest, VistoTimelineEntry, EstadoVisto } from '@types/visto';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DRAFT_KEY = 'visa_drafts';

export const VistoService = {
  async getMyVistos(page = 0, size = 20): Promise<PagedData<Visto>> {
    return fetchPaged<Visto>(sgcApi, '/vistos/me', page, size);
  },

  async getById(id: string): Promise<Visto> {
    const response = await sgcApi.get<ApiResponse<Visto>>(`/vistos/${id}`);
    return unwrap(response);
  },

  async create(request: VistoCreateRequest): Promise<Visto> {
    const response = await sgcApi.post<ApiResponse<Visto>>('/vistos', request);
    return unwrap(response);
  },

  async getTimeline(vistoId: string): Promise<VistoTimelineEntry[]> {
    const response = await sgcApi.get<ApiResponse<VistoTimelineEntry[]>>(`/vistos/${vistoId}/timeline`);
    return unwrap(response);
  },

  // === Offline draft management ===

  async saveDraft(draft: VistoCreateRequest & { draftId: string }): Promise<void> {
    const drafts = await VistoService.getDrafts();
    const existing = drafts.findIndex(d => d.draftId === draft.draftId);
    if (existing >= 0) {
      drafts[existing] = draft;
    } else {
      drafts.push(draft);
    }
    await AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(drafts));
  },

  async getDrafts(): Promise<(VistoCreateRequest & { draftId: string })[]> {
    const data = await AsyncStorage.getItem(DRAFT_KEY);
    return data ? JSON.parse(data) : [];
  },

  async deleteDraft(draftId: string): Promise<void> {
    const drafts = await VistoService.getDrafts();
    const filtered = drafts.filter(d => d.draftId !== draftId);
    await AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(filtered));
  },

  async submitDraft(draftId: string): Promise<Visto> {
    const drafts = await VistoService.getDrafts();
    const draft = drafts.find(d => d.draftId === draftId);
    if (!draft) throw new Error('Draft not found');

    const { draftId: _, ...request } = draft;
    const visto = await VistoService.create(request);
    await VistoService.deleteDraft(draftId);
    return visto;
  },
};

/** Map EstadoVisto to a visual order index for timeline display */
export const ESTADO_ORDER: EstadoVisto[] = [
  'RASCUNHO', 'SUBMETIDO', 'EM_ANALISE', 'APROVADO', 'EMITIDO', 'ENTREGUE'
];

export const ESTADO_TERMINAL: EstadoVisto[] = ['REJEITADO', 'EXPIRADO', 'CANCELADO'];
