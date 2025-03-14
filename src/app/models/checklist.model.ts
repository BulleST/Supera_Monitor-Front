// import { Aluno_Aula, alunos } from "./aulas.model";

export interface Checklist {
    id: number;
    nome: string;
    items: Checklist_Item[];
    ordem: number;
}

export interface Checklist_Item {
    id: number;
    checklist_Id: number;
    nome: string;
    ordem: number;
    alunos: Aluno_CheckList_Item[];
}

export interface Aluno_CheckList_Item {
    id: number;
    aluno_Id: number;
    nome: string;
    prazo: Date;
    finalizado: boolean;
    dataFinalizacao?: Date;
    account_Finalizacao_Id?: number;
    account_Finalizacao?: string;
    checklist_Id: number;
    checklist_Item_Id: number;
    ordem: number;
}


var id = 1;
export var checklists: Checklist[] = [
    {
        id: id++,
        nome: 'Aula zero',
        ordem: 0,
        items: [
            {
                checklist_Id: id,
                id: id++,
                nome: 'Inclusão no grupo da turma',
                ordem: 0,
                alunos: [],
            },
            {
                checklist_Id: id,
                id: id++,
                nome: 'Inclusão no grupo informativos',
                ordem: 0,
                alunos: [],
               },
        ]
    },
    {
        id: id++,
        nome: '1ª Semana',
        ordem: 0,
        items: [
            {
                checklist_Id: id,
                id: id++,
                nome: 'Comparecimento na 1ª Aula',
                ordem: 0,
                alunos: [],
            },
            {
                checklist_Id: id,
                id: id++,
                nome: 'Entrega do selo',
                ordem: 0,
                alunos: [],
               },
            {
                checklist_Id: id,
                id: id++,
                nome: 'Apresentação da ficha de progresso',
                ordem: 0,
                alunos: [],
            },
            {
                checklist_Id: id,
                id: id++,
                nome: 'Orientação sobre as tarefas de casa',
                ordem: 0,
                alunos: [],
               },
            {
                checklist_Id: id,
                id: id++,
                nome: 'Classificação do perfil do aluno',
                ordem: 0,
                alunos: [],
            },
            {
                checklist_Id: id,
                id: id++,
                nome: 'Apresentação do diretor fraqueado',
                ordem: 0,
                alunos: [],
               },
        ]
    },
    {
        id: id++,
        nome: '2ª Semana',
        ordem: 0,
        items: [
            {
                checklist_Id: id,
                id: id++,
                nome: 'Confirmação da adequação do aluno ao perfil da turma',
                ordem: 0,
                alunos: [],
            },
            {
                checklist_Id: id,
                id: id++,
                nome: 'Verificação das tarefas semanais',
                ordem: 0,
                alunos: [],
               },
            {
                checklist_Id: id,
                id: id++,
                nome: 'Verificar realização dos desafios semanais',
                ordem: 0,
                alunos: [],
            },
        ]
    },
    {
        
        id: id++,
        nome: '3ª Semana',
        ordem: 0,
        items: [
            {
                checklist_Id: id,
                id: id++,
                nome: 'Agendar 1ª Oficina.',
                ordem: 0,
                alunos: [],
            },
            {
                checklist_Id: id,
                id: id++,
                nome: 'Feedback pós-venda',
                ordem: 0,
                alunos: [],
               },
        ]
    },
    {
        id: id++,
        nome: '4ª Semana',
        ordem: 0,
        items: [
            {
                checklist_Id: id,
                id: id++,
                nome: 'Verificar totalidade do monitoramento ',
                ordem: 0,
                alunos: [],
            },
            {
                checklist_Id: id,
                id: id++,
                nome: 'Recolher do A.H. para correção',
                ordem: 0,
                alunos: [],
               },
        ]
    },
    {
        id: id++,
        nome: '5ª Semana',
        ordem: 0,
        items: [
            {
                checklist_Id: id,
                id: id++,
                nome: 'Devolver o A.H. para o aluno.',
                ordem: 0,
                alunos: [],
            },
            {
                checklist_Id: id,
                id: id++,
                nome: 'Verificar constância das tarefas semanais',
                ordem: 0,
                alunos: [],
            },
            {
                checklist_Id: id,
                id: id++,
                nome: 'Verificar constância nos desafios semanais',
                ordem: 0,
                alunos: [],
            },
        ]
    },
    {
        id: id++,
        nome: '6ª Semana',
        ordem: 0,
        items: [
            {
                checklist_Id: id,
                id: id++,
                nome: 'Verificar totalidade do monitoramento',
                ordem: 0,
                alunos: [],
            },
            {
                checklist_Id: id,
                id: id++,
                nome: 'Verificar constância no sensorial',
                ordem: 0,
                alunos: [],
               },
            {
                checklist_Id: id,
                id: id++,
                nome: 'Pesquisa de clima e imagem',
                ordem: 0,
                alunos: [],
            },
        ]
    },
    {
        id: id++,
        nome: '7ª Semana',
        ordem: 0,
        items: [
            {
                checklist_Id: id,
                id: id++,
                nome: 'Agendar Superação',
                ordem: 0,
                alunos: [],
            },
            {
                checklist_Id: id,
                id: id++,
                nome: 'Agendar 2ª Oficina',
                ordem: 0,
                alunos: [],
               },
        ]
    },
    {
        id: id++,
        nome: '8ª Semana',
        ordem: 0,
        items: [
            {
                checklist_Id: id,
                id: id++,
                nome: 'Recolher o A.H. para correção.',
                ordem: 0,
                alunos: [],
            },
        ]
    },
    {
        id: id++,
        nome: '9ª Semana',
        ordem: 0,
        items: [
            {
                checklist_Id: id,
                id: id++,
                nome: 'Devolver o A.H. para o aluno.',
                ordem: 0,
                alunos: [],
            },
            {
                checklist_Id: id,
                id: id++,
                nome: 'Verificar desafios da semana',
                ordem: 0,
                alunos: [],
               },
            {
                checklist_Id: id,
                id: id++,
                nome: 'Verificar totalidade do monitoramento.',
                ordem: 0,
                alunos: [],
            },
        ]
    },
    {
        id: id++,
        nome: '10ª Semana',
        ordem: 0,
        items: [
            {
                checklist_Id: id,
                id: id++,
                nome: 'Feedback Informal: alinhamento de expectativas',
                ordem: 0,
                alunos: [],
            },
        ]
    },
    {
        id: id++,
        nome: '11ª Semana',
        ordem: 0,
        items: [
            {
                checklist_Id: id,
                id: id++,
                nome: 'Agendar Superação. ',
                ordem: 0,
                alunos: [],
            },
        ]
    },
    {
        id: id++,
        nome: '12ª Semana',
        ordem: 0,
        items: [
            {
                checklist_Id: id,
                id: id++,
                nome: 'Verificar se todos os itens estão realizados.',
                ordem: 0,
                alunos: [],
            },
        ]
    },
];

