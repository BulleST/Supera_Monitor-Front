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
    vagas: number = 0;
    temGrupo: boolean = false;
}

export var turmaColumns: ColumnTable[] = [
    {
        field: 'corLegenda',
        label: '',
        displayType: DisplayType.color,
        sortable: false,
        filterOptions: {
            type: FilterType.none,
        }
    },
    {
        field: 'nome',
        label: 'Nome',
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
        field: 'professor',
        label: 'Educador(a)',
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
        field: 'diasDeAulaString',
        label: 'Dias de Aula',
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
        field: 'salaDeAulaString',
        label: 'Sala',
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
        field: 'perfilCognitivoString',
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
        field: 'capacidadeMaximaAlunosString',
        label: 'Limite',
        displayType: DisplayType.mask,
        sortable: true,
        filterOptions: {
            type: FilterType.numeric,
            matchMode: FilterMatchMode.EQUALS.toString(),
            value: undefined,
            icon: undefined,
            primeElement: 'inputtext',
            primeElementOptions: {}
        },
        options: {
            width: '15px',
        },
    },
    {
        field: 'vagas',
        label: 'Vaga(s)',
        displayType: DisplayType.text,
        sortable: true,
        filterOptions: {
            type: FilterType.numeric,
            matchMode: FilterMatchMode.EQUALS.toString(),
            value: undefined,
            icon: undefined,
            primeElement: 'inputnumber',
            primeElementOptions: {}
        },
        options: {
            width: '15px'
        },
    },
    {
        field: 'temGrupo',
        label: 'Grupo',
        displayType: DisplayType.link,
        sortable: true,
        filterOptions: {
            type: FilterType.boolean,
            matchMode: FilterMatchMode.EQUALS.toString(),
            value: undefined,
            icon: undefined,
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
                        label: "Tem grupo",
                        icon: "pi pi-check text-green-500",
                    },
                    {
                        value: false,
                        label: "Não tem grupo",
                        icon: "pi pi-times text-red-500",
                    }
                ]
            }
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
