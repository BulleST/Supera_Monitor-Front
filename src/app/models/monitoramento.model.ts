import { StatusContato } from "./evento-status-contato.enum";
import { EventoTipo } from "./evento.model";
import { Feriado } from "./feriado.model";

export interface Monitoramento_Response {
    alunos: Monitoramento_Aluno[];
    mesesRoteiro: Monitoramento_Mes[];
}

export interface Monitoramento_Roteiro {
    id: number;
    tema: string;
    semana: number;
    dataInicio: Date;
    dataFim: Date;
    corLegenda: string;
    recesso: boolean;
}

export class Monitoramento_Mes {
    mes: number = 0;
    mesString: string = '';
    roteiros: Monitoramento_Roteiro[] = [];
;}

export interface Monitoramento_Aluno {
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
    apostila_Kit_Id?: number;
    restricaoMobilidade: boolean;
    items: Monitoramento_Aluno_Item[];
}

export interface Monitoramento_Aluno_Item {
    id: number;
    show: boolean;
    aula: Monitoramento_Aula_Participacao_Rel;
    reposicaoPara?: Monitoramento_Aula_Participacao_Rel;
    status: Monitoramento_Item_Status;
}

export interface Monitoramento_Aula_Participacao_Rel {
    aula: Monitoramento_Aula;
    participacao: Monitoramento_Participacao;
}

export interface Monitoramento_Aula {
    id: number;
    evento_Tipo_Id: EventoTipo.Aula; // EventoTipo.Aula ou EventoTipo.TurmaExtra 
    data: Date;
    descricao: string;
    observacao: string;
    finalizado: boolean;
    active: boolean;

    sala: string;
    andar: number;
    numeroSala: number;

    tema: string;
    semana: number;
    recesso: boolean;
    roteiroCorLegenda: string;
    
    turma: string;
    professor: string;
    corLegenda: string;

    feriado?: Feriado;
}

export interface Monitoramento_Participacao {
    id: number;
    presente?: boolean;
    observacao?: string;
    deactivated?: Date;
    active: boolean;
    
    apostila_Abaco?: string;
    apostila_AH?: string;

    apostila_Abaco_Id?: number;
    apostila_AH_Id?: number;

    numeroPaginaAbaco: number;
    numeroPaginaAH: number;

    alunoContactado?: Date; 
    statusContato_Id?: StatusContato;
    contatoObservacao?: string;

    reposicaoDe_Evento_Id?: number;
    reposicaoPara_Evento_Id?: number;
}


export class Monitoramento_Request {
    ano: number = new Date().getFullYear();
    turma_Id?: number;
    professor_Id?: number;
    aluno_Id?: number;
}



export enum Monitoramento_Item_Status {
    Recesso = 'Recesso',
    Cancelada = 'Cancelada',
    Feriado = 'Feriado',
    ReposicaoAgendada = 'Reposição Agendada',
    ReposicaoDesmarcada = 'Reposição Desmarcada',
    FaltaReposicao = 'Faltou na Reposição',
    FaltaAgendada = 'Falta Agendada',
    FaltaAula = 'Falta - Aluno Não Contatado',
    FaltaAlunoContatado = 'Falta - Aluno Contatado',
    PresenteReposicao = 'Presente na Reposição',
    PresenteNaAula = 'Presente',
    Aula = 'Aula',       
    PrimeiraAula = 'Primeira Aula',       
}