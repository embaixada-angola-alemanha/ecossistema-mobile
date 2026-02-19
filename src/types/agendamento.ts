import { UUID, ISODateString } from './api';

export type TipoAgendamento =
  | 'PASSAPORTE'
  | 'VISTO'
  | 'LEGALIZACAO'
  | 'REGISTO_CONSULAR'
  | 'CERTIDAO'
  | 'NOTARIADO'
  | 'CONSULTA_GERAL';

export type EstadoAgendamento =
  | 'PENDENTE'
  | 'CONFIRMADO'
  | 'REAGENDADO'
  | 'CANCELADO'
  | 'COMPLETADO'
  | 'NAO_COMPARECEU';

export interface Agendamento {
  id: UUID;
  cidadaoId: UUID;
  cidadaoNome: string;
  tipo: TipoAgendamento;
  numeroAgendamento: string;
  estado: EstadoAgendamento;
  dataHora: ISODateString;
  duracaoMinutos: number;
  local: string;
  notas?: string;
  motivoCancelamento?: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface AgendamentoCreateRequest {
  tipo: TipoAgendamento;
  dataHora: string;
  notas?: string;
}

export interface SlotDisponivel {
  dataHora: ISODateString;
  duracaoMinutos: number;
  tipo: TipoAgendamento;
}

export interface AgendamentoHistoricoEntry {
  id: UUID;
  agendamentoId: UUID;
  estadoAnterior?: EstadoAgendamento;
  estadoNovo: EstadoAgendamento;
  comentario?: string;
  alteradoPor: string;
  createdAt: ISODateString;
}
