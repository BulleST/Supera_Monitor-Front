import { EventSourceInput } from "@fullcalendar/core";

export class CalendarioRequest {
    intervaloDe?: Date;
    intervaloAte?: Date;
    turma_Id?: number;
    professor_Id?: number;
    aluno_Id?: number;
    turma_Tipo_Id?: number;
}

export class CalendarioList {
    aula_Id?: number;
    data: Date = new Date;
    turma_Id: number = 0;
    turma: string = '';
    capacidadeMaximaAlunos: number = 0;
    professor_Id: number = 0;
    professor: string = '';
    corLegenda: string = '';
    observacao?: string = '';
    turma_Tipo: string = '';
    turma_Tipo_Id: number = 0;
    finalizada: boolean = false;
    alunos: CalendarioAlunoList[] = [];
}

export class CalendarioAlunoList {
    id?: number;
    aula_Id?: number;
    reposicao: boolean = false;
    presente: boolean = false;

    aluno_Id: number = 0;
    aluno: string = '';
    aluno_Foto: string = '';
    
    turma_Id: number = 0;
    turma: string = '';
    
    apostila_Abaco_Id?: number;
    apostila_AH_Id?: number;
    
    apostila_Abaco?: string;
    apostila_AH?: string;
    
    numeroPaginaAH?: number;
    numeroPaginaAbaco?: number;
    
    apostila_Abaco_Kit_Id?: number;
    apostila_AH_Kit_Id?: number;
    
    kit?: string;
    apostila_Kit_Id?: number;
    
    flagAlunoNovo: boolean = false;
    loadingFoto: boolean = false;
}


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
    }
]