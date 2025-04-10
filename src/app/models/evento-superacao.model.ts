import { PseudoEvento } from "./reposicao.model";

export class EventoSuperacaoRequest {
    id: number = PseudoEvento.EventoId;
    data: Date = undefined as unknown as Date; 
    descricao: string = 'Superação';
    observacao: string = '';
    duracaoMinutos: number = 60; 
    sala_Id: number = undefined as unknown as number; 
    alunos: number[] = []; 
    professores: number[] = []; 
}
