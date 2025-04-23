
export class ReposicaoAluno {
    aluno_Id: number = 0;
    aluno: string = '';
    aluno_PerfilCognitivo: string = '';
    aluno_PerfilCognitivo_Id: number = 0;

    source_Aula_Id: number = PseudoEvento.EventoId; // -1 aula não existe
    source_Data: Date = new Date;
    source_Sala_Id: number = 0;
    source_Turma_Id: number = 0;
    source_Turma: string = '';
    source_Professor_Id: number = 0;
    source_Professor: string = '';
}

export class ReposicaoAlunoRequest {
    aluno_Id: number = 0;
    source_Aula_Id: number = 0;
    dest_Aula_Id: number = 0;
    observacoes: string = '';
}

export class ReagendarAulaView {
    id: number = PseudoEvento.EventoId;
    professor_Id: number = 0;
    sala_Id: number = 0;
    turma_Id: number = 0;
    turma: string = '';
    data: Date = new Date;
    observacao: string = '';
}

export class ReagendarAulaRequest {
    id: number = PseudoEvento.EventoId;
    professor_Id: number = 0;
    data: Date = new Date;
    observacao: string = '';
}

export enum PseudoEvento {
    EventoId = -1,
}