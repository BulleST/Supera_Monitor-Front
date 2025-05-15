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
        label: 'Celular',
        filterType: FilterType.text,
        displayType: DisplayType.mask,
        options: {
            format: '+99 (99) 9.9999-9999'
        },
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
        field: 'professor_NivelCertificacao',
        label: 'Nível Certificação',
        filterType: FilterType.text,
        displayType: DisplayType.text,
        options: undefined,
    },
    
    {
        field: 'expedienteInicio',
        label: 'Início Expediente',
        filterType: FilterType.date,
        displayType: DisplayType.date,
        options: {
            format: 'HH:mm'
        },
    },
    {
        field: 'expedienteFim',
        label: 'Fim Expediente',
        filterType: FilterType.date,
        displayType: DisplayType.date,
        options: {
            format: 'HH:mm'
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


function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }