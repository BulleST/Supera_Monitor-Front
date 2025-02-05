import { Basic, Basic_List } from "./_basic.model";
import { Professor } from "./professor.model";

export class Aulas extends Basic { }

export class Aluno_Aula {
    id: number = 0;
    nome: string = '';
    flagNovo?: boolean = false;
    flagReposicao?: boolean = false;
    apostila: string = '';
    pagina: number = undefined as unknown as number;
    presente?: boolean;
    foto?: string = '';
    email?: string = '';
    endereco?: string = '';
    telefone?: string = '';
    celular?: string = '';
    rg?: string = '';
    cpf?: string = '';
    turma?: string = '';
    dataNascimento?: Date = new Date;
}

export class Aulas_List {
    id: number = 0;
    turma: string = '';
    capacidadeMaxima: number = 0;
    professor: { nome: string, color: string, id: number } = { nome: '', color: '', id: 0 }
    dataInicio: Date = new Date;
    dataFim: Date = new Date;
    alunos: Aluno_Aula[] = [];
}

export class Calendario {
    id: number = 0;
    professor: string = '';
    color: string = '';
    aulas: Aulas_List[] = [];
}

var hoje = new Date();
var ontem = new Date(hoje.getTime() - 24 * 60 * 60 * 1000);
var amanha = new Date(hoje.getTime() + 24 * 60 * 60 * 1000);
var data2 = new Date(hoje.getTime() + (24 * 60 * 60 * 1000 * 2));
var data3 = new Date(hoje.getTime() + (24 * 60 * 60 * 1000 * 3));
var data4 = new Date(hoje.getTime() + (24 * 60 * 60 * 1000 * 4));

