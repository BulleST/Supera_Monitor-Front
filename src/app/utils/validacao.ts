import moment from "moment";
import { Professor } from "../models/professor.model";
import { Evento } from "../models/evento.model";
import { SalaAula, SalaAulaId } from "../models/sala-aula.model";
import { Aluno } from "../models/alunos.model";

export function validaAlunos(data: Date, duracaoMinutos: number, alunos: Aluno[], eventos: Evento[], turma_Id?: number, evento_Id?: number) {
    let intervaloDe = moment(data);
    let intervaloAte = moment(data).add(duracaoMinutos - 1, 'minutes');

    return alunos.map(item => {
        let evento = eventos.find(e => {

            let eventoIntervaloDe = moment(e.data);
            let eventoIntervaloAte =  moment(e.data).add(e.duracaoMinutos - 1, 'minute');
            
            let c1 = intervaloDe.isBetween(eventoIntervaloDe, eventoIntervaloAte, undefined, '[]');
            let c2 = intervaloAte.isBetween(eventoIntervaloDe, eventoIntervaloAte, undefined, '[]');

            let alunoEstaNaAula = e.alunos.findIndex(x => x.aluno_Id == item.id) != -1
            let ehTurmaDiferente = turma_Id ? e.turma_Id != turma_Id : true;
            let ehEventoDiferente = evento_Id ? e.id != evento_Id : true;
            let ehEventoAtivo = e.active;

            if ((c1 || c2) && alunoEstaNaAula && ehTurmaDiferente && ehEventoDiferente && ehEventoAtivo) {
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

        eventos = eventos.sort((x,y) => x.data.getTime() - y.data.getTime())
        let evento = eventos.find(e => {
            let eventoIntervaloDe = moment(e.data);
            let eventoIntervaloAte =  moment(e.data).add(e.duracaoMinutos - 1, 'minute');

          
            let professorEstaNoEvento = (e.professor_Id == item.id || e.professores.findIndex(x => x.professor_Id == item.id) != -1)
            let ehTurmaDiferente = turma_Id ? e.turma_Id != turma_Id : true;
            let ehEventoDiferente = evento_Id ? e.id != evento_Id : true;
            let ehEventoAtivo = e.active;
            
            let c1 = intervaloDe.isBetween(eventoIntervaloDe, eventoIntervaloAte, undefined, '[]');
            let c2 = intervaloAte.isBetween(eventoIntervaloDe, eventoIntervaloAte, undefined, '[]');
      
            if ((c1 || c2) 
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
    let intervaloDe = moment(data);
    let intervaloAte = moment(intervaloDe).add(duracaoMinutos - 1, 'minutes');

    return salaAulas.map(item => {
        if (item.id == SalaAulaId.online) {
            return item;
        }

        let evento = eventos.find(e => {
            let eventoIntervaloDe = moment(e.data);
            let eventoIntervaloAte = moment(e.data).add(e.duracaoMinutos - 1, 'minutes');

   
            let c1 = intervaloDe.isBetween(eventoIntervaloDe, eventoIntervaloAte, undefined, '[]');
            let c2 = intervaloAte.isBetween(eventoIntervaloDe, eventoIntervaloAte, undefined, '[]');

            let ehSalaDoEvento = e.sala_Id == item.id;
            let ehTurmaDiferente = turma_Id ? e.turma_Id != turma_Id : true;
            let ehEventoDiferente = evento_Id ? e.id != evento_Id : true;
            let ehEventoAtivo = e.active;

            if ((c1 || c2) 
                        && ehSalaDoEvento 
                        && ehTurmaDiferente 
                        && ehEventoDiferente 
                        && ehEventoAtivo) {
                return e;
            }
            return false
        })

        item.disponivel = !evento;
        item.disponivelEvent = evento;

        // console.log('sala final', item.description, item);
        return item;
    });
}
