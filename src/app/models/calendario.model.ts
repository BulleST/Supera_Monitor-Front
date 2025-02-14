export class CalendarioRequest {
    intervaloDe?: Date;
    intervaloAte?: Date;
    turma_Id?: number;
    professor_Id?: number;
    aluno_Id?: number;
    turma_Tipo_Id?: number;
}

export class CalendarioList {
    aula_Id?: number;
    data: Date = new Date;
    turma_Id: number = 0;
    turma: string = '';
    capacidadeMaximaAlunos: number = 0;
    professor_Id: number = 0;
    professor: string = '';
    corLegenda: string = '';
    observacao: string = '';
    turma_Tipo: string = '';
    turma_Tipo_Id: number = 0;
    alunos: CalendarioAlunoList[] = [];
}

export class CalendarioAlunoList {
    id?: number;
    aula_Id?: number;
    reposicao: boolean = false;
    presente: boolean = false;

    aluno_Id: number = 0;
    aluno: string = '';
    aluno_Foto: string = '';
    
    turma_Id: number = 0;
    turma: string = '';
    
    apostila_Abaco_Id?: number;
    apostila_AH_Id?: number;
    
    apostila_Abaco?: string;
    apostila_AH?: string;
    
    numeroPaginaAH?: number;
    numeroPaginaAbaco?: number;
    
    apostila_Abaco_Kit_Id?: number;
    apostila_AH_Kit_Id?: number;
    
    kit?: string;
    apostila_Kit_Id?: number;
    
    flagAlunoNovo: boolean = false;
    loadingFoto: boolean = false;
}