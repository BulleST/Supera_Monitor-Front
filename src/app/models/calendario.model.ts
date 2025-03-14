import { Basic_List } from "./_basic.model";
import { Aula_Aluno_Falta } from "./aulas.model";
import { Aluno_CheckList_Item } from "./checklist.model";
import { perfisCognitivos, PerfilCognitivo } from "./perfil-cognitivo.model";
import { PseudoAula } from "./reposicao.model";


export enum CalendarioView {
    MeuCalendario,
    Geral
}

export class CalendarioRequest {
    intervaloDe?: Date;
    intervaloAte?: Date;
    turma_Id?: number;
    professor_Id?: number;
    aluno_Id?: number;
    perfilCognitivo_Id?: number;
}

export class CalendarioAula {
    aula_Id: number = PseudoAula.AulaId;
    data: Date = new Date;
    descricao: string = '';
    capacidadeMaximaAlunos: number = 12;
    sala_Id: number = 0;
    observacao?: string = '';
    finalizada: boolean = false;
    
    reposicaoDe_Aula_Id?: number;
    reposicaoDe_Aula?: CalendarioAula;

    professor_Id: number = 0;
    professor: string = '';
    corLegenda: string = '';

    turma?: string; // Remover futuramente
    turma_Id?: number;

    alunos: CalendarioAluno[] = [];
    perfilCognitivo: PerfilCognitivo[] = [];

    active?: boolean = !this.deactivated;
    created?: Date = undefined as unknown as Date;
    lastUpdated?: Date;
    deactivated?: Date;
    account_Created_Id?: number;
    account_Created?: string;

}

export class CalendarioAluno extends Basic_List {
    aula_Id: number = PseudoAula.AulaId;
    reposicaoDe_Aula_Id?: number;
    reposicaoDe_Aula?: CalendarioAula;
    presente?: boolean;
    observacao?: string;

    aluno_Id: number = 0;
    aluno: string = '';
    aluno_Foto?: string;
    celular?: string;

    perfilCognitivo_Id: number = 0;
    perfilCognitivo: string = '';

    turma_Id: number = 0; // Turma do aluno
    turma: string = ''; // Turma do aluno

    apostila_Abaco_Id?: number;
    apostila_AH_Id?: number;

    apostila_Abaco?: string;
    apostila_AH?: string;

    numeroPaginaAH?: number;
    numeroPaginaAbaco?: number;

    kit?: string;
    apostila_Kit_Id?: number;

    // Não mapeado
    flagAlunoNovo?: boolean = false;
    loadingFoto?: boolean = false;


    faltaMotivo?: Aula_Aluno_Falta;
    
    // from GET checklist/all/aula/aula_id
    checklists: CalendarioAlunoChecklistView[] = [];

    checklist?: string;
    checklist_Id?: number;
    

}

export class CalendarioAlunoChecklistView {
    id: number = 0;
    nome: string = '';
    prazo: Date = new Date;
    finalizados: Aluno_CheckList_Item[] = [];
    pendentesDaSemana: Aluno_CheckList_Item[] = [];
    atrasados: Aluno_CheckList_Item[] = [];
    items: Aluno_CheckList_Item[] = [];
}


