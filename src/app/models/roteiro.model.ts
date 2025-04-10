import { Basic_List } from "./_basic.model";

export class Roteiro extends Basic_List {
    dataInicio: Date = undefined as unknown as Date;
    dataFim: Date = undefined as unknown as Date;
    semana: number = 0;
    tema: string = '';
    corLegenda?: string = getRandomColor();
}

export class Roteiro_Material extends Basic_List {
    jornada_Id: number = 0
    nomeArquivo: string = '';
    base64: string = '';
}

export class RoteiroRequest {
    id: number = 0;
    dataInicio: Date = undefined as unknown as Date;
    dataFim: Date = undefined as unknown as Date;
    semana: number = 0;
    tema: string = getRandomColor();
    corLegenda: string = '';
    material: Roteiro_Material[] = [];
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }