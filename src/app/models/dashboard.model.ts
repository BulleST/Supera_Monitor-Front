import { Evento_Participacao_Aluno } from "./evento-participacao-aluno.model";
import { Evento } from "./evento.model";
import { Roteiro } from "./roteiro.model";

export class Dashboard {
    show: boolean = false;
    aluno_Id: number = 0;
    roteiro_Id: number = 0;
    primeiraAula: boolean = false;
    aula: Evento = new Evento;
    participacao: Evento_Participacao_Aluno = new Evento_Participacao_Aluno;
}

// export class Dashboard_Aulas { 
//     id: number = 0; 
//     show: boolean = true;
//     aluno_Id: number = 0; 
//     aluno: string = ''; 
//     celular?: string;
//     checklist?: string;
//     checklist_Id?: number;
//     evento_Id: number = 0; 
//     evento_Tipo_Id: number = 0; 
//     data: Date = new Date; 
//     descricao: string = ''; 
//     numeroSala: string = ''; 
//     andar: number = 0 
//     sala_Id: number = 0; 
//     duracaoMinutos: number = 0; 
//     capacidadeMaximaAlunos: number = 0; 
//     finalizado?: boolean;
//     roteiro_Id: number = 0; 
//     turma?: string = ''; 
//     turma_Id?: number = 0; 
//     professor: string = ''; 
//     professor_Id: number = 0; 
//     corLegenda: string = ''; 
//     reposicaoDe_Evento_Id?: number = 0; 
//     reagendamentoDe_Evento_Id?: number = 0; 
//     presente?: boolean;
//     numeroPaginaAbaco?: number = 0
//     numeroPaginaAH?: number = 0
//     apostila_Abaco?: string = ''; 
//     apostila_AH?: string = ''; 
//     apostila_Abaco_Id?: number = 0; 
//     apostila_AH_Id?: number = 0; 
//     observacao: string = ''; 
// }
export class Dashboard_Mes {
    mes: number = 0;
    mesString: string = '';
    roteiros: Roteiro[] = [];
}

// export class Evento_Roteiro {
//     id: number = 0;
//     semana: number = 0;
//     tema: string = '';
//     dataInicio: Date = new Date;
//     dataFim: Date = new Date;
//     corLegenda: string = '';
//     account_Created_Id: number = 0;
//     account_Created: string = '';
//     created: Date = new Date;
//     lastUpdated?: Date;
//     deactivated?: Date;
//     aulas: CalendarioParticipacaoAluno[] = []
// }
