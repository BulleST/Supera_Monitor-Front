export class ChamadaRequest {
    aula_Id: number = 0;
    professor_Id: number = 0;
    registros: ChamadaRequestAlunos[] = []
}

export class ChamadaRequestAlunos {
    aula_Aluno_Id: number = 0;
    presente: boolean = true;
    apostila_Abaco_Id: number = '' as unknown as number;
    numero_Pagina_Abaco: number = '' as unknown as number;
    apostila_Ah_Id: number = 0;
    numero_Pagina_Ah: number = 0;
    observacao: string = '';
}