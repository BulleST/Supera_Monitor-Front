import { Evento } from "./evento.model";
import { Feriado } from "./feriado.model";


export enum CalendarioView {
    MeuCalendario = 1,
    CalendarioGeral = 2
}

export enum CalendarioDayView {
    Dia = 1,
    Semana = 2
}

export class CalendarioRequest {
    intervaloDe?: Date;
    intervaloAte?: Date;
    turma_Id?: number;
    professor_Id?: number;
    aluno_Id?: number;
    perfil_Cognitivo_Id?: number;
}
export class CalendarioResponse {
    eventos: Evento[] = [];
    feriados: Feriado[] = [];
}

