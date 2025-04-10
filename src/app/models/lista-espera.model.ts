export class ListaEsperaRequest {
    aluno_Id: number = 0;
    aula_Id: number = 0;
}

export class ListaEspera {
    id: number = 0;
    aula_Id: number = 0;
    aluno_Id: number = 0;
    turma_Id: number = 0;
    pessoa_Id: number = 0;
    aluno_Foto: number = 0;
    nome: string = '';
    email: string = '';
    celular: string = '';
    telefone: string = '';
    dataNascimento?: Date;
    observacao: string = '';
    perfilCognitivo_Id?: number;
    perfilCognitivo?: string ;
    
}