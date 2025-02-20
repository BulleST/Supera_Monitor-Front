export class ChamadaRequest {
    aula_Id: number = 0;
    professor_Id: number = 0;
    registros: ChamadaRequestAlunos[] = []
}

export class ChamadaRequestAlunos {
    turma_Aula_Aluno_Id: number = 0;
    presente: boolean = false;
    apostila_Abaco_Id: number = 0;
    numero_Pagina_Abaco: number = 0;
    apostila_Ah_Id: number = 0;
    numero_Pagina_Ah: number = 0
}