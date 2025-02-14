export class Apostila {
    id: number = 0;
    apostila_Kit: string = '';
    apostila_Kit_Id: number = 0;
    nome: string = '';
    numeroTotalPaginas: number = 0;
    ordem: number = 0;
    tipo: 'Ábaco' | 'AH' = undefined as any;
}

export class Apostila_Kit {
    id: number = 0;
    nome: string = '';
    apostilas: Apostila[] = [];
}