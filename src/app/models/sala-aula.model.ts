import { Evento } from "./evento.model";

export class SalaAula {
    id: number = 0;
    numeroSala: number = 0;
    andar: number = 0;
    descricao: string = '';
    online: boolean = false;

    // Não mapeados
    disponivel?: boolean;
    disponivelEvent?: Evento;
}


export enum SalaAulaId {
    Online1 = 1,
    Online2 = 2,
    SalaComercial = 3,
    SalaPedagogica = 4,
    SalaDiretoria = 5,
    NeuroSalaNeuronio = 6,
    NeuroSalaSinapse = 7,
    NeuroSalaAxonio = 8,
}
