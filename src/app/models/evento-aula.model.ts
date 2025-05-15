import { PseudoEvento } from "./reposicao.model";

export class EventoAulaRequest {
    id: number = PseudoEvento.EventoId;
    data: Date = new Date;
    turma_Id: number = 0;
    roteiro_Id: number = 0;
    professor_Id: number = 0;
    sala_Id: number = 0;
    duracaoMinutos: number = 120;
    observacao: string = '';
    descricao: string = '';
    perfilCognitivo: number[] = [];
    alunos: number[] = [];
    professores: number[] = [];
    capacidadeMaximaAlunos = 12;
}

export class EventoAulaExtraRequest {
    id: number = PseudoEvento.EventoId;
    data: Date = new Date;
    // turma_Id: number = 0;
    roteiro_Id: number = 0;
    professor_Id: number = 0;
    sala_Id: number = 0;
    duracaoMinutos: number = 120;
    capacidadeMaximaAlunos: number = 12;
    observacao: string = '';
    descricao: string = '';
    perfilCognitivo: number[] = [];
    alunos: { aluno_Id: number, reposicaoDe_Evento_Id: number }[] = [];
}