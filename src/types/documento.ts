import { UUID, ISODateString } from './api';

export type TipoDocumento = 'PASSAPORTE' | 'BI' | 'CEDULA' | 'TITULO_VIAGEM' | 'CERTIFICADO' | 'OUTRO';

export interface Documento {
  id: UUID;
  nome: string;
  tipo: string;
  tamanho: number;
  url: string;
  createdAt: ISODateString;
}

export type EstadoProcesso = 'RASCUNHO' | 'SUBMETIDO' | 'EM_ANALISE' | 'APROVADO' | 'REJEITADO' | 'CERTIFICADO_EMITIDO' | 'ENTREGUE' | 'ARQUIVADO';
export type TipoProcesso = 'REGISTO_CIVIL' | 'SERVICO_NOTARIAL' | 'VISTO';

export interface Processo {
  id: UUID;
  cidadaoId: UUID;
  tipo: TipoProcesso;
  estado: EstadoProcesso;
  referencia: string;
  descricao?: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}
