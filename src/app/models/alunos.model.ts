import { ColumnTable, DisplayType, FilterType } from "../utils";

export class AlunoRequest {
    id: number = 0
    nome: string = '';
    dataNascimento: string = '';
    celular: string = '';
    telefone: string = '';
    email: string = '';
    endereco: string = '';
    observacao: string = '';
    turma_Id: number = 0
    pessoa_Sexo_Id: number = 0
    aluno_Foto?: string;
}

export class Aluno {
    id: number = 0
    pessoa_Id: number = 0
    nome: string = '';
    dataCadastro: Date = new Date;
    dataEntrada: Date = new Date;
    dataNascimento: Date = new Date;
    // cpf: string = '';
    // rg: string = '';
    celular: string = '';
    telefone: string = '';
    email: string = '';
    endereco: string = '';
    observacao: string = '';
    unidade_Id: number = 0
    turma_Id: number = 0
    turma: string = '';
    aluno_Foto?: string;
    professor_Id: number = 0
    professor: string = '';
    // pessoa_FaixaEtaria_Id?: number;
    // pessoa_FaixaEtaria: string = '';
    // pessoa_Geracao_Id?: number;
    // pessoa_Geracao: string = '';
    // pessoa_Indicou_Id?: number;
    // pessoa_Indicou: string = '';
    // pessoa_Origem_Canal_Id?: number;
    // pessoa_Origem_Canal: string = '';
    // pessoa_Origem_Id?: number;
    // pessoa_Origem: string = '';
    pessoa_Sexo_Id?: number;
    pessoa_Sexo: string = '';
    // pessoa_Status_Id?: number;
    // pessoa_Status: string = '';
    active: boolean = false;
    created: Date = new Date;
    lastUpdated?: Date;
    deactivated?: Date;
    aspNetUsers_Created_Id?: number;
    aspNetUsers_Created: string = '';
    apostilaAbaco?: string;
    ah?: string;
    numeroPaginaAbaco?: string;
    numeroPaginaAH?: string;
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
        label: 'Professor',
        filterType: FilterType.text,
        displayType: DisplayType.text,
        options: undefined,
    },
    {
        field: 'active',
        label: 'Status',
        filterType: FilterType.text,
        displayType: DisplayType.options,
        options: {
            "items": [
                { "value": true, "label": "Ativo", "severity": "success", "icon": "pi pi-lock-open", "showDeactivatedDate": false },
                { "value": false, "label": "Inativo", "severity": "danger", "icon": "pi pi-lock", "showDeactivatedDate": true }
            ]
        },
    },
];
