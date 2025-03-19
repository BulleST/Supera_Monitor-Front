import moment from "moment";
import { Basic_List } from "./_basic.model";

export class Jornada extends Basic_List {
    dataInicio: Date = undefined as unknown as Date;
    dataFim: Date = undefined as unknown as Date;
    semana: number = 0;
    tema: string = '';
    corLegenda?: string = getRandomColor();
}

export class Jornada_Material extends Basic_List {
    jornada_Id: number = 0
    nomeArquivo: string = '';
    base64: string = '';
}

export class JornadaRequest {
    id: number = 0;
    dataInicio: Date = undefined as unknown as Date;
    dataFim: Date = undefined as unknown as Date;
    semana: number = 0;
    tema: string = getRandomColor();
    corLegenda: string = '';
    material: Jornada_Material[] = [];
}

// export var jornadas: Jornada[] = [
//     {
//         id: -3,
//         dataInicio: moment().add(-3, 'week').weekday(1).toDate(),
//         dataFim: moment().add(-3, 'week').weekday(5).toDate(),
//         tema: 'Tema A',
//         semana: 1,
//         corLegenda: getRandomColor(),
//     },
//     {
//         id: -2,
//         dataInicio: moment().add(-2, 'week').weekday(1).toDate(),
//         dataFim: moment().add(-2, 'week').weekday(5).toDate(),
//         tema: 'Tema B',
//         semana: 2,
//         corLegenda: getRandomColor(),
//     },
//     {
//         id: -1,
//         dataInicio: moment().add(-1, 'week').weekday(1).toDate(),
//         dataFim: moment().add(-1, 'week').weekday(5).toDate(),
//         tema: 'Tema C',
//         semana: 3,
//         corLegenda: getRandomColor(),
//     },
//     {
//         id: 0,
//         dataInicio: moment().add(0, 'week').weekday(1).toDate(),
//         dataFim: moment().add(0, 'week').weekday(5).toDate(),
//         tema: 'Tema D',
//         semana: 4,
//         corLegenda: getRandomColor(),
//     },
//     {
//         id: 1,
//         dataInicio: moment().add(1, 'week').weekday(1).toDate(),
//         dataFim: moment().add(1, 'week').weekday(5).toDate(),
//         tema: 'Tema E',
//         semana: 5,
//         corLegenda: getRandomColor(),
//     },
//     {
//         id: 2,
//         dataInicio: moment().add(2, 'week').weekday(1).toDate(),
//         dataFim: moment().add(2, 'week').weekday(5).toDate(),
//         tema: 'Tema F',
//         semana: 6,
//         corLegenda: getRandomColor(),
//     },
//     {
//         id: 3,
//         dataInicio: moment().add(3, 'week').weekday(1).toDate(),
//         dataFim: moment().add(3, 'week').weekday(5).toDate(),
//         tema: 'Tema G',
//         semana: 7,
//         corLegenda: getRandomColor(),
//     },
//     {
//         id: 4,
//         dataInicio: moment().add(4, 'week').weekday(1).toDate(),
//         dataFim: moment().add(4, 'week').weekday(5).toDate(),
//         tema: 'Tema H',
//         semana: 8,
//         corLegenda: getRandomColor(),
//     },
//     {
//         id: 5,
//         dataInicio: moment().add(5, 'week').weekday(1).toDate(),
//         dataFim: moment().add(5, 'week').weekday(5).toDate(),
//         tema: 'Tema I',
//         semana: 9,
//         corLegenda: getRandomColor(),
//     },
// ];

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }