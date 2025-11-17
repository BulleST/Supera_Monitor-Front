export class Feriado {
    id: number = 0;
    data: Date = new Date;
    descricao: string = '';
    account_Created_Id: number = 0;
    account_Created: string = '';
    created: Date = new Date;
    deactivated?: Date;
    active: boolean = true;
}

export class InsertFeriadoRequest {
    data: Date = new Date;
    descricao: string = '';
}

export class UpdateFeriadoRequest {
    id: number = 0;
    data: Date = new Date;
    descricao: string = '';
}