import { PseudoEvento } from "./reposicao.model";

export class EventoAulaRequest {
    id: number = PseudoEvento.EventoId;
    data: Date = new Date;
    turma_Id: number = undefined as unknown as number;
    roteiro_Id: number = undefined as unknown as number;
    professor_Id: number = undefined as unknown as number;
    sala_Id: number = undefined as unknown as number;
    duracaoMinutos: number = 120;
    observacao: string = '';
    descricao: string = '';
    perfilCognitivo: number[] = [];
    alunos: number[] = [];
    professores: number[] = [];
    capacidadeMaximaAlunos = 12;
}

export class EventoTurmaExtraRequest {
    id: number = PseudoEvento.EventoId;
    data: Date = new Date;
    roteiro_Id?: number;
    professor_Id: number = undefined as unknown as number;
    sala_Id: number = undefined as unknown as number;
    duracaoMinutos: number = 120;
    capacidadeMaximaAlunos: number = 12;
    observacao: string = '';
    descricao: string = '';
    perfilCognitivo: number[] = [];
    alunos: { aluno_Id: number, reposicaoDe_Evento_Id: number }[] = [];
}