import { PerfilCognitivo } from "./perfil-cognitivo.model";
import { PseudoEvento } from "./reposicao.model";

export class AulaCreateRequest {
    turma_Id?: number = undefined as unknown as number;
    descricao: string = '';
    sala_Id: number = undefined as unknown as number;
    data: Date = new Date;
    professor_Id: number = undefined as unknown as number;
    roteiro_Id: number = undefined as unknown as number;
    observacao?: string;
    perfilCognitivo: PerfilCognitivo[] = []
}

export class AulaEditRequest {
    id: number = PseudoEvento.EventoId;
    descricao: string = '';
    data: Date = new Date;
    professor_Id: number = 0;
    sala_Id: number = 0;
    observacao?: string;
    perfilCognitivo: PerfilCognitivo[] = []
}


export class Aula_Aluno_Falta {
    id: number = 0;
    aula_Aluno_Id: number = 0;
    motivoFalta: string = '';
    observacoes: string = '';
    alunoContatado: boolean = false;
}