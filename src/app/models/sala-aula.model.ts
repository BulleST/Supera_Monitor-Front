import { CalendarioAula } from "./calendario.model";
import { Evento } from "./evento.model";

export class SalaAula {
    id: number = 0;
    numeroSala: number = 0;
    andar: number = 0;
    description: string = '';

    deactivated?: Date;
    active: boolean = true;

    // Não mapeados
    disponivel?: boolean;
    disponivelEvent?: Evento;
}


export enum SalaAulaId {
    financeiro = 3,
    professores = 2,
    online = 1,

}