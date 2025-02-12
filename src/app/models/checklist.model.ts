// import { Aluno_Aula, alunos } from "./aulas.model";

export interface Checklist {
    id: number;
    nome: string;
    items: Checklist_Item[];
}

export interface Checklist_Item {
    id: number;
    checklist_Id: number;
    nome: string;
    alunos: Aluno_CheckList[];
}

export interface Aluno_CheckList {
    id: number;
    aluno: any; // Aluno_Aula;
    status: string;
}

var status = [
    'Pendente',
    'Em Andamento'
]
function getStatus() { // min and max included 
    let min = 0
    let max = 1
    var ram = Math.floor(Math.random() * (max - min + 1) + min);
    return status[ram]
}
var id = 1;
export var checklists: Checklist[] = [
    {
        id: id++,
        nome: 'Pós aula zero',
        items: [
            {
                checklist_Id: id,
                id: id++,
                nome: 'Inclusão no grupo da turma',
                alunos: [
                    // { id: id++, aluno: alunos[0], status: getStatus() },
                    // { id: id++, aluno: alunos[2], status: getStatus() },
                    // { id: id++, aluno: alunos[4], status: getStatus() },
                    // { id: id++, aluno: alunos[6], status: getStatus() },
                ]
            },
            {
                checklist_Id: id,
                id: id++,
                nome: 'Inclusão no grupo informativos',
                alunos: [
                    // { id: id++, aluno: alunos[0+1], status: getStatus() },
                    // { id: id++, aluno: alunos[2+1], status: getStatus() },
                    // { id: id++, aluno: alunos[4+1], status: getStatus() },
                ]
            },
        ]
    },
    {
        id: id++,
        nome: '1ª Semana',
        items: [
            {
                checklist_Id: id,
                id: id++,
                nome: 'Comparecimento na 1ª Aula',
                alunos: [
                    // { id: id++, aluno: alunos[0], status: getStatus() },
                    // { id: id++, aluno: alunos[2], status: getStatus() },
                    // { id: id++, aluno: alunos[4], status: getStatus() },
                    // { id: id++, aluno: alunos[6], status: getStatus() },
                ]
            },
            {
                checklist_Id: id,
                id: id++,
                nome: 'Entrega do selo',
                alunos: [
                    // { id: id++, aluno: alunos[0+1], status: getStatus() },
                    // { id: id++, aluno: alunos[2+1], status: getStatus() },
                    // { id: id++, aluno: alunos[4+1], status: getStatus() },
                ]
            },
            {
                checklist_Id: id,
                id: id++,
                nome: 'Apresentação da ficha de progresso',
                alunos: [
                    // { id: id++, aluno: alunos[0], status: getStatus() },
                    // { id: id++, aluno: alunos[2], status: getStatus() },
                    // { id: id++, aluno: alunos[4], status: getStatus() },
                    // { id: id++, aluno: alunos[6], status: getStatus() },
                ]
            },
            {
                checklist_Id: id,
                id: id++,
                nome: 'Orientação sobre as tarefas de casa',
                alunos: [
                    // { id: id++, aluno: alunos[0+1], status: getStatus() },
                    // { id: id++, aluno: alunos[2+1], status: getStatus() },
                    // { id: id++, aluno: alunos[4+1], status: getStatus() },
                ]
            },
            {
                checklist_Id: id,
                id: id++,
                nome: 'Classificação do perfil do aluno',
                alunos: [
                    // { id: id++, aluno: alunos[0], status: getStatus() },
                    // { id: id++, aluno: alunos[2], status: getStatus() },
                    // { id: id++, aluno: alunos[4], status: getStatus() },
                    // { id: id++, aluno: alunos[6], status: getStatus() },
                ]
            },
            {
                checklist_Id: id,
                id: id++,
                nome: 'Apresentação do diretor fraqueado',
                alunos: [
                    // { id: id++, aluno: alunos[0+1], status: getStatus() },
                    // { id: id++, aluno: alunos[2+1], status: getStatus() },
                    // { id: id++, aluno: alunos[4+1], status: getStatus() },
                ]
            },
        ]
    },
    {
        id: id++,
        nome: '2ª Semana',
        items: [
            {
                checklist_Id: id,
                id: id++,
                nome: 'Confirmação da adequação do aluno ao perfil da turma',
                alunos: [
                    // { id: id++, aluno: alunos[0], status: getStatus() },
                    // { id: id++, aluno: alunos[2], status: getStatus() },
                    // { id: id++, aluno: alunos[4], status: getStatus() },
                    // { id: id++, aluno: alunos[6], status: getStatus() },
                ]
            },
            {
                checklist_Id: id,
                id: id++,
                nome: 'Verificação das tarefas semanais',
                alunos: [
                    // { id: id++, aluno: alunos[0+1], status: getStatus() },
                    // { id: id++, aluno: alunos[2+1], status: getStatus() },
                    // { id: id++, aluno: alunos[4+1], status: getStatus() },
                ]
            },
            {
                checklist_Id: id,
                id: id++,
                nome: 'Verificar realização dos desafios semanais',
                alunos: [
                    // { id: id++, aluno: alunos[0], status: getStatus() },
                    // { id: id++, aluno: alunos[2], status: getStatus() },
                    // { id: id++, aluno: alunos[4], status: getStatus() },
                    // { id: id++, aluno: alunos[6], status: getStatus() },
                ]
            },
        ]
    },
    {
        id: id++,
        nome: '3ª Semana',
        items: [
            {
                checklist_Id: id,
                id: id++,
                nome: 'Agendar 1ª Oficina.',
                alunos: [
                    // { id: id++, aluno: alunos[0], status: getStatus() },
                    // { id: id++, aluno: alunos[2], status: getStatus() },
                    // { id: id++, aluno: alunos[4], status: getStatus() },
                    // { id: id++, aluno: alunos[6], status: getStatus() },
                ]
            },
            {
                checklist_Id: id,
                id: id++,
                nome: 'Feedback pós-venda',
                alunos: [
                    // { id: id++, aluno: alunos[0+1], status: getStatus() },
                    // { id: id++, aluno: alunos[2+1], status: getStatus() },
                    // { id: id++, aluno: alunos[4+1], status: getStatus() },
                ]
            },
        ]
    },
    {
        id: id++,
        nome: '4ª Semana',
        items: [
            {
                checklist_Id: id,
                id: id++,
                nome: 'Verificar totalidade do monitoramento ',
                alunos: [
                    // { id: id++, aluno: alunos[0], status: getStatus() },
                    // { id: id++, aluno: alunos[2], status: getStatus() },
                    // { id: id++, aluno: alunos[4], status: getStatus() },
                    // { id: id++, aluno: alunos[6], status: getStatus() },
                ]
            },
            {
                checklist_Id: id,
                id: id++,
                nome: 'Recolher do A.H. para correção',
                alunos: [
                    // { id: id++, aluno: alunos[0+1], status: getStatus() },
                    // { id: id++, aluno: alunos[2+1], status: getStatus() },
                    // { id: id++, aluno: alunos[4+1], status: getStatus() },
                ]
            },
        ]
    },
    {
        id: id++,
        nome: '5ª Semana',
        items: [
            {
                checklist_Id: id,
                id: id++,
                nome: 'Devolver o A.H. para o aluno.',
                alunos: [
                    // { id: id++, aluno: alunos[0], status: getStatus() },
                    // { id: id++, aluno: alunos[2], status: getStatus() },
                    // { id: id++, aluno: alunos[4], status: getStatus() },
                    // { id: id++, aluno: alunos[6], status: getStatus() },
                ]
            },
            {
                checklist_Id: id,
                id: id++,
                nome: 'Verificar constância das tarefas semanais',
                alunos: [
                    // { id: id++, aluno: alunos[0+1], status: getStatus() },
                    // { id: id++, aluno: alunos[2+1], status: getStatus() },
                    // { id: id++, aluno: alunos[4+1], status: getStatus() },
                ]
            },
            {
                checklist_Id: id,
                id: id++,
                nome: 'Verificar constância nos desafios semanais',
                alunos: [
                    // { id: id++, aluno: alunos[0], status: getStatus() },
                    // { id: id++, aluno: alunos[2], status: getStatus() },
                    // { id: id++, aluno: alunos[4], status: getStatus() },
                    // { id: id++, aluno: alunos[6], status: getStatus() },
                ]
            },
        ]
    },
    {
        id: id++,
        nome: '6ª Semana',
        items: [
            {
                checklist_Id: id,
                id: id++,
                nome: 'Verificar totalidade do monitoramento',
                alunos: [
                    // { id: id++, aluno: alunos[0], status: getStatus() },
                    // { id: id++, aluno: alunos[2], status: getStatus() },
                    // { id: id++, aluno: alunos[4], status: getStatus() },
                    // { id: id++, aluno: alunos[6], status: getStatus() },
                ]
            },
            {
                checklist_Id: id,
                id: id++,
                nome: 'Verificar constância no sensorial',
                alunos: [
                    // { id: id++, aluno: alunos[0+1], status: getStatus() },
                    // { id: id++, aluno: alunos[2+1], status: getStatus() },
                    // { id: id++, aluno: alunos[4+1], status: getStatus() },
                ]
            },
            {
                checklist_Id: id,
                id: id++,
                nome: 'Pesquisa de clima e imagem',
                alunos: [
                    // { id: id++, aluno: alunos[0], status: getStatus() },
                    // { id: id++, aluno: alunos[2], status: getStatus() },
                    // { id: id++, aluno: alunos[4], status: getStatus() },
                    // { id: id++, aluno: alunos[6], status: getStatus() },
                ]
            },
        ]
    },
    {
        id: id++,
        nome: '7ª Semana',
        items: [
            {
                checklist_Id: id,
                id: id++,
                nome: 'Agendar Superação',
                alunos: [
                    // { id: id++, aluno: alunos[0], status: getStatus() },
                    // { id: id++, aluno: alunos[2], status: getStatus() },
                    // { id: id++, aluno: alunos[4], status: getStatus() },
                    // { id: id++, aluno: alunos[6], status: getStatus() },
                ]
            },
            {
                checklist_Id: id,
                id: id++,
                nome: 'Agendar 2ª Oficina',
                alunos: [
                    // { id: id++, aluno: alunos[0+1], status: getStatus() },
                    // { id: id++, aluno: alunos[2+1], status: getStatus() },
                    // { id: id++, aluno: alunos[4+1], status: getStatus() },
                ]
            },
        ]
    },
    {
        id: id++,
        nome: '8ª Semana',
        items: [
            {
                checklist_Id: id,
                id: id++,
                nome: 'Recolher o A.H. para correção.',
                alunos: [
                    // { id: id++, aluno: alunos[0], status: getStatus() },
                    // { id: id++, aluno: alunos[2], status: getStatus() },
                    // { id: id++, aluno: alunos[4], status: getStatus() },
                    // { id: id++, aluno: alunos[6], status: getStatus() },
                ]
            },
        ]
    },
    {
        id: id++,
        nome: '9ª Semana',
        items: [
            {
                checklist_Id: id,
                id: id++,
                nome: 'Devolver o A.H. para o aluno.',
                alunos: [
                    // { id: id++, aluno: alunos[0], status: getStatus() },
                    // { id: id++, aluno: alunos[2], status: getStatus() },
                    // { id: id++, aluno: alunos[4], status: getStatus() },
                    // { id: id++, aluno: alunos[6], status: getStatus() },
                ]
            },
            {
                checklist_Id: id,
                id: id++,
                nome: 'Verificar desafios da semana',
                alunos: [
                    // { id: id++, aluno: alunos[0+1], status: getStatus() },
                    // { id: id++, aluno: alunos[2+1], status: getStatus() },
                    // { id: id++, aluno: alunos[4+1], status: getStatus() },
                ]
            },
            {
                checklist_Id: id,
                id: id++,
                nome: 'Verificar totalidade do monitoramento.',
                alunos: [
                    // { id: id++, aluno: alunos[0], status: getStatus() },
                    // { id: id++, aluno: alunos[2], status: getStatus() },
                    // { id: id++, aluno: alunos[4], status: getStatus() },
                    // { id: id++, aluno: alunos[6], status: getStatus() },
                ]
            },
        ]
    },
    {
        id: id++,
        nome: '10ª Semana',
        items: [
            {
                checklist_Id: id,
                id: id++,
                nome: 'Feedback Informal: tenha uma conversa individualizada e específica com o aluno novo sobre sua expectativa. ',
                alunos: [
                    // { id: id++, aluno: alunos[0], status: getStatus() },
                    // { id: id++, aluno: alunos[2], status: getStatus() },
                    // { id: id++, aluno: alunos[4], status: getStatus() },
                    // { id: id++, aluno: alunos[6], status: getStatus() },
                ]
            },
        ]
    },
    {
        id: id++,
        nome: '11ª Semana',
        items: [
            {
                checklist_Id: id,
                id: id++,
                nome: 'Agendar Superação. ',
                alunos: [
                    // { id: id++, aluno: alunos[0], status: getStatus() },
                    // { id: id++, aluno: alunos[2], status: getStatus() },
                    // { id: id++, aluno: alunos[4], status: getStatus() },
                    // { id: id++, aluno: alunos[6], status: getStatus() },
                ]
            },
        ]
    },
    {
        id: id++,
        nome: '12ª Semana',
        items: [
            {
                checklist_Id: id,
                id: id++,
                nome: 'Checar se todos os itens estão realizados.',
                alunos: [
                    // { id: id++, aluno: alunos[0], status: getStatus() },
                    // { id: id++, aluno: alunos[2], status: getStatus() },
                    // { id: id++, aluno: alunos[4], status: getStatus() },
                    // { id: id++, aluno: alunos[6], status: getStatus() },
                ]
            },
        ]
    },
];

