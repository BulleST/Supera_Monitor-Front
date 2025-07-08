import { FilterMatchMode } from "primeng/api";
import { ColumnTable, DisplayType, FilterType } from "../utils";
import { Aluno_Restricao } from "./aluno-restricao.model";
import { AlunoChecklistCompleto } from "./calendario.model";
import { Aluno_CheckList_Item } from "./checklist.model";
import { Dashboard_Aula_Participacao } from "./dashboard.model";
import { Evento } from "./evento.model";

export class AlunoRequest {
    id: number = 0;
    rm: string = '';    
    pessoa_Id: number = 0
    nome: string = '';
    dataNascimento?: Date;
    celular: string = '';
    telefone: string = '';
    email: string = '';
    observacao: string = '';
    endereco: string = '';
    aluno_Foto?: string;
    restricaoMobilidade: boolean = false;

    dataInicioVigencia: Date = new Date;
    dataFimVigencia?: Date;

    perfilCognitivo_Id?: number;
    turma_Id?: number;
    pessoa_Sexo_Id?: number;
    apostila_Kit_Id?: number;
    
    restricoes: Aluno_Restricao[] = [];

    primeiraAula_Id?: number;
    aulaZero_Id?: number;
}

export class Aluno {
    id: number = 0;
    rm: string = '';    
    pessoa_Id: number = 0
    nome: string = '';
    dataNascimento?: Date;
    idade?: number;
    ehAniversario?: boolean;
    celular: string='';
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
    activeString: string = '';

    perfilCognitivo_Id: number = 0;
    perfilCognitivo: string = '';

    turma_Id?: number;
    turma?: string;
    turmaDesc?: string;
    diaSemana?: number;
    horario?: Date;
    linkGrupo?: string;

    restricaoMobilidade: boolean = false;

    professor_Id?: number;
    professor?: string;
    corLegenda?: string;

    pessoa_Sexo_Id?: number;
    pessoa_Sexo?: string = '';

    aspNetUsers_Created_Id?: number;
    aspNetUsers_Created?: string = '';

    apostila_Abaco_Id?: number = '' as any;
    apostila_AH_Id?: number = '' as any;
    
    apostila_Abaco?: string = '';
    apostila_AH?: string = '';
    
    numeroPaginaAH?: number = '' as any;
    numeroPaginaAbaco?: number = '' as any;
    
    kit?: string = '' as any;
    apostila_Kit_Id?: number = undefined as any;

    checklistCompleto: AlunoChecklistCompleto[] = [];
    alunoChecklist: Aluno_CheckList_Item[] = [];
    restricoes: Aluno_Restricao[] = [];

    checklist_Id?: number = '' as any;
    checklist?: string = '';
    
    aulas: Dashboard_Aula_Participacao[] = [];
    disponivel?: boolean;
    disponivelEvent?: Evento;
    aulasParaRepor: Evento[] = []
    
