import { Roteiro } from "./roteiro.model";

export class DashboardRequest {
    ano: number = new Date().getFullYear();
    mes: number = 0;
    turma_Id?: number;
    professor_Id?: number;
    aluno_Id?: number;
}

export class Dashboard_Response {
    alunos: Dashboard_Aluno[] = [];
    roteiros: Dashboard_Roteiro[] = [];
}

export class Dashboard_Item {
    show: boolean = true;
    aula: Dashboard_Aula = new Dashboard_Aula;
    participacao: Dashboard_Participacao = new Dashboard_Participacao;
}

export class Dashboard_Aula {
    id: number = 0;
    evento_Tipo_Id: number = 0;
    Evento_Tipo: string = '';
    data: Date = new Date;
    descricao: string = '';
    observacao: string = '';
    duracaoMinutos: number = 0;
    finalizado: boolean = false;
    active: boolean = false;

    account_Created_Id?: number;
    account_Created: string = '';
    created: Date = new Date;
    lastUpdated?: Date;
    deactivated?: Date;
    reagendamentoDe_Evento_Id?: number;
    reagendamentoDe_Evento?: Dashboard_Aula;
    reagendamentoPara_Evento_Id?: number;
    reagendamentoPara_Evento?: Dashboard_Aula;

    sala_Id?: number;
    andar?: number;
    numeroSala?: number;

    roteiro_Id?: number;
    tema: string = '';
    semana?: number;

    turma_Id?: number;
    turma: string = '';
    capacidadeMaximaAlunos: number = 0;

    professor_Id?: number;
    professor: string = '';
    corLegenda: string = '';
}

export class Dashboard_Participacao {
    id: number = 0;
    aluno_Id: number = 0;
    evento_Id: number = 0;
    reposicaoDe_Evento_Id?: number;
    reposicaoDe_Evento?: Dashboard_Aula;
    reposicaoPara_Evento_Id?: number;
    reposicaoPara_Evento?: Dashboard_Aula;
    presente?: boolean;
    apostila_Abaco?: string;
    apostila_AH?: string;
    apostila_Abaco_Id?: number;
    apostila_AH_Id?: number;
    numeroPaginaAbaco?: number;
    numeroPaginaAH?: number;
    observacao?: string;
    deactivated?: Date;
    active: boolean = true;
    alunoContactado: boolean = false; 
    observacoesContato?: string; 
}

export class Dashboard_Roteiro {
    id: number = 0;
    tema: string = '';
    semana: number = 0;
    dataInicio: Date = new Date;
    dataFim: Date = new Date;
    corLegenda: string = '';
}

export class Dashboard_Aluno {
    id: number = 0;
    nome: string = '';
    celular: string = '';
    checklist_Id?: number;
    primeiraAula_Id?: number;
    aulaZero_Id?: number;
    dataNascimento?: Date;
    perfilCognitivo_Id: number = 0;
    aulas: Dashboard_Item[] = [];
}

export class Dashboard_Mes {
    mes: number = 0;
    mesString: string = '';
    roteiros: Roteiro[] = [];
}