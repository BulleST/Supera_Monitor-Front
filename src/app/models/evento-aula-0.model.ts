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
  roteiro_Id: number = 60;
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
  evento_Id: number;
  observacao?: string;
  alunos: ParticipacaoAulaZeroModel[];
}
