import { PseudoEvento } from "./reposicao.model";

export class EventoAula0Request {
    id: number = PseudoEvento.EventoId;
    descricao: string = '';
    observacao: string = '';
    alunos: number[] = [];
    // aluno_Id: number = undefined as unknown as number; 
    professor_Id: number = undefined as unknown as number; 
    sala_Id: number = undefined as unknown as number; 
    data: Date = undefined as unknown as Date; 
    duracaoMinutos: number = 60;
    roteiro_Id: number = 60;
}