    primeiraAula_Id?: number;
    primeiraAula?: Evento;
    aulaZero_Id?: number;
    aulaZero?: Evento;
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
        field: 'nome',
        label: 'Nome',
        filterType: FilterType.text,
        displayType: DisplayType.text,
        sortable: true,
        frozen: true,
        filterOptions: {
            type: FilterType.text,
            matchMode: FilterMatchMode.CONTAINS.toString(),
            value: '',
            icon: undefined,
            primeElement: 'inputtext',
            primeElementOptions: {}
        }
    },
    {
        field: 'turma',
        label: 'Turma',
        filterType: FilterType.text,
        displayType: DisplayType.text,
        sortable: true,
        filterOptions: {
            type: FilterType.text,
            matchMode: FilterMatchMode.CONTAINS.toString(),
            value: '',
            icon: undefined,
            primeElement: 'inputtext',
            primeElementOptions: {}
        }
    },
    {
        field: 'perfilCognitivo',
        label: 'Perfil Cognitivo',
        filterType: FilterType.text,
        displayType: DisplayType.text,
        sortable: true,
        filterOptions: {
            type: FilterType.text,
            matchMode: FilterMatchMode.CONTAINS.toString(),
            value: '',
            icon: undefined,
            primeElement: 'inputtext',
            primeElementOptions: {}
        }
    },
    {
        field: 'idade',
        label: 'Idade',
        filterType: FilterType.numeric,
        displayType: DisplayType.mask,
        sortable: true,
        filterOptions: {
            type: FilterType.text,
            matchMode: FilterMatchMode.EQUALS.toString(),
            value: '',
            icon: undefined,
            primeElement: 'inputnumber',
            primeElementOptions: {}
        }
    },
    {
        field: 'kit',
        label: 'Kit',
        filterType: FilterType.text,
        displayType: DisplayType.text,
        sortable: true, 
        filterOptions: {
            type: FilterType.text,
            matchMode: FilterMatchMode.CONTAINS.toString(),
            value: '',
            icon: undefined,
            primeElement: 'inputtext',
            primeElementOptions: {}
        }
    },
    {
        field: 'apostila_Abaco',
        label: 'Ábaco',
        filterType: FilterType.text,
        displayType: DisplayType.text,
        sortable: true, 
        filterOptions: {
            type: FilterType.text,
            matchMode: FilterMatchMode.CONTAINS.toString(),
            value: '',
            icon: undefined,
            primeElement: 'inputtext',
            primeElementOptions: {}
        }
    },
    {
        field: 'numeroPaginaAbaco',
        label: 'Página',
        filterType: FilterType.numeric,
        displayType: DisplayType.mask,
        sortable: true,
        filterOptions: {
            type: FilterType.text,
            matchMode: FilterMatchMode.EQUALS.toString(),
            value: '',
            icon: undefined,
            primeElement: 'inputnumber',
            primeElementOptions: {}
        }
    },
    {
        field: 'apostila_AH',
        label: 'AH',
        filterType: FilterType.text,
        displayType: DisplayType.text,
        sortable: true, 
        filterOptions: {
            type: FilterType.text,
            matchMode: FilterMatchMode.CONTAINS.toString(),
            value: '',
            icon: undefined,
            primeElement: 'inputtext',
            primeElementOptions: {}
        }
    },
    {
        field: 'numeroPaginaAH',
        label: 'Página',
        filterType: FilterType.numeric,
        displayType: DisplayType.mask,
        sortable: true,
        filterOptions: {
            type: FilterType.text,
            matchMode: FilterMatchMode.EQUALS.toString(),
            value: '',
            icon: undefined,
            primeElement: 'inputnumber',
            primeElementOptions: {}
        }
    },
    {
        field: 'activeString',
        label: 'Status',
        sortable: true,
        filterType: FilterType.text,
        filterMatchMode: FilterMatchMode.EQUALS.toString(),
        displayType: DisplayType.options,
        filterOptions: {
            type: 'text',
            matchMode: FilterMatchMode.EQUALS.toString(),
            value: undefined,
            primeElement: 'select',
            primeElementOptions: {
                icon: undefined,
                format: undefined,
                placeholder: undefined,
                options: [
                    {
                        value: 'Ativo',
                        label: "Ativo",
                        severity: "success",
                        icon: "pi pi-lock-open",
                        showDeactivatedDate: false
                    },
                    {
                        value: 'Inativo',
                        label: "Inativo",
                        severity: "danger",
                        icon: "pi pi-lock",
                        showDeactivatedDate: true
                    }
                ]

            }
        },
        options: {
            items: [
                {
                    value: 'Ativo',
                    label: "Ativo",
                    severity: "success",
                    icon: "pi pi-lock-open",
                    showDeactivatedDate: false
                },
                {
                    value: 'Inativo',
                    label: "Inativo",
                    severity: "danger",
                    icon: "pi pi-lock",
                    showDeactivatedDate: true
                }
            ]
        },
    },
];
