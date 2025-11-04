export class Aluno_Vigencia {
    id: number = 0;
    aluno_Id: number = 0;
    aluno: string = '';
    turma_Id: number = 0;
    turma: string = '';
    corLegenda: string = '';
    professor: string = '';
    professor_Id: number = 0;
    dataInicioVigencia: Date = new Date;
    dataFimVigencia?: Date;
    account: string = '';
    account_Id: number = 0;
}