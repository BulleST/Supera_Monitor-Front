import { FilterMatchMode } from "primeng/api";
import { ColumnTable, DisplayType, FilterType } from "../utils";
import { Basic_List } from "./_basic.model";
import { Evento } from "./evento.model";

export class Professor extends Basic_List {
    nome: string = '';
    telefone: string = '';
    email: string = '';
    dataInicio: Date = new Date;
    dataNascimento: Date = new Date;
    professor_NivelCertificacao_Id: number = undefined as unknown as number;
    professor_NivelCertificacao: string = '';
    account_Id: number = undefined as unknown as number;
    corLegenda: string = getRandomColor();
    expedienteInicio?: Date;
    expedienteFim?: Date;

    // Não mapeados
    disponivel?: boolean;
    disponivelEvent?: Evento;
    // const getAge = birthDate => Math.floor((new Date() - new Date(birthDate).getTime()) / 3.15576e+10)
}

export class ProfessorCreateRequest {
    account_Id: number = undefined as unknown as number;
    nome: string = '';
    email: string = '';
    telefone: string = '';
    dataInicio: Date = new Date;
    dataNascimento: Date = new Date;
    professor_NivelCertificacao_Id: number = undefined as unknown as number;
    corLegenda: string = getRandomColor();
    expedienteInicio?: Date;
    expedienteFim?: Date;
}

export class ProfessorEditRequest {
    id: number = 0;
    account_Id: number = 0;
    nome: string = '';
    telefone: string = '';
    dataInicio: Date = new Date;
    dataNascimento: Date = new Date;
    professor_NivelCertificacao_Id: number = undefined as unknown as number;
    corLegenda: string = getRandomColor();
    expedienteInicio?: Date;
    expedienteFim?: Date;
}

export class Professor_NivelCertificacao {
    id: number = 0;
    descricao: string = '';
}


export var professorColumns: ColumnTable[] = [
    {
        field: 'corLegenda',
        label: '',
        filterType: FilterType.none,
        displayType: DisplayType.color,
        sortable: false,
    },
    {
        field: 'nome',
        label: 'Nome',
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
        field: 'email',
        label: 'E-mail',
        filterType: FilterType.text,
        displayType: DisplayType.text,
        sortable: true,
        filterOptions: {
            type: FilterType.text,
            matchMode: FilterMatchMode.CONTAINS.toString(),
            value: '',
            icon: 'pi pi-envelope',
            primeElement: 'inputtext',
            primeElementOptions: {
                email: true,
                placeholder: 'example@gmail.com'
            }
        },
    },
    {
        field: 'telefone',
        label: 'Celular',
        sortable: true,
        filterType: FilterType.text,
        displayType: DisplayType.mask,
        filterOptions: {
            type: FilterType.text,
            matchMode: FilterMatchMode.CONTAINS.toString(),
            value: '',
            icon: 'pi pi-mobile',
            primeElement: 'inputmask',
            primeElementOptions: {
                format: '+99 (99) 9.9999-9999',
                placeholder: '+99 (99) 9.9999-9999',
            }
        },
        options: {
            format: '+99 (99) 9.9999-9999',
            iconField: 'pi pi-mobile'
        },
    },
    {
        field: 'dataInicio',
        label: 'Data de Início',
        sortable: true,
        filterType: FilterType.date,
        displayType: DisplayType.date,
        filterOptions: {
            type: 'date',
            matchMode: FilterMatchMode.DATE_IS.toString(),
            value: undefined,
            primeElement: 'datepicker',
            primeElementOptions: {
                showIcon: true,
                icon: 'pi pi-calesndar',
                format: 'dd/mm/yy',
                placeholder: 'dd/mm/yy',
            }
        },
        options: {
            format: 'dd/MM/yyyy',
            formatDatePicker: 'dd/mm/yy'
        },
    },
    {
        field: 'professor_NivelCertificacao',
        label: 'Nível Certificação',
        sortable: true,
        filterType: FilterType.text,
        displayType: DisplayType.text,
        filterOptions: {
            type: 'text',
            matchMode: FilterMatchMode.IN.toString(),
            value: undefined,
            primeElement: 'multiselect',
            primeElementOptions: {
                icon: undefined,
                format: undefined,
                placeholder: undefined,
                options: [],
            }
        },
        options: {
            items: []
        }
    },

    {
        field: 'expedienteInicio',
        label: 'Início Expediente',
        sortable: true,
        filterType: FilterType.time,
        displayType: DisplayType.time,
        filterOptions: {
            type: 'text',
            matchMode: FilterMatchMode.CONTAINS.toString(),
            value: undefined,
            primeElement: 'datepicker',
            primeElementOptions: {
                showIcon: true,
                icon: 'pi pi-clock',
                format: 'HH:mm',
                placeholder: 'HH:mm',
                timeOnly: true,
                showTime: true,
                hourFormat: 24,
            }
        },
        options: {
            format: 'HH:mm',
        },
    },
    {
        field: 'expedienteFim',
        label: 'Fim Expediente',
        sortable: true,
        filterType: FilterType.time,
        displayType: DisplayType.time,
        filterOptions: {
            type: 'date',
            matchMode: FilterMatchMode.DATE_IS.toString(),
            value: undefined,
            primeElement: 'datepicker',
            primeElementOptions: {
                showIcon: true,
                icon: 'pi pi-clock',
                format: 'HH:mm',
                placeholder: 'HH:mm',
                timeOnly: true,
                showTime: true,
                hourFormat: 24,
            }
        },
        options: {
            format: 'HH:mm'
        },
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


function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}