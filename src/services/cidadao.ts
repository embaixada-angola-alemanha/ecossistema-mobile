import { sgcApi, unwrap, fetchPaged } from './api';
import { ApiResponse, PagedData } from '@types/api';
import { Cidadao } from '@types/cidadao';

export const CidadaoService = {
  async getProfile(): Promise<Cidadao> {
    const response = await sgcApi.get<ApiResponse<Cidadao>>('/cidadaos/me');
    return unwrap(response);
  },

  async update(id: string, data: Partial<Cidadao>): Promise<Cidadao> {
    const response = await sgcApi.put<ApiResponse<Cidadao>>(`/cidadaos/${id}`, data);
    return unwrap(response);
  },
};
