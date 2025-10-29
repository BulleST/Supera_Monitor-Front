import { StatusContato } from "./evento-status-contato.enum";
import { EventoTipo } from "./evento.model";
import { Feriado } from "./feriado.model";

export interface Dashboard {
    alunos: Dashboard_Aluno[];
    roteiros: Dashboard_Roteiro[];
}

export interface Dashboard_Roteiro {
    id: number;
    tema: string;
    semana: number;
    dataInicio: Date;
    dataFim: Date;
    corLegenda: string;
    recesso: boolean;
}

export interface Dashboard_Aluno {
    id: number;
    nome: string;
    celular: string;
    checklist_Id?: number;
    primeiraAula_Id?: number;
    aulaZero_Id?: number;
    dataNascimento?: Date;
    perfilCognitivo_Id: number;
    corLegenda: string;
    turma: string;
    turma_Id: number;
    aulas: Dashboard_Aluno_Aulas[];
}

export interface Dashboard_Aluno_Aulas {
    show: boolean;
    aula: Dashboard_Aula_Participacao;
    reposicaoPara: Dashboard_Aula_Participacao;
}

export interface Dashboard_Aula_Participacao {
    aula: Dashboard_Aula;
    participacao: Dashboard_Participacao;
}

export interface Dashboard_Aula {
    id: number;
    evento_Tipo_Id: EventoTipo.Aula; // EventoTipo.Aula ou EventoTipo.TurmaExtra 
    data: Date;
    descricao: string;
    observacao: string;
    duracaoMinutos: number;  // 120 minutos - 2 horas
    finalizado: boolean;
    active: boolean;

    sala: string;
    andar: number;
    numeroSala: number;

    tema: string;
    semana: number;
    roteiroCorLegenda: string;
    
    turma: string;
    professor: string;
    corLegenda: string;

    feriado?: Feriado;
}

export interface Dashboard_Participacao {
    id: number;
    presente?: boolean;
    observacao?: string;
    deactivated?: Date;
    active: boolean;
    
    apostila_Abaco?: string;
    apostila_AH?: string;
    numeroPaginaAbaco?: number;
    numeroPaginaAH?: number;

    alunoContactado?: Date; 
    statusContato_Id?: StatusContato;
    contatoObservacao?: string;
}