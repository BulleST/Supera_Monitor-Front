import { CalendarioAula } from "./calendario.model";
import { Evento } from "./evento.model";

export class SalaAula {
    id: number = 0;
    numeroSala: number = 0;
    andar: number = 0;

    deactivated?: Date;
    active: boolean = true;

    // Não mapeados
    disponivel?: boolean;
    disponivelEvent?: Evento;
}


export enum SalaAulaId {
    professores = 14,
    online = 13,

}