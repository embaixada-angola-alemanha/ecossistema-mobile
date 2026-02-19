import { UUID, ISODateString } from './api';

export type TipoVisto = 'TURISMO' | 'NEGOCIOS' | 'TRABALHO' | 'ESTUDO' | 'TRANSITO' | 'DIPLOMATICO' | 'CORTESIA';
export type EstadoVisto = 'RASCUNHO' | 'SUBMETIDO' | 'EM_ANALISE' | 'APROVADO' | 'REJEITADO' | 'EMITIDO' | 'ENTREGUE' | 'EXPIRADO' | 'CANCELADO';

export interface Visto {
  id: UUID;
  cidadaoId: UUID;
  tipo: TipoVisto;
  estado: EstadoVisto;
  referencia: string;
  dataEntrada?: ISODateString;
  dataSaida?: ISODateString;
  motivoViagem?: string;
  localAlojamento?: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface VistoCreateRequest {
  tipo: TipoVisto;
  dataEntrada?: string;
  dataSaida?: string;
  motivoViagem?: string;
  localAlojamento?: string;
}

export interface VistoTimelineEntry {
  estado: EstadoVisto;
  data: ISODateString;
  comentario?: string;
}
