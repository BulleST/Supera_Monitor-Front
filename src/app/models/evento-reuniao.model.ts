import { PseudoEvento } from "./reposicao.model";

export class EventoReuniaoRequest {
    id: number = PseudoEvento.EventoId;
    data: Date = undefined as unknown as Date; 
    descricao: string = 'Reunião';
    observacao: string = '';
    duracaoMinutos: number = 60; 
    sala_Id: number = undefined as unknown as number; 
    professores: number[] = []; 
    alunos: number[] = []; 
}