var alunos: Aluno_Aula[] = [
    { id: 0, nome: 'Aluno A', apostila: 'Apostila A', pagina: 1, turma: 'Turma A', dataNascimento: new Date(), },
    { id: 0, nome: 'Aluno B', apostila: 'Apostila B', pagina: 1, turma: 'Turma A', dataNascimento: new Date(),  foto: 'https://framerusercontent.com/images/whuZsGVFne3l5eaTvrcddk99qyc.jpeg?q=100&fm=auto' },
    { id: 0, nome: 'Aluno C', apostila: 'Apostila C', pagina: 1, turma: 'Turma A', dataNascimento: new Date(),  flagReposicao: true, foto: 'https://framerusercontent.com/images/whuZsGVFne3l5eaTvrcddk99qyc.jpeg?q=100&fm=auto' },
    { id: 0, nome: 'Aluno D', apostila: 'Apostila D', pagina: 1, turma: 'Turma A', dataNascimento: new Date(),  foto: 'https://framerusercontent.com/images/whuZsGVFne3l5eaTvrcddk99qyc.jpeg?q=100&fm=auto' },
    { id: 0, nome: 'Aluno E', apostila: 'Apostila E', pagina: 1, turma: 'Turma A', dataNascimento: new Date(),  foto: 'https://framerusercontent.com/images/whuZsGVFne3l5eaTvrcddk99qyc.jpeg?q=100&fm=auto' },
    { id: 0, nome: 'Aluno F', apostila: 'Apostila F', pagina: 1, turma: 'Turma A', dataNascimento: new Date(),  foto: 'https://framerusercontent.com/images/whuZsGVFne3l5eaTvrcddk99qyc.jpeg?q=100&fm=auto' },
    { id: 0, nome: 'Aluno G', apostila: 'Apostila G', pagina: 1, turma: 'Turma A', dataNascimento: new Date(),  flagNovo: true },
]
export var aulas: Calendario[] = [
    {
        id: 1,
        professor: 'Antônio',
        color: 'orange',
        aulas: [
            {
                id: 2,
                turma: 'Turma A',
                dataInicio: new Date(hoje.toISOString().substring(0, 10) + 'T10:00:00'),
                dataFim: new Date(hoje.toISOString().substring(0, 10) + 'T10:00:00'),
                capacidadeMaxima: 5,
                professor: {
                    id: 1,
                    nome: 'Antônio',
                    color: 'orange',
                },
                alunos: alunos,
            },
            {
                id: 3,
                turma: 'Turma B',
                dataInicio: new Date(ontem.toISOString().substring(0, 10) + 'T11:00:00'),
                dataFim: new Date(ontem.toISOString().substring(0, 10) + 'T11:00:00'),
                capacidadeMaxima: 10,
                professor: {
                    id: 1,
                    nome: 'Antônio',
                    color: 'orange',
                },
                alunos: alunos,
            },
            {
                id: 4,
                turma: 'Turma C',
                dataInicio: new Date(amanha.toISOString().substring(0, 10) + 'T12:00:00'),
                dataFim: new Date(amanha.toISOString().substring(0, 10) + 'T12:00:00'),
                capacidadeMaxima: 10,
                professor: {
                    id: 1,
                    nome: 'Antônio',
                    color: 'orange',
                },
                alunos: alunos,
            },
            {
                id: 5,
                turma: 'Turma D',
                dataInicio: new Date(data2.toISOString().substring(0, 10) + 'T11:00:00'),
                dataFim: new Date(data2.toISOString().substring(0, 10) + 'T11:00:00'),
                capacidadeMaxima: 10,
                professor: {
                    id: 1,
                    nome: 'Antônio',
                    color: 'orange',
                },
                alunos: alunos,
            },
            {
                id: 6,
                turma: 'Turma E',
                dataInicio: new Date(data3.toISOString().substring(0, 10) + 'T15:00:00'),
                dataFim: new Date(data3.toISOString().substring(0, 10) + 'T15:00:00'),
                capacidadeMaxima: 10,
                professor: {
                    id: 1,
                    nome: 'Antônio',
                    color: 'orange',
                },
                alunos: alunos,
            },
            {
                id: 7,
                turma: 'Turma F',
                dataInicio: new Date(data4.toISOString().substring(0, 10) + 'T16:00:00'),
                dataFim: new Date(data4.toISOString().substring(0, 10) + 'T16:00:00'),
                capacidadeMaxima: 10,
                professor: {
                    id: 1,
                    nome: 'Antônio',
                    color: 'orange',
                },
                alunos: alunos,
            },
        ]
    },
    {
        id: 1,
        professor: 'Mariana',
        color: 'cornflowerblue',
        aulas: [
            {
                id: 8,
                turma: 'Turma G',
                dataInicio: new Date(hoje.toISOString().substring(0, 10) + 'T13:00:00'),
                dataFim: new Date(hoje.toISOString().substring(0, 10) + 'T13:00:00'),
                capacidadeMaxima: 10,
                professor: {
                    id: 1,
                    nome: 'Mariana',
                    color: 'cornflowerblue',
                },
                alunos: alunos,
            },
            {
                id: 9,
                turma: 'Turma H',
                dataInicio: new Date(ontem.toISOString().substring(0, 10) + 'T08:00:00'),
                dataFim: new Date(ontem.toISOString().substring(0, 10) + 'T08:00:00'),
                capacidadeMaxima: 10,
                professor: {
                    id: 1,
                    nome: 'Mariana',
                    color: 'cornflowerblue',
                },
                alunos: alunos,
            },
            {
                id: 10,
                turma: 'Turma I',
                dataInicio: new Date(amanha.toISOString().substring(0, 10) + 'T08:00:00'),
                dataFim: new Date(amanha.toISOString().substring(0, 10) + 'T08:00:00'),
                capacidadeMaxima: 10,
                professor: {
                    id: 1,
                    nome: 'Mariana',
                    color: 'cornflowerblue',
                },
                alunos: alunos,
            },
            {
                id: 11,
                turma: 'Turma J',
                dataInicio: new Date(data2.toISOString().substring(0, 10) + 'T10:00:00'),
                dataFim: new Date(data2.toISOString().substring(0, 10) + 'T10:00:00'),
                capacidadeMaxima: 10,
                professor: {
                    id: 1,
                    nome: 'Mariana',
                    color: 'cornflowerblue',
                },
                alunos: alunos,
            },
            {
                id: 12,
                turma: 'Turma K',
                dataInicio: new Date(data3.toISOString().substring(0, 10) + 'T09:00:00'),
                dataFim: new Date(data3.toISOString().substring(0, 10) + 'T09:00:00'),
                capacidadeMaxima: 10,
                professor: {
                    id: 1,
                    nome: 'Mariana',
                    color: 'cornflowerblue',
                },
                alunos: alunos,
            },
            {
                id: 13,
                turma: 'Turma L',
                dataInicio: new Date(data4.toISOString().substring(0, 10) + 'T12:00:00'),
                dataFim: new Date(data4.toISOString().substring(0, 10) + 'T12:00:00'),
                capacidadeMaxima: 10,
                professor: {
                    id: 1,
                    nome: 'Mariana',
                    color: 'cornflowerblue',
                },
                alunos: alunos,
            }
        ]
    },
    {
        id: 1,
        professor: 'Ezequiel',
        color: 'purple',
        aulas: [
            {
                id: 14,
                turma: 'Turma M',
                dataInicio: new Date(hoje.toISOString().substring(0, 10) + 'T10:30:00'),
                dataFim: new Date(hoje.toISOString().substring(0, 10) + 'T10:30:00'),
                capacidadeMaxima: 10,
                professor: {
                    id: 1,
                    nome: 'Ezequiel',
                    color: 'purple',
                },
                alunos: alunos,
            },
            {
                id: 15,
                turma: 'Turma N',
                dataInicio: new Date(ontem.toISOString().substring(0, 10) + 'T13:00:00'),
                dataFim: new Date(ontem.toISOString().substring(0, 10) + 'T13:00:00'),
                capacidadeMaxima: 10,
                professor: {
                    id: 1,
                    nome: 'Ezequiel',
                    color: 'purple',
                },
                alunos: alunos,
            },
            {
                id: 16,
                turma: 'Turma O',
                dataInicio: new Date(amanha.toISOString().substring(0, 10) + 'T14:00:00'),
                dataFim: new Date(amanha.toISOString().substring(0, 10) + 'T14:00:00'),
                capacidadeMaxima: 10,
                professor: {
                    id: 1,
                    nome: 'Ezequiel',
                    color: 'purple',
                },
                alunos: alunos,
            },
            {
                id: 17,
                turma: 'Turma P',
                dataInicio: new Date(data2.toISOString().substring(0, 10) + 'T9:00:00'),
                dataFim: new Date(data2.toISOString().substring(0, 10) + 'T9:00:00'),
                capacidadeMaxima: 10,
                professor: {
                    id: 1,
                    nome: 'Ezequiel',
                    color: 'purple',
                },
                alunos: alunos,
            },
            {
                id: 18,
                turma: 'Turma O',
                dataInicio: new Date(data3.toISOString().substring(0, 10) + 'T11:00:00'),
                dataFim: new Date(data3.toISOString().substring(0, 10) + 'T11:00:00'),
                capacidadeMaxima: 10,
                professor: {
                    id: 1,
                    nome: 'Ezequiel',
                    color: 'purple',
                },
                alunos: alunos,
            },
            {
                id: 18,
                turma: 'Turma Q',
                dataInicio: new Date(data4.toISOString().substring(0, 10) + 'T17:00:00'),
                dataFim: new Date(data4.toISOString().substring(0, 10) + 'T17:00:00'),
                capacidadeMaxima: 10,
                professor: {
                    id: 1,
                    nome: 'Ezequiel',
                    color: 'purple',
                },
                alunos: alunos,
            }
        ]
    },
]