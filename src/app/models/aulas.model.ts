import { PerfilCognitivo } from "./perfil-cognitivo.model";
import { PseudoAula } from "./reposicao.model";

export class AulaCreateRequest {
    turma_Id?: number = 0;
    sala_Id: number = 0;
    data: Date = new Date;
    professor_Id: number = 0;
    observacao: string = '';
    perfilCognitivo: PerfilCognitivo[] = []
}

export class AulaEditRequest {
    id: number = PseudoAula.AulaId;
    data: Date = new Date;
    professor_Id: number = 0;
    sala_Id: number = 0;
    observacao: string = '';
    perfilCognitivo: PerfilCognitivo[] = []
}


export class Aula_Aluno_Falta {
    id: number = 0;
    aula_Aluno_Id: number = 0;
    motivoFalta: string = '';
    observacoes: string = '';
    alunoContatado: boolean = false;
}