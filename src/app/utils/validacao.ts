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
            var c5 = e.alunos.findIndex(x => x.aluno_Id == item.id) != -1
            var c6 = turma_Id ? e.turma_Id != turma_Id : true;
            var c7 = evento_Id ? e.id != evento_Id : true;
            var c8 = e.active;

            if (((c1 && c2) || (c3 && c4)) && c5 && c6 && c7 && c8) {
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
    var dataIntervalo = [intervaloDe, intervaloAte];
    return professores.map(item => {

        // Se o horário iniciar antes do inicio do expediente do professor
        if (item.expedienteInicio) {
            let _data = moment().set({ hour: intervaloDe.hours(), minute: intervaloDe.minutes(), second: 0 })
            if (_data.isBefore(item.expedienteInicio)) {

                if (item.id == 31) {
                    console.log('expedienteInicio', item.expedienteInicio)
                }
                item.disponivel = false;
                return item;
            }
        }

        // Se o horário finalizar apos o fim expediente do professor
        if (item.expedienteFim) {
            let _data = moment().set({ hour: intervaloAte.hours(), minute: intervaloAte.minutes(), second: 0 })
            console.log('_data', _data.format('DD/MM HH:mm'))
            if (_data.isAfter(item.expedienteFim) ) {
                if (item.id == 31) {
                    console.log('expedienteFim', item.expedienteFim)
                }
                item.disponivel = false;
                return item;
            }
        }

        var evento = eventos.find(e => {
            var eventoIntervalo = [moment(e.data), moment(e.data).add(e.duracaoMinutos, 'minutes')]

            var c1 = dataIntervalo[0].isAfter(eventoIntervalo[0]);
            var c2 = dataIntervalo[0].isBefore(eventoIntervalo[1]);
            var c3 = dataIntervalo[1].isAfter(eventoIntervalo[0]);
            var c4 = dataIntervalo[1].isBefore(eventoIntervalo[1]);
            var c5 = (e.professor_Id == item.id || e.professores.findIndex(x => x.professor_Id == item.id) != -1)
            var c6 = turma_Id ? e.turma_Id != turma_Id : true;
            var c7 = evento_Id ? e.id != evento_Id : true;
            var c8 = e.active;

            if (((c1 && c2) || (c3 && c4)) && c5 && c6 && c7 && c8) {
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
            var c6 = turma_Id ? e.turma_Id != turma_Id : true;
            var c7 = evento_Id ? e.id != evento_Id : true;
            var c8 = e.active;

            if (((c1 && c2) || (c3 && c4)) && c5 && c6 && c7 && c8) {
                return e;
            }
            return false
        })
        item.disponivel = !evento;
        item.disponivelEvent = evento;
        return item
    });
}
