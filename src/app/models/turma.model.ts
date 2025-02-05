import { ColumnTable, DisplayType, FilterType } from "../utils";
import { Basic, Basic_List } from "./_basic.model";

export class TurmaRequest  {
    id: number = 0;
    nome: string = '';
    diaSemana: number = undefined as unknown as number;
    horario: Date = undefined as unknown as Date;
    professor_Id: number = undefined as unknown as number;
    turma_Tipo_Id: number = undefined as unknown as number;
    capacidadeMaximaAlunos: number = undefined as unknown as number;
}
export class Turma extends Basic_List {
    nome: string = '';
    diaSemana: number = undefined as unknown as number;
    horario: Date = new Date;
    professor_Id: number = undefined as unknown as number;
    professor: string = '';
    turma_Tipo_Id: number = undefined as unknown as number;
    turma_Tipo: string = '';
    capacidadeMaximaAlunos: number = undefined as unknown as number;
}


export class Turma_Tipo {
    id: number = 0;
    nome: string = '';
}

export var turmaColumns: ColumnTable[] = [
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
        field: 'diaSemana',
        label: 'Dias de Aula',
        filterType: FilterType.text,
        displayType: DisplayType.options,
        options: {
            "items": [
                { "value": 1, "label": "Domingo" },
                { "value": 2, "label": "Segunda-feira" },
                { "value": 3, "label": "Terça-feira" },
                { "value": 4, "label": "Quarta-feira" },
                { "value": 5, "label": "Quinta-feira" },
                { "value": 6, "label": "Sexta-feira" },
                { "value": 7, "label": "Sábado" },
            ]
            
        },
    },
    {
        field: 'horario',
        label: 'Horário de Aula',
        filterType: FilterType.time,
        displayType: DisplayType.time,
        options: {
            format: 'HH\'h\'mm'
        },
    },
    {
        field: 'turma_Tipo',
        label: 'Faixa Etária',
        filterType: FilterType.text,
        displayType: DisplayType.text,
        options: undefined,
    },{
        field: 'capacidadeMaximaAlunos',
        label: 'Limite de Alunos',
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
