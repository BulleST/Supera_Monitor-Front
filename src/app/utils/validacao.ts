import moment from "moment";
import { Professor } from "../models/professor.model";
import { Evento } from "../models/evento.model";
import { SalaAula, SalaAulaId } from "../models/sala-aula.model";
import { Aluno } from "../models/alunos.model";

export function validaAlunos(data: Date, duracaoMinutos: number, alunos: Aluno[], eventos: Evento[], turma_Id?: number, evento_Id?: number) {
    let intervaloDe = moment(data);
    let intervaloAte = moment(data).add(duracaoMinutos - 1, 'minutes');
    let turmaIntervalo = [intervaloDe, intervaloAte];

    return alunos.map(item => {
        let evento = eventos.find(e => {
            let eventoIntervalo = [moment(e.data), moment(e.data).add(e.duracaoMinutos, 'minutes')]

            let c1 = turmaIntervalo[0].isAfter(eventoIntervalo[0])
            let c2 = turmaIntervalo[0].isBefore(eventoIntervalo[1])
            let c3 = turmaIntervalo[1].isAfter(eventoIntervalo[0])
            let c4 = turmaIntervalo[1].isBefore(eventoIntervalo[1])
            let alunoEstaNaAula = e.alunos.findIndex(x => x.aluno_Id == item.id) != -1
            let ehTurmaDiferente = turma_Id ? e.turma_Id != turma_Id : true;
            let ehEventoDiferente = evento_Id ? e.id != evento_Id : true;
            let ehEventoAtivo = e.active;

            if (((c1 && c2) || (c3 && c4)) && alunoEstaNaAula && ehTurmaDiferente && ehEventoDiferente && ehEventoAtivo) {
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

    let intervaloDe = moment(data);
    let intervaloAte = moment(data).add(duracaoMinutos - 1, 'minutes');
    let dataIntervalo = [intervaloDe, intervaloAte];


    return professores.map(item => {

        // Se tentar marcar com inicio antes do expediente
        if (item.expedienteInicio) {
            let _data = moment().set({ hour: intervaloDe.hours(), minute: intervaloDe.minutes(), second: 0 })
            if (_data.isBefore(item.expedienteInicio)) {
                item.disponivel = false;
                return item;
            }
        }

        // Se tentar marcar com termino após do expediente
        if (item.expedienteFim) {
            let _data = moment().set({ hour: intervaloAte.hours(), minute: intervaloAte.minutes(), second: 0 })
            if (_data.isAfter(item.expedienteFim) ) {
                item.disponivel = false;
                return item;
            }
        }

        let evento = eventos.find(e => {
            let eventoIntervalo = [moment(e.data), moment(e.data).add(e.duracaoMinutos - 1, 'minutes')]

            let c1 = dataIntervalo[0].isAfter(eventoIntervalo[0]);
            let c2 = dataIntervalo[0].isBefore(eventoIntervalo[1]);
            let c3 = dataIntervalo[1].isAfter(eventoIntervalo[0]);
            let c4 = dataIntervalo[1].isBefore(eventoIntervalo[1]);
            let professorEstaNoEvento = (e.professor_Id == item.id || e.professores.findIndex(x => x.professor_Id == item.id) != -1)
            let ehTurmaDiferente = turma_Id ? e.turma_Id != turma_Id : true;
            let ehEventoDiferente = evento_Id ? e.id != evento_Id : true;
            let ehEventoAtivo = e.active;

            if (((c1 && c2) || (c3 && c4)) 
                && professorEstaNoEvento 
                && ehTurmaDiferente 
                && ehEventoDiferente 
                && ehEventoAtivo) {
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
    console.log('validaSalaAulas')
    let intervaloDe = moment(data);
    let intervaloAte = moment(intervaloDe).add(duracaoMinutos - 1, 'minutes');

    console.log('intervaloDe', moment(intervaloDe).format('DD/MM HH:mm'))
    console.log('intervaloAte', moment(intervaloAte).format('DD/MM HH:mm'))

    return salaAulas.map(item => {
        console.log('sala inicio', item.description, item)
        if (item.id == SalaAulaId.online) {
            return item;
        }

        let evento = eventos.find(e => {
            let eventoIntervaloDe = moment(e.data);
            let eventoIntervaloAte = moment(e.data).add(e.duracaoMinutos - 1, 'minutes');

            console.group('evento', e.descricao, e)
            
            console.log('eventoIntervaloDe', moment(eventoIntervaloDe).format('DD/MM HH:mm'))
            console.log('eventoIntervaloAte', moment(eventoIntervaloAte).format('DD/MM HH:mm'))

            let c1 = intervaloDe.isAfter(eventoIntervaloDe);
            let c2 = intervaloDe.isBefore(eventoIntervaloAte);

            let c3 = intervaloAte.isAfter(eventoIntervaloDe);
            let c4 = intervaloAte.isBefore(eventoIntervaloAte);

            let t1 = intervaloAte.isBetween(eventoIntervaloDe, eventoIntervaloAte);
            let t2 = intervaloAte.isBetween(eventoIntervaloDe, eventoIntervaloAte);

            console.log('c1', c1)
            console.log('c2', c2)
            console.log('c3', c3)
            console.log('c4', c4)
            console.log('t1', t1)
            console.log('t2', t2)

            let ehSalaDoEvento = e.sala_Id == item.id;
            let ehTurmaDiferente = turma_Id ? e.turma_Id != turma_Id : true;
            let ehEventoDiferente = evento_Id ? e.id != evento_Id : true;
            let ehEventoAtivo = e.active;

            console.log('ehSalaDoEvento', ehSalaDoEvento)
            console.log('ehTurmaDiferente', ehTurmaDiferente)
            console.log('ehEventoDiferente', ehEventoDiferente)
            console.log('ehEventoAtivo', ehEventoAtivo)

            let c9 = ((c1 && c2) || (c3 && c4)) 
                        && ehSalaDoEvento 
                        && ehTurmaDiferente 
                        && ehEventoDiferente 
                        && ehEventoAtivo;

            console.log('c9', c9)

            console.groupEnd();
            if (c9) {
                return e;
            }
            return false
        })

        item.disponivel = !evento;
        item.disponivelEvent = evento;

        console.log('sala final', item.description, item);
        return item;
    });
}
