import { Evento_Participacao_Aluno } from "./evento-participacao-aluno.model";
import { Evento_Participacao_Professor } from "./evento-participacao-professor.model";
import { PerfilCognitivo } from "./perfil-cognitivo.model";
import { PseudoEvento } from "./reposicao.model";

export class Evento {
    id: number = PseudoEvento.EventoId;
    data: Date = new Date;

    evento_Tipo_Id: number = EventoTipo.Aula;
    sala_Id: number = undefined as unknown as number;
    numeroSala: number = undefined as unknown as number;
    andar: number = undefined as unknown as number;
    duracaoMinutos: number = 60; 

    descricao: string = '';
    observacao: string = '';
    finalizado: boolean = false;

    reagendamentoDe_Evento_Id?: number;
    reagendamentoDe_Evento?: Evento;

    alunos: Evento_Participacao_Aluno[] = [];
    professores: Evento_Participacao_Professor[] = [];

    // Aula
    professor_Id?: number = PseudoEvento.EventoId;
    professor?: string = '';
    corLegenda?: string;
    turma_Id?: number;
    turma?: string;
    perfilCognitivo: PerfilCognitivo[] = [];
    capacidadeMaximaAlunos: number = 0;
    roteiro_Id: number = PseudoEvento.EventoId;

    created: Date = new Date;
    deactivated?: Date;
    active: boolean = true;
}

export enum EventoTipo {
    Aula = 1,
    AulaZero = 5,
    AulaExtra = 7,
    Superacao = 3,
    Oficina = 2,
    Reuniao = 4,
}


export class EventoReagendamentoRequest {
    evento_Id: number = PseudoEvento.EventoId;
    sala_Id: number = 0;
    data: Date = new Date;
    observacao: string = ''
}

export class EventoQueryParams {
    evento_Id: number = PseudoEvento.EventoId;
    roteiro_Id: number = 0;
    data: Date = new Date;
    observacao: string = '';
    descricao: string = '';
    evento_Tipo_Id: number = EventoTipo.Aula;
    
    sala_Id: number = 0;
    numeroSala: number = undefined as unknown as number;
    andar: number = undefined as unknown as number;

    professor_Id?: number;
    professor?: string;
    corLegenda?: string;

    turma?: string;
    turma_Id?: number;
}
