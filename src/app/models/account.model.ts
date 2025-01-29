import { ColumnTable, DisplayType, FilterType } from "../utils";
import { Basic_List } from "./_basic.model";

export interface Account_List extends Basic_List {
    id: number;
    name: string;
    email: string;
    phone: string;
    role: string;
    role_Id: number;
    verified?: Date;
    isVerified: boolean;
    passwordReset?: Date;
}

export interface Account {
    id: number;
    name: string;
    phone: string;
    email: string;
    role: string;
    created: Date;
    updated?: Date;
    isVerified: boolean;
    passwordReset?: Date;
    jwtToken: string;
    refreshToken: string;
    role_Id: number;
    customer_Id: number;
}

export class Account {
    id: number = 0;
    name: string = '';
    phone: string = '';
    email: string = '';
    role: string = '';
    created: Date = new Date;
    updated?: Date;
    isVerified: boolean = false;
    passwordReset?: Date;
    jwtToken: string = '';
    refreshToken: string = '';
    role_Id: number = 0;
    customer_Id: number = 0;
}

export var userColumns: ColumnTable[] = [
    {
        field: 'name',
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
        field: 'phone',
        label: 'Telefone/Celular',
        filterType: FilterType.text,
        displayType: DisplayType.text,
        options: undefined,
    },
    {
        field: 'role',
        label: 'Perfil',
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