export var calendarioList: CalendarioAula[] = [
    {
        "alunos": [
            {
                "id": 9,
                "aluno_Id": 1140,
                "checklists": [],
                "aula_Id": 24,
                "aluno": "Aparecida Filomena da Silva Pereira",
                "aluno_Foto": "",
                "turma_Id": 35,
                "turma": "Turma D",
                "reposicaoDe_Aula_Id": undefined,
                "presente": undefined,
                "apostila_Kit_Id": undefined,
                "kit": undefined,
                "apostila_Abaco": undefined,
                "apostila_Abaco_Id": undefined,
                "apostila_AH": undefined,
                "apostila_AH_Id": undefined,
                "numeroPaginaAbaco": undefined,
                "numeroPaginaAH": undefined,
                "observacao": undefined,
                "flagAlunoNovo": false,
                "perfilCognitivo": perfisCognitivos[0].nome,
                "perfilCognitivo_Id": perfisCognitivos[0].id,
            }
        ],
        "aula_Id": -1,
        "data": new Date("2025-02-24T09:30:00"),
        "turma_Id": 35,
        "descricao": "Turma D",
        "capacidadeMaximaAlunos": 35,
        "finalizada": false,
        "professor_Id": 30,
        "professor": "Angelica",
        "corLegenda": "#ff00ff",
        "observacao": "",
        "deactivated": undefined,
        "reposicaoDe_Aula_Id": undefined,
        "sala_Id": 0,
        "perfilCognitivo": perfisCognitivos
    },
    {
        "alunos": [],
        "aula_Id": -1,
        "data": new Date("2025-02-25T10:00:00"),
        "turma_Id": 37,
        "descricao": "Turma B",
        "capacidadeMaximaAlunos": 12,
        "finalizada": false,
        "professor_Id": 31,
        "professor": "Maria",
        "corLegenda": "#6B5FA0",
        "observacao": "",
        "deactivated": undefined,
        "reposicaoDe_Aula_Id": undefined,
        "sala_Id": 0,
        "perfilCognitivo": perfisCognitivos
    },
    {
        "alunos": [
            {
                "id": 8,
                "aluno_Id": 1141,
                "checklists": [],
                "aula_Id": 24,
                "aluno": "Susana (Susy) Jugend",
                "aluno_Foto": "",
                "turma_Id": 38,
                "turma": "Turma C",
                "reposicaoDe_Aula_Id": undefined,
                "presente": undefined,
                "apostila_Kit_Id": undefined,
                "kit": undefined,
                "apostila_Abaco": undefined,
                "apostila_Abaco_Id": undefined,
                "apostila_AH": undefined,
                "apostila_AH_Id": undefined,
                "numeroPaginaAbaco": undefined,
                "numeroPaginaAH": undefined,
                "observacao": undefined,
                "flagAlunoNovo": false,
                "perfilCognitivo": perfisCognitivos[0].nome,
                "perfilCognitivo_Id": perfisCognitivos[0].id,
            }
        ],
        "aula_Id": -1,
        "data": new Date("2025-02-25T08:00:00"),
        "turma_Id": 38,
        "descricao": "Turma C",
        "capacidadeMaximaAlunos": 12,
        "finalizada": false,
        "professor_Id": 30,
        "professor": "Angelica",
        "corLegenda": "#ff00ff",
        "observacao": "",
        "deactivated": undefined,
        "reposicaoDe_Aula_Id": undefined,
        "sala_Id": 0,
        "perfilCognitivo": perfisCognitivos
    },
    {
        "alunos": [],
        "aula_Id": -1,
        "data": new Date("2025-02-25T10:00:00"),
        "turma_Id": 39,
        "descricao": "Turma Z",
        "capacidadeMaximaAlunos": 12,
        "finalizada": false,
        "professor_Id": 30,
        "professor": "Angelica",
        "corLegenda": "#ff00ff",
        "observacao": "",
        "deactivated": undefined,
        "reposicaoDe_Aula_Id": undefined,
        "sala_Id": 0,
        "perfilCognitivo": []
    },
    {
        "alunos": [
            {
                "id": 1,
                "aluno_Id": 1173,
                "checklists": [],
                "aula_Id": 28,
                "aluno": "Norma Hochgreb",
                "aluno_Foto": "",
                "turma_Id": 40,
                "turma": "Turma E",
                "reposicaoDe_Aula_Id": undefined,
                "presente": undefined,
                "apostila_Kit_Id": undefined,
                "kit": undefined,
                "apostila_Abaco": undefined,
                "apostila_Abaco_Id": undefined,
                "apostila_AH": undefined,
                "apostila_AH_Id": undefined,
                "numeroPaginaAbaco": undefined,
                "numeroPaginaAH": undefined,
                "observacao": undefined,
                "flagAlunoNovo": false,
                "perfilCognitivo": perfisCognitivos[0].nome,
                "perfilCognitivo_Id": perfisCognitivos[0].id,
            },
            {
                "id": 2,
                "aluno_Id": 1174,
                "checklists": [],
                "aula_Id": 28,
                "aluno": "Danniel Gomes Almeida",
                "aluno_Foto": "",
                "turma_Id": 40,
                "turma": "Turma E",
                "reposicaoDe_Aula_Id": undefined,
                "presente": undefined,
                "apostila_Kit_Id": undefined,
                "kit": undefined,
                "apostila_Abaco": undefined,
                "apostila_Abaco_Id": undefined,
                "apostila_AH": undefined,
                "apostila_AH_Id": undefined,
                "numeroPaginaAbaco": undefined,
                "numeroPaginaAH": undefined,
                "observacao": undefined,
                "flagAlunoNovo": false,
                "perfilCognitivo": perfisCognitivos[0].nome,
                "perfilCognitivo_Id": perfisCognitivos[0].id,
            },
            {
                "id": 4,
                "aluno_Id": 1175,
                "checklists": [],
                "aula_Id": 29,
                "aluno": "Vera Garcia Leoni de Cerqueira",
                "aluno_Foto": "",
                "turma_Id": 40,
                "turma": "Turma E",
                "reposicaoDe_Aula_Id": 28,
                "presente": undefined,
                "apostila_Kit_Id": 7,
                "kit": undefined,
                "apostila_Abaco": undefined,
                "apostila_Abaco_Id": undefined,
                "apostila_AH": undefined,
                "apostila_AH_Id": undefined,
                "numeroPaginaAbaco": undefined,
                "numeroPaginaAH": undefined,
                "observacao": undefined,
                "flagAlunoNovo": false,
                "perfilCognitivo": perfisCognitivos[0].nome,
                "perfilCognitivo_Id": perfisCognitivos[0].id,
            },
            {
                "id": 10,
                "aluno_Id": 1176,
                "checklists": [],
                "aula_Id": 28,
                "aluno": "Manoel Fernando Anastacio",
                "aluno_Foto": "",
                "turma_Id": 40,
                "turma": "Turma E",
                "reposicaoDe_Aula_Id": undefined,
                "presente": undefined,
                "apostila_Kit_Id": 7,
                "kit": undefined,
                "apostila_Abaco": undefined,
                "apostila_Abaco_Id": undefined,
                "apostila_AH": undefined,
                "apostila_AH_Id": undefined,
                "numeroPaginaAbaco": undefined,
                "numeroPaginaAH": undefined,
                "observacao": undefined,
                "flagAlunoNovo": false,
                "perfilCognitivo": perfisCognitivos[0].nome,
                "perfilCognitivo_Id": perfisCognitivos[0].id,
            },
         
            {
                "id": 11,
                "aluno_Id": 1177,
                "checklists": [],
                "aula_Id": 28,
                "aluno": "Gabriel Bardella",
                "aluno_Foto": "",
                "turma_Id": 40,
                "turma": "Turma E",
                "reposicaoDe_Aula_Id": undefined,
                "presente": undefined,
                "apostila_Kit_Id": 7,
                "kit": undefined,
                "apostila_Abaco": undefined,
                "apostila_Abaco_Id": undefined,
                "apostila_AH": undefined,
                "apostila_AH_Id": undefined,
                "numeroPaginaAbaco": undefined,
                "numeroPaginaAH": undefined,
                "observacao": undefined,
                "flagAlunoNovo": false,
                "perfilCognitivo": perfisCognitivos[0].nome,
                "perfilCognitivo_Id": perfisCognitivos[0].id,
            },
           
        ],
        "aula_Id": -1,
        "data": new Date("2025-02-25T14:00:00"),
        "turma_Id": 40,
        "descricao": "Turma E",
        "capacidadeMaximaAlunos": 25,
        "finalizada": false,
        "professor_Id": 30,
        "professor": "Angelica",
        "corLegenda": "#ff00ff",
        "observacao": "",
        "deactivated": undefined,
        "reposicaoDe_Aula_Id": undefined,
        "sala_Id": 0,
        "perfilCognitivo": perfisCognitivos
    },
    {
        "alunos": [],
        "aula_Id": -1,
        "data": new Date("2025-02-27T18:00:00"),
        "turma_Id": 36,
        "descricao": "Turma A",
        "capacidadeMaximaAlunos": 12,
        "finalizada": false,
        "professor_Id": 31,
        "professor": "Maria",
        "corLegenda": "#6B5FA0",
        "observacao": "",
        "deactivated": undefined,
        "reposicaoDe_Aula_Id": undefined,
        "sala_Id": 0,
        "perfilCognitivo": perfisCognitivos
    },
    {
        "alunos": [
            {
                "id": 9,
                "aluno_Id": 1140,
                "checklists": [],
                "aula_Id": 24,
                "aluno": "Aparecida Filomena da Silva Pereira",
                "aluno_Foto": "",
                "turma_Id": 35,
                "turma": "Turma D",
                "reposicaoDe_Aula_Id": undefined,
                "presente": undefined,
                "apostila_Kit_Id": undefined,
                "kit": undefined,
                "apostila_Abaco": undefined,
                "apostila_Abaco_Id": undefined,
                "apostila_AH": undefined,
                "apostila_AH_Id": undefined,
                "numeroPaginaAbaco": undefined,
                "numeroPaginaAH": undefined,
                "observacao": undefined,
                "flagAlunoNovo": false,
                "perfilCognitivo": perfisCognitivos[0].nome,
                "perfilCognitivo_Id": perfisCognitivos[0].id,
            },
         
        ],
        "aula_Id": -1,
        "data": new Date("2025-03-03T09:30:00"),
        "turma_Id": 35,
        "turma": "Turma D",
        "descricao": "Turma D",
        "capacidadeMaximaAlunos": 35,
        "finalizada": false,
        "professor_Id": 30,
        "professor": "Angelica",
        "corLegenda": "#ff00ff",
        "observacao": "",
        "deactivated": undefined,
        "reposicaoDe_Aula_Id": undefined,
        "sala_Id": 0,
        "perfilCognitivo": []
    },
    {
        "alunos": [],
        "aula_Id": -1,
        "data": new Date("2025-03-04T10:00:00"),
        "turma_Id": 37,
        "turma": "Turma B",
        "descricao": "Turma B",
        "capacidadeMaximaAlunos": 12,
        "finalizada": false,
        "professor_Id": 31,
        "professor": "Maria",
        "corLegenda": "#6B5FA0",
        "observacao": "",
        "deactivated": undefined,
        "reposicaoDe_Aula_Id": undefined,
        "sala_Id": 0,
        "perfilCognitivo": []
    },
    {
        "alunos": [
           
            {
                "id": 8,
                "aluno_Id": 1141,
                "checklists": [],
                "aula_Id": 24,
                "aluno": "Susana (Susy) Jugend",
                "aluno_Foto": "",
                "turma_Id": 38,
                "turma": "Turma C",
                "reposicaoDe_Aula_Id": undefined,
                "presente": undefined,
                "apostila_Kit_Id": undefined,
                "kit": undefined,
                "apostila_Abaco": undefined,
                "apostila_Abaco_Id": undefined,
                "apostila_AH": undefined,
                "apostila_AH_Id": undefined,
                "numeroPaginaAbaco": undefined,
                "numeroPaginaAH": undefined,
                "observacao": undefined,
                "flagAlunoNovo": false,
                "perfilCognitivo": perfisCognitivos[0].nome,
                "perfilCognitivo_Id": perfisCognitivos[0].id,
            }
        ],
        "aula_Id": -1,
        "data": new Date("2025-03-04T08:00:00"),
        "turma_Id": 38,
        "turma": "Turma C",
        "descricao": "Turma C",
        "capacidadeMaximaAlunos": 12,
        "finalizada": false,
        "professor_Id": 30,
        "professor": "Angelica",
        "corLegenda": "#ff00ff",
        "observacao": "",
        "deactivated": undefined,
        "reposicaoDe_Aula_Id": undefined,
        "sala_Id": 0,
        "perfilCognitivo": []
    },
    {
        "alunos": [],
        "aula_Id": -1,
        "data": new Date("2025-03-04T10:00:00"),
        "turma_Id": 39,
        "turma": "Turma Z",
        "descricao": "Turma Z",
        "capacidadeMaximaAlunos": 12,
        "finalizada": false,
        "professor_Id": 30,
        "professor": "Angelica",
        "corLegenda": "#ff00ff",
        "observacao": "",
        "deactivated": undefined,
        "reposicaoDe_Aula_Id": undefined,
        "sala_Id": 0,
        "perfilCognitivo": []
    },
    {
        "alunos": [
            {
                "id": 1,
                "aluno_Id": 1173,
                "checklists": [],
                "aula_Id": 28,
                "aluno": "Norma Hochgreb",
                "aluno_Foto": "",
                "turma_Id": 40,
                "turma": "Turma E",
                "reposicaoDe_Aula_Id": undefined,
                "presente": undefined,
                "apostila_Kit_Id": undefined,
                "kit": undefined,
                "apostila_Abaco": undefined,
                "apostila_Abaco_Id": undefined,
                "apostila_AH": undefined,
                "apostila_AH_Id": undefined,
                "numeroPaginaAbaco": undefined,
                "numeroPaginaAH": undefined,
                "observacao": undefined,
                "flagAlunoNovo": false,
                "perfilCognitivo": perfisCognitivos[0].nome,
                "perfilCognitivo_Id": perfisCognitivos[0].id,
            },
            {
                "id": 2,
                "aluno_Id": 1174,
                "checklists": [],
                "aula_Id": 28,
                "aluno": "Danniel Gomes Almeida",
                "aluno_Foto": "",
                "turma_Id": 40,
                "turma": "Turma E",
                "reposicaoDe_Aula_Id": undefined,
                "presente": undefined,
                "apostila_Kit_Id": undefined,
                "kit": undefined,
                "apostila_Abaco": undefined,
                "apostila_Abaco_Id": undefined,
                "apostila_AH": undefined,
                "apostila_AH_Id": undefined,
                "numeroPaginaAbaco": undefined,
                "numeroPaginaAH": undefined,
                "observacao": undefined,
                "flagAlunoNovo": false,
                "perfilCognitivo": perfisCognitivos[0].nome,
                "perfilCognitivo_Id": perfisCognitivos[0].id,
            },
            {
                "id": 4,
                "aluno_Id": 1175,
                "checklists": [],
                "aula_Id": 29,
                "aluno": "Vera Garcia Leoni de Cerqueira",
                "aluno_Foto": "",
                "turma_Id": 40,
                "turma": "Turma E",
                "reposicaoDe_Aula_Id": 28,
                "presente": undefined,
                "apostila_Kit_Id": 7,
                "kit": undefined,
                "apostila_Abaco": undefined,
                "apostila_Abaco_Id": undefined,
                "apostila_AH": undefined,
                "apostila_AH_Id": undefined,
                "numeroPaginaAbaco": undefined,
                "numeroPaginaAH": undefined,
                "observacao": undefined,
                "flagAlunoNovo": false,
                "perfilCognitivo": perfisCognitivos[0].nome,
                "perfilCognitivo_Id": perfisCognitivos[0].id,
            },
            {
                "id": 10,
                "aluno_Id": 1176,
                "checklists": [],
                "aula_Id": 28,
                "aluno": "Manoel Fernando Anastacio",
                "aluno_Foto": "",
                "turma_Id": 40,
                "turma": "Turma E",
                "reposicaoDe_Aula_Id": undefined,
                "presente": undefined,
                "apostila_Kit_Id": 7,
                "kit": undefined,
                "apostila_Abaco": undefined,
                "apostila_Abaco_Id": undefined,
                "apostila_AH": undefined,
                "apostila_AH_Id": undefined,
                "numeroPaginaAbaco": undefined,
                "numeroPaginaAH": undefined,
                "observacao": undefined,
                "flagAlunoNovo": false,
                "perfilCognitivo": perfisCognitivos[0].nome,
                "perfilCognitivo_Id": perfisCognitivos[0].id,
            },
            {
                "id": 11,
                "aluno_Id": 1177,
                "checklists": [],
                "aula_Id": 28,
                "aluno": "Gabriel Bardella",
                "aluno_Foto": "",
                "turma_Id": 40,
                "turma": "Turma E",
                "reposicaoDe_Aula_Id": undefined,
                "presente": undefined,
                "apostila_Kit_Id": 7,
                "kit": undefined,
                "apostila_Abaco": undefined,
                "apostila_Abaco_Id": undefined,
                "apostila_AH": undefined,
                "apostila_AH_Id": undefined,
                "numeroPaginaAbaco": undefined,
                "numeroPaginaAH": undefined,
                "observacao": undefined,
                "flagAlunoNovo": false,
                "perfilCognitivo": perfisCognitivos[0].nome,
                "perfilCognitivo_Id": perfisCognitivos[0].id,
            },
         
        ],
        "aula_Id": -1,
        "data": new Date("2025-03-04T14:00:00"),
        "turma_Id": 40,
        "turma": "Turma E",
        "descricao": "Turma E",
        "capacidadeMaximaAlunos": 25,
        "finalizada": false,
        "professor_Id": 30,
        "professor": "Angelica",
        "corLegenda": "#ff00ff",
        "observacao": "",
        "deactivated": undefined,
        "reposicaoDe_Aula_Id": undefined,
        "sala_Id": 0,
        perfilCognitivo: []
    }
]


