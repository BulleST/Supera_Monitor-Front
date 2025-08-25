import { getRandomColor } from "../utils/ramdom-color";
import { Basic_List } from "./_basic.model";

export class Roteiro extends Basic_List {
    dataInicio: Date = undefined as unknown as Date;
    dataFim: Date = undefined as unknown as Date;
    semana: number = 0;
    tema: string = '';
    corLegenda: string = getRandomColor();
    recesso: boolean = false;
}

export class RoteiroRequest {
    id: number = 0;
    dataInicio: Date = undefined as unknown as Date;
    dataFim: Date = undefined as unknown as Date;
    semana: number = 0;
    tema: string = getRandomColor();
    corLegenda: string = '';
    recesso: boolean = false;
}
