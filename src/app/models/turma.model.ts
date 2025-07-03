import { FilterMatchMode } from "primeng/api";
import { ColumnTable, DisplayType, FilterType } from "../utils";
import { Basic_List } from "./_basic.model";
import { PerfilCognitivo } from "./perfil-cognitivo.model";

export class TurmaRequest {
    id: number = 0;
    nome: string = '';
    linkGrupo?: string;
    diaSemana: number = undefined as unknown as number;
    horario: Date = undefined as unknown as Date;
    professor_Id: number = undefined as unknown as number;
    sala_Id: number = undefined as unknown as number;
    capacidadeMaximaAlunos: number = 12;
    perfilCognitivo: number[] = [];
}

export class Turma extends Basic_List {
    nome: string = '';
    diaSemana: number = undefined as unknown as number;
    horario: Date = undefined as unknown as Date;
    professor_Id: number = undefined as unknown as number;
    professor: string = '';
    corLegenda: string = '';
    linkGrupo?: string;
    sala_Id: number = undefined as unknown as number;
    numeroSala: number = undefined as unknown as number;
    andar: number = undefined as unknown as number;
    capacidadeMaximaAlunos: number = 12;
    perfilCognitivo: PerfilCognitivo[] = [];
    perfilCognitivoString: string = '';
    diasDeAulaString: string = '';
    salaDeAulaString: string = '';
    capacidadeMaximaAlunosString: string = '';
    alunosAtivos: number = 0
}

export var turmaColumns: ColumnTable[] = [
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
        field: 'professor',
        label: 'Educador(a)',
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
        field: 'diasDeAulaString',
        label: 'Dias de Aula',
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
        field: 'salaDeAulaString',
        label: 'Sala',
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
        field: 'perfilCognitivoString',
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
        field: 'capacidadeMaximaAlunosString',
        label: 'Limite',
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
        },
        options: {
            width: '15px'
        },
    },
    {
        field: 'linkGrupo',
        label: 'Grupo',
        filterType: FilterType.text,
        displayType: DisplayType.link,
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
