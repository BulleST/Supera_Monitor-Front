import { CalendarioList } from "./calendario.model";

export class SalaAula {
    id: number = 0;
    numeroSala: number = 0;
    andar: number = 0;


    // Não mapeados
    disponivel?: boolean;
    disponivelEvent?: CalendarioList;
}