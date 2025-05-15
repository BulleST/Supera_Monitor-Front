export class Aluno_Restricao_Request {
    id: number = 0;
    descricao: string = '';
    aluno_Id: number = 0;
}

export class Aluno_Restricao {
    id: number = 0;
    descricao: string = '';
    account_Created: string = '';
    aluno_Id: number = 0;
    created: Date = new Date;
    deactivated?: Date;
    active: boolean = true;
}