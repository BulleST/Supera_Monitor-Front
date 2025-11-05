import { FilterMatchMode } from "primeng/api";
import { ColumnTable, DisplayType, FilterType } from "../utils";
import { Aluno_Restricao } from "./aluno-restricao.model";
import { AlunoChecklistCompleto } from "./calendario.model";
import { Aluno_CheckList_Item } from "./checklist.model";
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
    
    disponivel?: boolean;
    disponivelEvent?: Evento;
    aulasParaRepor: Evento[] = []
    
    primeiraAula_Id?: number;
    primeiraAula?: Evento;
    
    aulaZero_Id?: number;
    aulaZero?: Evento;


    // Tela Cadastrar Turma Extra
    eventoReposicaoEmAndamento?: Evento;
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
        displayType: DisplayType.text,
        sortable: true,
        frozen: true,
        filterOptions: {
            type: FilterType.text,
            matchMode: FilterMatchMode.CONTAINS.toString(),
            value: undefined,
            icon: undefined,
            primeElement: 'inputtext',
            primeElementOptions: {}
        }
    },
    {
        field: 'turma',
        label: 'Turma',
        displayType: DisplayType.text,
        sortable: true,
        filterOptions: {
            type: FilterType.text,
            matchMode: FilterMatchMode.CONTAINS.toString(),
            value: undefined,
            icon: undefined,
            primeElement: 'inputtext',
            primeElementOptions: {}
        }
    },
    {
        field: 'perfilCognitivo',
        label: 'Perfil Cognitivo',
        displayType: DisplayType.text,
        sortable: true,
        filterOptions: {
            type: FilterType.text,
            matchMode: FilterMatchMode.CONTAINS.toString(),
            value: undefined,
            icon: undefined,
            primeElement: 'inputtext',
            primeElementOptions: {}
        }
    },
    {
        field: 'idade',
        label: 'Idade',
        displayType: DisplayType.mask,
        sortable: true,
        filterOptions: {
            type: FilterType.numeric,
            matchMode: FilterMatchMode.GREATER_THAN_OR_EQUAL_TO.toString(),
            value: undefined,
            icon: undefined,
            primeElement: 'inputnumber',
            primeElementOptions: {}
        }
    },
    {
        field: 'kit',
        label: 'Kit',
        displayType: DisplayType.text,
        sortable: true, 
        filterOptions: {
            type: FilterType.text,
            matchMode: FilterMatchMode.CONTAINS.toString(),
            value: undefined,
            icon: undefined,
            primeElement: 'inputtext',
            primeElementOptions: {}
        }
    },
    {
        field: 'apostila_Abaco',
        label: 'Ábaco',
        displayType: DisplayType.text,
        sortable: true, 
        filterOptions: {
            type: FilterType.text,
            matchMode: FilterMatchMode.CONTAINS.toString(),
            value: undefined,
            icon: undefined,
            primeElement: 'inputtext',
            primeElementOptions: {}
        }
    },
    {
        field: 'numeroPaginaAbaco',
        label: 'Página',
        displayType: DisplayType.mask,
        sortable: true,
        filterOptions: {
            type: FilterType.text,
            matchMode: FilterMatchMode.EQUALS.toString(),
            value: undefined,
            icon: undefined,
            primeElement: 'inputnumber',
            primeElementOptions: {}
        }
    },
    {
        field: 'apostila_AH',
        label: 'AH',
        displayType: DisplayType.text,
        sortable: true, 
        filterOptions: {
            type: FilterType.numeric,
            matchMode: FilterMatchMode.GREATER_THAN_OR_EQUAL_TO.toString(),
            value: undefined,
            icon: undefined,
            primeElement: 'inputtext',
            primeElementOptions: {}
        }
    },
    {
        field: 'numeroPaginaAH',
        label: 'Página',
        displayType: DisplayType.text,
        sortable: true,
        filterOptions: {
            type: FilterType.numeric,
            matchMode: FilterMatchMode.GREATER_THAN_OR_EQUAL_TO.toString(),
            value: undefined,
            icon: undefined,
            primeElement: 'inputnumber',
            primeElementOptions: {}
        }
    },
    {
        field: 'restricaoMobilidade',
        label: 'Restrição de Mobilidade',
        displayType: DisplayType.options,
        sortable: true,
        filterOptions: {
            type: FilterType.boolean,
            matchMode: FilterMatchMode.EQUALS.toString(),
            value: undefined,
            primeElement: 'select',
            primeElementOptions: {
                icon: undefined,
                format: undefined,
                placeholder: undefined,
                options: [
                    {
                        value: undefined,
                        label: "Todos",
                        icon: 'pi pi-bars text-primary-500'
                    },
                    {
                        value: true,
                        label: "Sim",
                        icon: "pi pi-check text-red-500",
                    },
                    {
                        value: false,
                        label: "Não",
                        icon: "pi pi-times text-500",
                    }
                ]

            }
        },
    },
    {
        field: 'active',
        label: 'Status',
        displayType: DisplayType.options,
        sortable: true,
        filterOptions: {
            type: FilterType.boolean,
            matchMode: FilterMatchMode.EQUALS.toString(),
            value: undefined,
            primeElement: 'select',
            primeElementOptions: {
                icon: undefined,
                format: undefined,
                placeholder: undefined,
                options: [
                    {
                        value: undefined,
                        label: "Todos",
                        icon: 'pi pi-bars text-primary-500'
                    },
                    {
                        value: true,
                        label: "Ativo",
                        icon: "pi pi-lock-open text-green-500",
                    },
                    {
                        value: false,
                        label: "Inativo",
                        icon: "pi pi-lock text-red-500",
                    }
                ]

            }
        },
    },
];
