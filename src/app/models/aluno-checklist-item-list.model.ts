export class Aluno_Checklist_Item_View {
    id: number = 0;
    aluno_Id: number = 0;
    checklist_Id: number = 0;
    checklist_Item_Id: number = 0;
    account_Finalizacao_Id: number = 0;
    account_Finalizacao: string = '';
    professor_Id: number = 0;
    turma_Id: number = 0;
    aluno: string = '';
    celular: string = '';
    professor: string = '';
    turma: string = '';
    corLegenda: string = '';
    checklist: string = '';
    checklist_Item: string = '';
    prazo: Date = new Date;
    dataFinalizacao?: Date;
    finalizado: boolean = false;
    status: string = '';
    observacoes: string = '';
    email: string = '';
    diaSemana: number = 0;
    horario: Date = new Date;
    linkGrupo?: string;
}

export class JornadaSuperaRequest {
    aluno_Id?: number;
    turma_Id?: number;
    professor_Id?: number;
    pendentesSemana: boolean = false;
}