import { ColumnTable, DisplayType, FilterType } from "../utils";
import { Aluno_Restricao } from "./aluno-restricao.model";
import { CalendarioAlunoChecklistView } from "./calendario.model";
import { Aluno_CheckList_Item } from "./checklist.model";
import { Evento_Mes } from "./evento-aula-aluno.model";
import { Evento } from "./evento.model";

export class AlunoRequest {
    id: number = 0;
    rm: string = '';    
    loginApp: string = '';    
    senhaApp: string = '';
    pessoa_Id: number = 0
    nome: string = '';
    dataNascimento: Date = new Date;
    celular: string = '';
    telefone: string = '';
    email: string = '';
    observacao: string = '';
    endereco: string = '';
    aluno_Foto: string = '';

    dataInicioVigencia: Date = new Date;
    dataFimVigencia?: Date;

    created: Date = new Date;
    lastUpdated?: Date;
    deactivated?: Date;
    active: boolean = false;

    perfilCognitivo_Id: number = 0;
    perfilCognitivo: string = '';

    turma_Id: number = 0;
    professor_Id: number = 0;
    pessoa_Sexo_Id?: number;
    apostila_Kit_Id?: number;

    restricoes: Aluno_Restricao[] = [];

}

export class Aluno {
    id: number = 0;
    rm: string = '';    
    loginApp: string = '';    
    senhaApp: string = '';
    pessoa_Id: number = 0
    nome: string = '';
    dataNascimento: Date = new Date;
    celular: string = '';
    telefone: string = '';
    email: string = '';
    observacao: string = '';
    endereco: string = '';
    aluno_Foto: string = '';

    dataInicioVigencia: Date = new Date;
    dataFimVigencia?: Date;

    created: Date = new Date;
    lastUpdated?: Date;
    deactivated?: Date;
    active: boolean = false;

    perfilCognitivo_Id: number = 0;
    perfilCognitivo: string = '';

    turma_Id: number = 0;
    turma: string = '';
    turmaDesc: string = '';
    diaSemana: number = 0;
    horario: Date = new Date;

    professor_Id: number = 0;
    professor: string = '';

    pessoa_Sexo_Id?: number;
    pessoa_Sexo?: string = '';

    aspNetUsers_Created_Id?: number;
    aspNetUsers_Created?: string = '';

    apostila_Abaco_Id?: number;
    apostila_AH_Id?: number;
    
    apostila_Abaco?: string;
    apostila_AH?: string;
    
    numeroPaginaAH?: number;
    numeroPaginaAbaco?: number;
    
    apostila_Abaco_Kit_Id?: number;
    apostila_AH_Kit_Id?: number;
    
    kit?: string;
    apostila_Kit_Id?: number;

    checklistCompleto: CalendarioAlunoChecklistView[] = [];
    alunoChecklist: Aluno_CheckList_Item[] = [];
    restricoes: Aluno_Restricao[] = [];

    checklist_Id?: number;
    checklist?: string;

    mesesAula: Evento_Mes[] = [];
    disponivel?: boolean;
    disponivelEvent?: Evento;
}

export interface Pessoa_DropDown {
    id: number;
    nome: string;
}

export interface Pessoa_Sexo extends Pessoa_DropDown { }
export interface Pessoa_FaixaEtaria extends Pessoa_DropDown { }
export interface Pessoa_Geracao extends Pessoa_DropDown { }

export interface Pessoa_Origem extends Pessoa_DropDown { }
export interface Pessoa_Origem_Canal extends Pessoa_DropDown { }
export interface Pessoa_Origem_Categoria extends Pessoa_DropDown { }
export interface Pessoa_Status extends Pessoa_DropDown { }

export var alunosColumns: ColumnTable[] = [
    {
        field: 'rm',
        label: 'Matrícula',
        filterType: FilterType.text,
        displayType: DisplayType.text,
        options: undefined,
    },
    {
        field: 'nome',
        label: 'Nome',
        filterType: FilterType.text,
        displayType: DisplayType.text,
        options: undefined,
    },
    {
        field: 'turmaDesc',
        label: 'Dias de Aula',
        filterType: FilterType.text,
        displayType: DisplayType.text,
        options: undefined,
    },
    {
        field: 'turma',
        label: 'Turma',
        filterType: FilterType.text,
        displayType: DisplayType.text,
        options: undefined,
    },
    {
        field: 'professor',
        label: 'Educador',
        filterType: FilterType.text,
        displayType: DisplayType.text,
        options: undefined,
    },
    {
        field: 'perfilCognitivo',
        label: 'Perfil Cognitivo',
        filterType: FilterType.text,
        displayType: DisplayType.text,
        options: undefined,
    },
    // {
    //     field: 'kit',
    //     label: 'Kit',
    //     filterType: FilterType.text,
    //     displayType: DisplayType.text,
    //     options: undefined,
    // },
    // {
    //     field: 'apostila_Abaco',
    //     label: 'Apostila Ábaco',
    //     filterType: FilterType.text,
    //     displayType: DisplayType.text,
    //     options: undefined,
    // },
    // {
    //     field: 'numeroPaginaAbaco',
    //     label: 'Página',
    //     filterType: FilterType.text,
    //     displayType: DisplayType.text,
    //     options: undefined,
    // },
    // {
    //     field: 'apostila_AH',
    //     label: 'Apostila AH',
    //     filterType: FilterType.text,
    //     displayType: DisplayType.text,
    //     options: undefined,
    // },
    // {
    //     field: 'numeroPaginaAH',
    //     label: 'Página',
    //     filterType: FilterType.text,
    //     displayType: DisplayType.text,
    //     options: undefined,
    // },
    {
        field: 'active',
        label: 'Status',
        filterType: FilterType.text,
        displayType: DisplayType.options,
        options: {
            "items": [
                { "value": true, "label": "Ativo", "severity": "success", "icon": "pi pi-check", "showDeactivatedDate": false },
                { "value": false, "label": "Inativo", "severity": "danger", "icon": "pi pi-times", "showDeactivatedDate": true }
            ]
        },
    },
];
