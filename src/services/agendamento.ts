import { sgcApi, unwrap, fetchPaged } from './api';
import { ApiResponse, PagedData } from '@types/api';
import {
  Agendamento, AgendamentoCreateRequest, SlotDisponivel,
  AgendamentoHistoricoEntry, TipoAgendamento,
} from '@types/agendamento';

export const AgendamentoService = {
  async getMyAgendamentos(page = 0, size = 20): Promise<PagedData<Agendamento>> {
    return fetchPaged<Agendamento>(sgcApi, '/agendamentos', page, size);
  },

  async getById(id: string): Promise<Agendamento> {
    const response = await sgcApi.get<ApiResponse<Agendamento>>(`/agendamentos/${id}`);
    return unwrap(response);
  },

  async create(request: AgendamentoCreateRequest): Promise<Agendamento> {
    const response = await sgcApi.post<ApiResponse<Agendamento>>('/agendamentos', request);
    return unwrap(response);
  },

  async getAvailableSlots(tipo: TipoAgendamento, data: string): Promise<SlotDisponivel[]> {
    const response = await sgcApi.get<ApiResponse<SlotDisponivel[]>>('/agendamentos/slots', {
      params: { tipo, data },
    });
    return unwrap(response);
  },

  async cancel(id: string, motivo: string): Promise<Agendamento> {
    const response = await sgcApi.patch<ApiResponse<Agendamento>>(`/agendamentos/${id}/estado`, {
      estado: 'CANCELADO',
      comentario: motivo,
    });
    return unwrap(response);
  },

  async getHistorico(id: string, page = 0, size = 20): Promise<PagedData<AgendamentoHistoricoEntry>> {
    return fetchPaged<AgendamentoHistoricoEntry>(sgcApi, `/agendamentos/${id}/historico`, page, size);
  },
};

/** Map appointment types to icons */
export const TIPO_ICONS: Record<TipoAgendamento, string> = {
  PASSAPORTE: 'passport',
  VISTO: 'card-account-details',
  LEGALIZACAO: 'gavel',
  REGISTO_CONSULAR: 'account-plus',
  CERTIDAO: 'certificate',
  NOTARIADO: 'file-sign',
  CONSULTA_GERAL: 'help-circle',
};

/** Terminal states for appointments */
export const ESTADO_TERMINAL_AGENDAMENTO: string[] = ['CANCELADO', 'COMPLETADO', 'NAO_COMPARECEU'];
