import { ColumnTable, DisplayType, FilterType } from "../utils";
import { Basic, Basic_List } from "./_basic.model";

export class Professor extends Basic_List {
    nome: string = '';
    telefone: string = '';
    email: string = '';
    dataInicio: Date = new Date;
    nivelAbaco: number = undefined as unknown as number;
    nivelAh: number = undefined as unknown as number;
    account_Id: number = 0;
    role_Id: number = 0;
    role: string = '';
}

export var professorColumns: ColumnTable[] = [
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
        field: 'nivelAh',
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
