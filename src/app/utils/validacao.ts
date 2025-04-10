import moment from "moment";
import { Professor } from "../models/professor.model";
import { Evento } from "../models/evento.model";
import { SalaAula, SalaAulaId } from "../models/sala-aula.model";
import { Aluno } from "../models/alunos.model";

export function validaAlunos(data: Date, duracaoMinutos: number, alunos: Aluno[], eventos: Evento[], turma_Id?: number, evento_Id?: number) {
    var intervaloDe = moment(data);
    var intervaloAte = moment(data).add(duracaoMinutos - 1, 'minutes');
    var turmaIntervalo = [intervaloDe, intervaloAte];

    return alunos.map(item => {
        var evento = eventos.find(e => {
            var eventoIntervalo = [moment(e.data), moment(e.data).add(e.duracaoMinutos, 'minutes')]

            var c1 = turmaIntervalo[0].isAfter(eventoIntervalo[0])
            var c2 = turmaIntervalo[0].isBefore(eventoIntervalo[1])
            var c3 = turmaIntervalo[1].isAfter(eventoIntervalo[0])
            var c4 = turmaIntervalo[1].isBefore(eventoIntervalo[1])
            var c5 =  e.alunos.findIndex(x => x.aluno_Id == item.id) != -1
            var c6 = e.turma_Id != turma_Id;
            var c7 = e.id != evento_Id;

            if (((c1 && c2) || (c3 && c4)) && c5 && c6 && c7 ) {
                return e;
            }

            return false
        })
        item.disponivel = !evento;
        item.disponivelEvent = evento;
        return item
    });
}
export function validaProfessores(data: Date, duracaoMinutos: number, professores: Professor[], eventos: Evento[], turma_Id?: number, evento_Id?: number) {

    var intervaloDe = moment(data);
    var intervaloAte = moment(data).add(duracaoMinutos - 1, 'minutes');
    var turmaIntervalo = [intervaloDe, intervaloAte];

    return professores.map(item => {
        var evento = eventos.find(e => {
            var eventoIntervalo = [moment(e.data), moment(e.data).add(e.duracaoMinutos, 'minutes')]

            var c1 = turmaIntervalo[0].isAfter(eventoIntervalo[0])
            var c2 = turmaIntervalo[0].isBefore(eventoIntervalo[1])
            var c3 = turmaIntervalo[1].isAfter(eventoIntervalo[0])
            var c4 = turmaIntervalo[1].isBefore(eventoIntervalo[1])
            var c5 = (e.professor_Id == item.id || e.professores.findIndex(x => x.professor_Id == item.id) != -1)
            var c6 = e.turma_Id != turma_Id;
            var c7 = e.id != evento_Id;

            if (((c1 && c2) || (c3 && c4)) && !c5 && c6 && c7  &&  item.id == 33) {
                console.log('oi',e.professor_Id, e.professores)
            } 
            
            if (((c1 && c2) || (c3 && c4)) && c5 && c6 && c7 ) {
                return e;
            }

            return false
        })
        item.disponivel = !evento;
        item.disponivelEvent = evento;
        return item
    });
}

export function validaSalaAulas(data: Date, duracaoMinutos: number, salaAulas: SalaAula[], eventos: Evento[], turma_Id?: number, evento_Id?: number) {
    var intervaloDe = moment(data);
    var intervaloAte = moment(intervaloDe).add(duracaoMinutos - 1, 'minutes');
    var turmaIntervalo = [intervaloDe, intervaloAte]

    return salaAulas.map(item => {
        if (item.id == SalaAulaId.online) {
            return item;
        }

        var evento = eventos.find(e => {
            var eventoIntervalo = [moment(e.data), moment(e.data).add(e.duracaoMinutos, 'minutes')]

            var c1 = turmaIntervalo[0].isAfter(eventoIntervalo[0])
            var c2 = turmaIntervalo[0].isBefore(eventoIntervalo[1])
            var c3 = turmaIntervalo[1].isAfter(eventoIntervalo[0])
            var c4 = turmaIntervalo[1].isBefore(eventoIntervalo[1])
            var c5 = e.sala_Id == item.id;
            var c6 = e.turma_Id != turma_Id;
            var c7 = e.id != evento_Id;


            if (((c1 && c2) || (c3 && c4)) && c5 && c6 && c7 ) {
                return e;
            }
            return false
        })
        item.disponivel = !evento;
        item.disponivelEvent = evento;
        return item
    });
}