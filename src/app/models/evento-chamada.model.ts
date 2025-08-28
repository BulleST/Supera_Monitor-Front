import { PseudoEvento } from "./reposicao.model";

export class EventoChamadaRequest {
    evento_Id: number = PseudoEvento.EventoId;
    observacao: string = '';
    professores: EventoChamadaProfessorRequest[] = [];
    alunos: EventoChamadaAlunoRequest[] = [];
}

export class EventoChamadaAlunoRequest {
    participacao_Id: number = PseudoEvento.EventoId;
    presente?: boolean;
    observacao?: string;
    apostila_Abaco_Id?: number;
    numeroPaginaAbaco?: number;
    apostila_AH_Id?: number;
    numeroPaginaAH?: number;
    reposicaoDe_Evento_Id?: number;
}

export class EventoChamadaProfessorRequest {
    participacao_Id: number = PseudoEvento.EventoId;
    presente?: boolean;
    observacao?: string;
}
