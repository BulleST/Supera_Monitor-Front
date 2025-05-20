import { PseudoEvento } from "./reposicao.model";

export class EventoOficinaRequest {
    id: number = PseudoEvento.EventoId;
    data: Date = undefined as unknown as Date; 
    descricao: string = 'Oficina';
    observacao: string = '';
    capacidadeMaximaAlunos: number = 12; 
    duracaoMinutos: number = 60; 
    sala_Id: number = undefined as unknown as number; 
    professores: number[] = []; 
    alunos: number[] = []; 
}