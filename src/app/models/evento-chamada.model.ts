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
    apostila_Abaco_Id?: number = 0;
    numeroPaginaAbaco?: number = 0;
    apostila_AH_Id?: number = 0;
    numeroPaginaAH?: number = 0;
}

export class EventoChamadaProfessorRequest {
    participacao_Id: number = PseudoEvento.EventoId;
    presente?: boolean;
    observacao?: string;
}
