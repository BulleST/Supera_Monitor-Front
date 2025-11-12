import { Basic_List } from "./_basic.model";
import { Aula_Aluno_Falta } from "./aulas.model";
import { ListaEspera } from "./lista-espera.model";
import { PerfilCognitivo } from "./perfil-cognitivo.model";
import { PseudoEvento } from "./reposicao.model";


export enum CalendarioView {
    MeuCalendario = 1,
    CalendarioGeral = 2
}
export enum CalendarioDayView {
    Dia = 1,
    Semana = 2
}

export class CalendarioRequest {
    intervaloDe?: Date;
    intervaloAte?: Date;
    turma_Id?: number;
    professor_Id?: number;
    aluno_Id?: number;
    perfil_Cognitivo_Id?: number;
}

export class CalendarioAula {
    aula_Id: number = PseudoEvento.EventoId;
    data: Date = new Date;
    descricao: string = '';
    capacidadeMaximaAlunos: number = 12;
    observacao?: string = '';
    finalizada: boolean = false;
    
    sala_Id: number = 0;
    numeroSala: string = '';
    andar: string = '';

    reposicaoDe_Aula_Id?: number;
    reposicaoDe_Aula?: CalendarioAula;

    professor_Id: number = 0;
    professor: string = '';
    corLegenda: string = '';

    turma?: string; // Remover futuramente
    turma_Id?: number;

    alunos: CalendarioAluno[] = [];
    perfilCognitivo: PerfilCognitivo[] = [];
    listaEspera: ListaEspera[] = [];

    active?: boolean = !this.deactivated;
    created?: Date = undefined as unknown as Date;
    lastUpdated?: Date;
    deactivated?: Date;
    account_Created_Id?: number;
    account_Created?: string;

}

export class CalendarioAluno extends Basic_List {
    aula_Id: number = PseudoEvento.EventoId;
    reposicaoDe_Aula_Id?: number;
    reposicaoDe_Aula?: CalendarioAula;
    presente?: boolean;
    observacao?: string;

    aluno_Id: number = 0;
    aluno: string = '';
    aluno_Foto?: string;
    celular?: string;

    perfilCognitivo_Id: number = 0;
    perfilCognitivo: string = '';

    turma_Id: number = 0; // Turma do aluno
    turma: string = ''; // Turma do aluno

    apostila_Abaco_Id?: number;
    apostila_AH_Id?: number;

    apostila_Abaco?: string;
    apostila_AH?: string;

    numeroPaginaAH?: number;
    numeroPaginaAbaco?: number;

    kit?: string;
    apostila_Kit_Id?: number;

    // Não mapeado
    flagAlunoNovo?: boolean = false;
    loadingFoto?: boolean = false;

    faltaMotivo?: Aula_Aluno_Falta;
    
    checklist?: string;
    checklist_Id?: number;
}
