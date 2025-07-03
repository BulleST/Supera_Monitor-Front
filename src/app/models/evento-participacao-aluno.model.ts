import { Aluno_Restricao } from "./aluno-restricao.model";
import { Apostila } from "./apostila.model";
import { AlunoChecklistCompleto } from "./calendario.model";
import { Aluno_CheckList_Item } from "./checklist.model";
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


    apostila_Kit?: string;
    apostila_Kit_Id?: number;

    perfilCognitivo_Id: number = 0;
    perfilCognitivo: string = '';

    turma_Id: number = 0; // Turma do aluno
    turma: string = ''; // Turma do aluno

    checklist?: string;
    checklist_Id?: number;

    // Não mapeado
    loadingFoto?: boolean = false;
    
    // from GET checklist/all/aula/aula_id
    checklistCompleto: AlunoChecklistCompleto[] = [];
    alunoChecklist: Aluno_CheckList_Item[] = [];
    
    created: Date = new Date;
    deactivated?: Date;
    active: boolean = true;
    primeiraAula?: Date;

    restricaoMobilidade: boolean = false;
    restricoes: Aluno_Restricao[] = []
}

export var alunoParticipacao: Evento_Participacao_Aluno[] = [];
for (let index = 0; index < 11; index++) {
    // alunoParticipacao.push({
    //     id: -1,
    //     aluno_Id: index,
    //     aluno: 'João',
    //     aluno_Foto: '',
    //     celular: '5511953463376',
    //     evento_Id: PseudoAula.AulaId,
    //     reposicaoDe_Evento_Id: undefined,
    //     reposicaoDe_Evento: undefined,
    //     presente: undefined,
    //     observacao: undefined,

    //     apostila_Abaco: 'Abaco 1',
    //     apostila_Abaco_Id: 0,
    //     numeroPaginaAbaco: 1,

    //     apostila_AH: 'AH 1',
    //     apostila_AH_Id: 0,
    //     numeroPaginaAH: 1,

    //     apostila_Kit: 'Kit 1',
    //     apostila_Kit_Id: 0,

    //     // perfilCognitivo_Id: number = 0,
    //     perfilCognitivo: 'Junior',

    //     // turma_Id: number = 0, // Turma do aluno
    //     turma: 'Turma A', // Turma do aluno

    //     checklist: 'Aula 0',
    //     checklist_Id: 0,

    //     // Não mapeado
    //     loadingFoto: undefined,

    //     // from GET checklist/all/aula/aula_id
    //     checklists: [],

    // })
}