import { Evento_Participacao_Aluno } from "./evento-participacao-aluno.model";
import { Evento_Participacao_Professor } from "./evento-participacao-professor.model";
import { Feriado } from "./feriado.model";
import { PerfilCognitivo } from "./perfil-cognitivo.model";
import { PseudoEvento } from "./reposicao.model";

export class Evento {
    id: number = PseudoEvento.EventoId;
    data: Date = new Date;
    evento_Tipo_Id: number = EventoTipo.Aula;
    evento_Tipo: string = '';
    descricao: string = '';
    observacao: string = '';
    finalizado: boolean = false;
    duracaoMinutos: number = 60; 

    
    sala: string = '';
    sala_Id: number = undefined as unknown as number;
    numeroSala: number = undefined as unknown as number;
    andar: number = undefined as unknown as number;

    alunos: Evento_Participacao_Aluno[] = [];
    professores: Evento_Participacao_Professor[] = [];

    // Aula
    professor_Id?: number = PseudoEvento.EventoId;
    professor?: string = '';
    corLegenda?: string;
    turma_Id?: number;
    turma?: string;
    perfilCognitivo: PerfilCognitivo[] = [];

    capacidadeMaximaEvento: number = 12;
    alunosAtivosEvento: number = 0;
    vagasDisponiveisEvento: number = 0;
    
    capacidadeMaximaTurma: number = 12;
    alunosAtivosTurma: number = 0;
    vagasDisponiveisTurma: number = 0;

    roteiro_Id?: number;
    semana?: number;
    tema?: string;
    roteiroCorLegenda?: string;
    
    created: Date = new Date;
    deactivated?: Date;
    active: boolean = true;
    feriado?: Feriado;
}

export enum EventoTipo {
    Aula = 1,
    Oficina = 2,
    Superacao = 3,
    Reuniao = 4,
    AulaZero = 5,
    TurmaExtra = 7,
    Feriado = 8,
}


export class EventoReagendamentoRequest {
    evento_Id: number = PseudoEvento.EventoId;
    sala_Id: number = 0;
    data: Date = new Date;
    observacao: string = ''
}

export class EventoCancelamentoRequest {
    id: number = PseudoEvento.EventoId;
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
