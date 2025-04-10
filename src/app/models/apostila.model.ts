export class Apostila {
    id: number = 0;
    kit: string = '';
    apostila_Kit_Id: number = 0;
    nome: string = '';
    numeroTotalPaginas: number = 0;
    ordem: number = 0;
    apostila_Tipo_Id: ApostilaTipo = ApostilaTipo.Undefined;
}

export class Apostila_Kit {
    id: number = 0;
    nome: string = '';
    apostilas: Apostila[] = [];
}


export enum ApostilaTipo {
    Undefined = 0,
    Abaco = 1,
    AH = 2
}