import { Aluno_Restricao } from "./aluno-restricao.model";
import { Apostila } from "./apostila.model";
import { Evento } from "./evento.model";
import { PseudoEvento } from "./reposicao.model";

export class Evento_Participacao_Aluno {
    id: number = PseudoEvento.EventoId;

    aluno_Id: number = 0;
    aluno: string = '';
    aluno_Foto?: string;
    celular?: string;

    evento_Id: number = PseudoEvento.EventoId;

    reposicaoDe_Evento_Id?: number = undefined as any;
    reposicaoDe_Evento?: Evento;
    loadingReposicaoDe_Evento?: boolean;

    reposicaoPara_Evento_Id?: number = undefined as any;
    reposicaoPara_Evento?: Evento;
    loadingReposicaoPara_Evento?: boolean;

    presente?: boolean;
    observacao?: string;

    apostila_Abaco?: string;
    apostila_Abaco_Id?: number = undefined as any;
    numeroPaginaAbaco: number = 0;
    apostilaAbacoObject?: Apostila
    apostilasAbacoList: Apostila[] = [];

    apostila_AH?: string;
    apostila_AH_Id?: number = undefined as any;
    numeroPaginaAH: number = 0;
    apostilaAHObject?: Apostila;
    apostilasAHList: Apostila[] = [];


    kit?: string;
    apostila_Kit_Id?: number;

    perfilCognitivo_Id?: number = 0;
    perfilCognitivo?: string = '';

    turma_Id?: number = 0; // Turma do aluno
    turma?: string = ''; // Turma do aluno

    checklist?: string;
    checklist_Id?: number;

    // // Não mapeado
    // loadingFoto?: boolean = false;

    created: Date = new Date;
    deactivated?: Date;
    active: boolean = true;

    restricaoMobilidade: boolean = false;
    restricoes: Aluno_Restricao[] = [];

    primeiraAula_Id?: number;
    aulaZero_Id?: number;

    alunoContactado?: Date;
    statusContato_Id?: number;
    contatoObservacao?: string;
}


export class UpdateParticipacaoAlunoRequest {
    participacao_Id: number = 0;
    presente?: boolean;
    observacao?: string;
    apostila_AH_Id?: number;
    apostila_Abaco_Id?: number;
    numeroPaginaAH?: number;
    numeroPaginaAbaco?: number;
    reposicaoDe_Evento_Id?: number;
    deactivated?: Date;
    contatoObservacao?: string;
    alunoContactado?: Date;
    statusContato_Id?: number;
}


export var statusContato = [
    { value: 1, label: 'Não compareceu' },
    { value: 2, label: 'Aguardando Retorno' },
    { value: 3, label: 'Optou por não repor' },
    { value: 4, label: 'Aula Cancelada' },
    { value: 5, label: 'Reposição Agendada' },
    { value: 6, label: 'Reposição Realizada' },
    { value: 7, label: 'Não Compareceu na reposição' },
    { value: 8, label: 'Reposição Desmarcada' },
    { value: 9, label: 'Outro' },
]