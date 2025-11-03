import { StatusContato } from "./evento-status-contato.enum";
import { EventoTipo } from "./evento.model";
import { Feriado } from "./feriado.model";

export interface Dashboard_V2 {
    alunos: Dashboard_Aluno[];
    mesesRoteiro: Dashboard_Mes[];
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

export class Dashboard_Mes {
    mes: number = 0;
    mesString: string = '';
    roteiros: Dashboard_Roteiro[] = [];
;}

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
    items: Dashboard_Aluno_Aula_Reposicao[];
}

export interface Dashboard_Aluno_Aula_Reposicao {
    show: boolean;
    aula: Dashboard_Aula_Participacao;
    reposicaoPara?: Dashboard_Aula_Participacao;
    status: Dashboard_Item_Status;
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


export class Dashboard_Request {
    ano: number = new Date().getFullYear();
    turma_Id?: number;
    professor_Id?: number;
    aluno_Id?: number;
}



export enum Dashboard_Item_Status {
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
}