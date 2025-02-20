export class Reposicao {
    aluno_Id: number = 0;
    aluno: string = '';

    source_Aula_Id?: number;
    source_Data: Date = new Date;
    source_Turma_Id: number = 0;
    source_Turma: string = '';
    source_Turma_Tipo_Id: number = 0;
    source_Turma_Tipo: string = '';
    source_Professor_Id: number = 0;
    source_Professor: string = '';
    
    // dest_Aula_Id?: number;
    // dest_Data?: Date;
    // dest_Turma_Id?: number;
    // dest_Professor_Id?: number;
}

export class ReposicaoRequest {
    aluno_Id: number = 0;
    source_Aula_Id: number = 0;
    dest_Aula_Id: number = 0;
}