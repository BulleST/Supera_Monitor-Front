import { ColumnTable, DisplayType, FilterType } from "../utils";
import { Basic_List } from "./_basic.model";
import { Turma } from "./turma.model";

export class Professor extends Basic_List {
    nome: string = '';
    telefone: string = '';
    email: string = '';
    dataInicio: Date = new Date;
    professor_NivelAbaco_Id: number = undefined as unknown as number;
    professor_NivelAbaco: string = '';
    professor_NivelAH_Id: number = undefined as unknown as number;
    professor_NivelAH: string = '';
    account_Id: number = undefined as unknown as number;
    role_Id: number = 0;
    role: string = '';
    corLegenda: string = '';
    disponivel?: boolean;
    disponivelTurma?: Turma;
}

export class ProfessorCreateRequest {
    account_Id: number = undefined as unknown as number;
    nome: string = '';
    email: string = '';
    telefone: string = '';
    dataInicio: Date = new Date;
    professor_NivelAbaco_Id: number = undefined as unknown as number;
    professor_NivelAH_Id: number = undefined as unknown as number;
    corLegenda: string = '';
}
export class ProfessorEditRequest {
    id: number = 0;
    account_Id: number = 0;
    nome: string = '';
    telefone: string = '';
    dataInicio: Date = new Date;
    professor_NivelAbaco_Id: number = undefined as unknown as number;
    professor_NivelAH_Id: number = undefined as unknown as number;
    corLegenda: string = '';

}

export class Professor_NivelApostila {
    id: number = 0;
    descricao: string = '';
}


export var professorColumns: ColumnTable[] = [
    {
        field: 'corLegenda',
        label: '',
        filterType: FilterType.none,
        displayType: DisplayType.color,
    },
    {
        field: 'nome',
        label: 'Nome',
        filterType: FilterType.text,
        displayType: DisplayType.text,
        options: undefined,
    },
    {
        field: 'email',
        label: 'E-mail',
        filterType: FilterType.text,
        displayType: DisplayType.text,
        options: undefined,
    },
    {
        field: 'telefone',
        label: 'Telefone/Celular',
        filterType: FilterType.text,
        displayType: DisplayType.text,
        options: undefined,
    },
    {
        field: 'dataInicio',
        label: 'Data de Início',
        filterType: FilterType.date,
        displayType: DisplayType.date,
        options: {
            format: 'dd/MM/yyyy'
        },
    },
    {
        field: 'nivelAbaco',
        label: 'Nível Ábaco',
        filterType: FilterType.text,
        displayType: DisplayType.text,
        options: undefined,
    },
    {
        field: 'nivelAH',
        label: 'Nível AH',
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
