import { ColumnTable, DisplayType, FilterType } from "../utils";
import { Basic_List } from "./_basic.model";

export class Account extends Basic_List {
    name: string = '';
    email: string = '';
    phone: string = '';
    role: string = '';
    role_Id: number = 0;
    verified?: Date;
    isVerified: boolean = false;
    passwordReset?: Date;
}

export class AccountRequest {
    id: number = 0;
    name: string = '';
    phone: string = '';
    email: string = '';
    role_Id: number = 0;
}

export class AccountResponse {
    id: number = 0;
    name: string = '';
    phone: string = '';
    email: string = '';
    created: Date = new Date;
    updated?: Date;
    isVerified: boolean = false;
    passwordReset?: Date;
    jwtToken: string = '';
    refreshToken: string = '';
    role: string = '';
    role_Id: number = 0;
    professor_Id?: number;
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
        label: 'Celular',
        filterType: FilterType.text,
        displayType: DisplayType.mask,
        options: {
            format: '+99 (99) 9.9999-9999'
        },
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
