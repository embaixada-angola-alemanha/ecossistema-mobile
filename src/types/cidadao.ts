import { UUID, ISODateString } from './api';

export type EstadoCidadao = 'ACTIVO' | 'INACTIVO' | 'SUSPENSO' | 'FALECIDO';
export type Sexo = 'MASCULINO' | 'FEMININO';

export interface Cidadao {
  id: UUID;
  nome: string;
  apelido: string;
  dataNascimento: ISODateString;
  sexo: Sexo;
  nacionalidade: string;
  naturalidade: string;
  nifAngolano?: string;
  passaporteNumero?: string;
  email: string;
  telefone: string;
  moradaAlemanha?: string;
  cidade?: string;
  codigoPostal?: string;
  estado: EstadoCidadao;
  fotoUrl?: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}