export var loadingEvents: any[] = [
    {
        "id": "1LEbK",
        "backgroundColor": "transparent",
        "borderColor": "transparent",
        "start": "2025-02-17T13:00:00.000Z",
        "end": "2025-02-17T15:00:00.000Z",
    },
    {
        "id": "3dXsT",
        "backgroundColor": "transparent",
        "borderColor": "transparent",
        "start": "2025-02-17T11:00:00.000Z",
        "end": "2025-02-17T13:00:00.000Z",

    },
    {
        "id": "Bg3fV",
        "backgroundColor": "transparent",
        "borderColor": "transparent",
        "start": "2025-02-17T15:00:00.000Z",
        "end": "2025-02-17T17:00:00.000Z",

    },
    {
        "id": "KhqDY",
        "backgroundColor": "transparent",
        "borderColor": "transparent",
        "start": "2025-02-18T13:00:00.000Z",
        "end": "2025-02-18T15:00:00.000Z",
    },
    {
        "id": "Yslby",
        "backgroundColor": "transparent",
        "borderColor": "transparent",
        "start": "2025-02-18T11:00:00.000Z",
        "end": "2025-02-18T13:00:00.000Z",
    },
    {
        "id": "Dhyza",
        "backgroundColor": "transparent",
        "borderColor": "transparent",
        "start": "2025-02-18T16:00:00.000Z",
        "end": "2025-02-18T18:00:00.000Z",

    },
    {
        "id": "uRtob",
        "backgroundColor": "transparent",
        "borderColor": "transparent",
        "start": "2025-02-19T13:00:00.000Z",
        "end": "2025-02-19T15:00:00.000Z",

    },
    {
        "id": "Uk0Rc",
        "backgroundColor": "transparent",
        "borderColor": "transparent",
        "start": "2025-02-19T16:00:00.000Z",
        "end": "2025-02-19T18:00:00.000Z",

    },
    {
        "id": "U3pQX",
        "backgroundColor": "transparent",
        "borderColor": "transparent",
        "start": "2025-02-19T15:00:00.000Z",
        "end": "2025-02-19T17:00:00.000Z",
    },
    {
        "id": "qFpGu",
        "backgroundColor": "transparent",
        "borderColor": "transparent",
        "start": "2025-02-20T13:00:00.000Z",
        "end": "2025-02-20T15:00:00.000Z",
    },
    {
        "id": "9agrb",
        "backgroundColor": "transparent",
        "borderColor": "transparent",
        "start": "2025-02-20T19:00:00.000Z",
        "end": "2025-02-20T21:00:00.000Z",
    },
    {
        "id": "jan83",
        "backgroundColor": "transparent",
        "borderColor": "transparent",
        "start": "2025-02-21T13:00:00.000Z",
        "end": "2025-02-21T15:00:00.000Z",
    },
    {
        "id": "JAMBg",
        "backgroundColor": "transparent",
        "borderColor": "transparent",
        "start": "2025-02-21T16:00:00.000Z",
        "end": "2025-02-21T18:00:00.000Z",
    },
    {
        "id": "dSyHx",
        "backgroundColor": "transparent",
        "borderColor": "transparent",
        "start": "2025-02-21T16:00:00.000Z",
        "end": "2025-02-21T18:00:00.000Z",
    },

]