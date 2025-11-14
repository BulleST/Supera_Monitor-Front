import { PseudoEvento } from './reposicao.model';

export class EventoAula0Request {
  id: number = PseudoEvento.EventoId;
  descricao: string = '';
  observacao: string = '';
  alunos: number[] = [];
  professor_Id: number = undefined as unknown as number;
  sala_Id: number = undefined as unknown as number;
  data: Date = undefined as unknown as Date;
  duracaoMinutos: number = 60;
  roteiro_Id?: number = 0;
}

export interface ParticipacaoAulaZeroModel {
  participacao_Id: number;
  presente: boolean;
  aluno_Id: number;
  turma_Id: number;
  perfilCognitivo_Id: number;
  apostila_Kit_Id: number;
}

export interface FinalizarAulaZeroRequest {
  duracaoMinutos: number;
  evento_Id: number;
  sala_Id: number;
  turma_Id?: number;
  roteiro_Id?: number;
  capacidadeMaximaAlunos: number;
  descricao: string;
  observacao?: string;
  alunos: ParticipacaoAulaZeroModel[];
  perfilCognitivo: number[];
  professores: number[];
}
