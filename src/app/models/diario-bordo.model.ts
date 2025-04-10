import { Aluno } from "./alunos.model";

export class Aluno_Aula {
    aluno: Aluno = new Aluno;
    meses: Aluno_Aula_Mes[] = [];
}

export class Aluno_Aula_Mes {
    mes: number = 0;
    roteiros: Aluno_Aula_Mes_Roteiro[] = [];
}
export class Aluno_Aula_Mes_Roteiro {
    id: number = 0;
    dataInicio: Date = new Date;
    dataFim: Date = new Date;
    semana: number = 0;
    tema: string = '';
    corLegenda: string = '';
    account_Created: string = '';
    account_Created_Id: number = 0;
    created: Date = new Date;
    deactivated?: Date;
    lastUpdated?: Date;
    aulas: any[] = [];
}


export class Aluno_Aula_Mes_Roteiro_Aula {

}