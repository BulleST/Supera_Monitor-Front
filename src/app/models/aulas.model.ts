export class AulaCreateRequest {
    turma_Id: number = 0;
    data: Date = new Date;
    professor_Id: number = 0;
    observacao: string = '';
}

export class AulaEditRequest {
    id: number = 0;
    data: Date = new Date;
    professor_Id: number = 0;
    observacao: string = '';
}