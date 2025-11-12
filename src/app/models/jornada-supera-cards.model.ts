import { JornadaSuperaStatus } from "./jornada-supera-status.model";

export interface JornadaSupera_Card_Checklist {
    id: number;
    nome: string;
    ordem: number;
    numeroSemana: number;
    items: JornadaSupera_Card_Checklist_Item[]
}

export interface JornadaSupera_Card_Checklist_Item {
    id: number;
    nome: string;
    numeroSemana: number;
    ordem: number;
    alunos: JornadaSupera_Card_Checklist_Item_Aluno[]
}

export interface JornadaSupera_Card_Checklist_Item_Aluno {
    id: number;
    checklist_Item_Id: number;
    numeroSemana: number;
    aluno_Id: number;
    aluno: string;
    turma_Id?: number;
    turma?: string;
    corLegenda?: string;
    prazo: Date;
    dataFinalizacao?: Date;
    account?: string;
    account_Id?: number;
    celular?: string;
    status: JornadaSuperaStatus;
    finalizado: boolean;
    evento_Id?: number;
    
}

export class JornadaSupera_Request {
    aluno_Id?: number;
    turma_Id?: number;
    professor_Id?: number;
    pendenteSemana: boolean = false;
}