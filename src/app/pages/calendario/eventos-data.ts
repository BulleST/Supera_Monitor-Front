import { alunoParticipacao } from "../../models/evento-participacao-aluno.model";
import { Evento, EventoTipo } from "../../models/evento.model";
import { PseudoEvento } from "../../models/reposicao.model";

// var eventId = 0;
// var alunoParticipacaoId = 0
// var alunoId = 0

var datas: Date[] = []
for (let dayOfWeek = 1; dayOfWeek < 7; dayOfWeek++) {
    var currentDay = new Date;
    var diff = dayOfWeek - currentDay.getDay();
    currentDay.setDate(currentDay.getDate() + diff);
    datas.push(currentDay);
}

var horarios = [8,15,12,16,14,9]
export var eventos: Evento[] = [];
datas.forEach((data, index) => {
    data.setHours(horarios[index], 0,0)
    // eventos.push({
    //     id: PseudoAula.AulaId,
    //     data: data,
    //     sala_Id: 0,
    //     numeroSala: '010',
    //     andar: '0',
    //     tipo_Id: EventoTipo.aula,
    //     descricao: 'Turma A',
    //     observacao:  '',
    //     finalizado: false,
    //     reagendamentoDe_Evento_Id: undefined,
    //     reagendamentoDe_Evento: undefined,
    //     alunos: alunoParticipacao,
    //     professores: [],
    //     professor_Id: 0,
    //     professor: 'Professor X',
    //     corLegenda: 'red',
    //     turma_Id: 0,
    //     turma: 'Turma A',
    //     perfilCognitivo: [],
    //     capacidadeMaximaAlunos: 12
    // })
    
});


function randomDate(start: Date, end: Date) {
    var date = new Date(+start + Math.random() * (end.getTime() - start.getTime()));
    date.setHours(13,0,0);
    return date;
}