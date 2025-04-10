export class Evento_Aulas { 
    id: number = 0; 
    aluno_Id: number = 0; 
    evento_Id: number = 0; 
    evento_Tipo_Id: number = 0; 
    data: Date = new Date; 
    descricao: string = ''; 
    numeroSala: string = ''; 
    andar: number = 0 
    sala_Id: number = 0; 
    duracaoMinutos: number = 0; 
    capacidadeMaximaAlunos: number = 0; 
    finalizado?: boolean;
    roteiro_Id: number = 0; 
    turma?: string = ''; 
    turma_Id?: number = 0; 
    professor: string = ''; 
    professor_Id: number = 0; 
    reposicaoDe_Evento_Id?: number = 0; 
    reagendamentoDe_Evento_Id?: number = 0; 
    presente?: boolean;
    numeroPaginaAbaco?: number = 0
    numeroPaginaAH?: number = 0
    apostila_Abaco?: string = ''; 
    apostila_AH?: string = ''; 
    apostila_Abaco_Id?: number = 0; 
    apostila_AH_Id?: number = 0; 
    observacao: string = ''; 
}

export class Evento_Roteiro {
    id: number = 0;
    semana: number = 0;
    tema: string = '';
    dataInicio: Date = new Date;
    dataFim: Date = new Date;
    corLegenda: string = '';
    account_Created_Id: number = 0;
    account_Created: string = '';
    created: Date = new Date;
    lastUpdated?: Date;
    deactivated?: Date;
    aulas: Evento_Aulas[] = []
}

export class Evento_Mes {
    mes: number = 0;
    mesString: string = '';
    roteiros: Evento_Roteiro[] = [];
}