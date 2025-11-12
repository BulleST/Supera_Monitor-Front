import { JornadaSuperaStatus } from "./jornada-supera-status.model";

export interface JornadaSupera_List_Aluno {
    id: number;
    nome: string;
    turma_Id?: number;
    turma?: string;
    corLegenda?: string;
    celular?: string;
    checklists: JornadaSupera_List_Checklist[];
}

export interface JornadaSupera_List_Checklist {
    id: number;
    nome: string;
    ordem: number;
    numeroSemana: number;
    status: JornadaSuperaStatus;
    items: JornadaSupera_List_Checklist_Item_Aluno[];
}

export interface JornadaSupera_List_Checklist_Item_Aluno {
    id: number;
    checklist_Item_Id: number;
    checklist_Item: string;
    aluno_Id: number;
    numeroSemana: number;
    prazo: Date;
    dataFinalizacao?: Date;
    account?: string;
    account_Id?: number;
    finalizado: boolean;
    
    observacoes?: string;
    status: JornadaSuperaStatus;
    evento_Id?: number;
}
