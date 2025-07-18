import { FilterMatchMode } from "primeng/api";
import { ColumnTable, DisplayType, FilterType } from "../utils";
import { Basic_List } from "./_basic.model";
import { Role } from "./account-perfil.model";

export class Account extends Basic_List {
    name: string = '';
    email: string = '';
    phone: string = '';
    role: string = 'Assistant';
    role_Id: number = Role.Assistant;
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
        field: 'email',
        label: 'E-mail',
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
        field: 'phone',
        label: 'Celular',
        displayType: DisplayType.mask,
        sortable: true,
        frozen: true,
        filterOptions: {
            type: FilterType.text,
            matchMode: FilterMatchMode.CONTAINS.toString(),
            value: undefined,
            icon: 'pi pi-mobile',
            primeElement: 'inputmask',
            primeElementOptions: {
                format: '+99 (99) 9.9999-9999',
                placeholder: '+99 (99) 9.9999-9999',
            }
        },
        options: {
            format: '+99 (99) 9.9999-9999'
        },
    },
    {
        field: 'role',
        label: 'Perfil',
        displayType: DisplayType.text,
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
