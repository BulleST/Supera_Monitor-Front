import { ColumnTable, DisplayType, FilterType } from "../utils";
import { Basic_List } from "./_basic.model";
import { PerfilCognitivo } from "./perfil-cognitivo.model";

export class TurmaRequest {
    id: number = 0;
    nome: string = '';
    diaSemana: number = undefined as unknown as number;
    horario: Date = undefined as unknown as Date;
    professor_Id: number = undefined as unknown as number;
    sala_Id: number = undefined as unknown as number;
    capacidadeMaximaAlunos: number = 12;
    perfilCognitivo: PerfilCognitivo[] = [];
}

export class Turma extends Basic_List {
    nome: string = '';
    diaSemana: number = undefined as unknown as number;
    horario: Date = undefined as unknown as Date;
    professor_Id: number = undefined as unknown as number;
    professor: string = '';
    corLegenda: string = '';
    sala_Id: number = undefined as unknown as number;
    numeroSala: number = undefined as unknown as number;
    andar: number = undefined as unknown as number;
    capacidadeMaximaAlunos: number = 12;
    perfilCognitivo: PerfilCognitivo[] = [];
    perfilCognitivoString: string = '';
    diasDeAulaString: string = '';
    salaDeAulaString: string = '';
}

export var turmaColumns: ColumnTable[] = [
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
        field: 'professor',
        label: 'Professor',
        filterType: FilterType.text,
        displayType: DisplayType.text,
        options: undefined,
    },
    {
        field: 'diasDeAulaString',
        label: 'Dias de Aula',
        filterType: FilterType.text,
        displayType: DisplayType.text,
        options: undefined,
    },
    {
        field: 'salaDeAulaString',
        label: 'Sala',
        filterType: FilterType.text,
        displayType: DisplayType.text,
        options: undefined,
    },
    // {
    //     field: 'diaSemana',
    //     label: 'Dias de Aula',
    //     filterType: FilterType.text,
    //     displayType: DisplayType.options,
    //     options: {
    //         "items": [
    //             { "value": 0, "label": "Domingo" },
    //             { "value": 1, "label": "Segunda-feira" },
    //             { "value": 2, "label": "Terça-feira" },
    //             { "value": 3, "label": "Quarta-feira" },
    //             { "value": 4, "label": "Quinta-feira" },
    //             { "value": 5, "label": "Sexta-feira" },
    //             { "value": 6, "label": "Sábado" },
    //         ]

    //     },
    // },
    // {
    //     field: 'horario',
    //     label: 'Horário',
    //     filterType: FilterType.time,
    //     displayType: DisplayType.time,
    //     options: {
    //         format: 'HH\'h\'mm',
    //         width: '15px'
    //     },
    // },
    {
        field: 'perfilCognitivoString',
        label: 'Perfil Cognitivo',
        filterType: FilterType.text,
        displayType: DisplayType.text,
        options: undefined,
    },
    {
        field: 'capacidadeMaximaAlunos',
        label: 'Capacidade máxima',
        filterType: FilterType.text,
        displayType: DisplayType.text,
        options: {
            width: '15px'
        },
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
