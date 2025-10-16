import moment from "moment";
import { Professor } from "../models/professor.model";
import { Evento } from "../models/evento.model";
import { SalaAndar, SalaAula } from "../models/sala-aula.model";
import { Aluno } from "../models/alunos.model";

export function validaAlunoSalaAula(sala_Id: number, aluno_Id: number, salas: SalaAula[], alunos: Aluno[]) {
    const aluno = alunos.find(x => x.id == aluno_Id);
    const sala = salas.find(x => x.id == sala_Id);

    if (!aluno || !sala){
        return true;
    }

    if (aluno.restricaoMobilidade && sala.andar > SalaAndar.Terreo) {
        return false;
    }

    return true;

}


export function validaAlunos(data: Date, duracaoMinutos: number, alunos: Aluno[], eventos: Evento[], turma_Id?: number, evento_Id?: number) {
    let intervaloDe = moment(data);
    let intervaloAte = moment(data).add(duracaoMinutos - 1, 'minutes');

    return alunos.map(aluno => {
        let evento = eventos.find(e => {

            let eventoIntervaloDe = moment(e.data);
            let eventoIntervaloAte =  moment(e.data).add(e.duracaoMinutos - 1, 'minute');
            
            let c1 = intervaloDe.isBetween(eventoIntervaloDe, eventoIntervaloAte, undefined, '[]');
            let c2 = intervaloAte.isBetween(eventoIntervaloDe, eventoIntervaloAte, undefined, '[]');
            let intervaloValido = c1 || c2;

            let participacao = e.alunos.find(x => x.aluno_Id == aluno.id);
            let participacaoAtiva = participacao?.active;

            let ehTurmaDiferente = turma_Id ? e.turma_Id != turma_Id : true;
            let ehEventoDiferente = evento_Id ? e.id != evento_Id : true;
            let ehEventoAtivo = e.active;

            if (intervaloValido 
                && participacao 
                && participacaoAtiva 
                && ehTurmaDiferente 
                && ehEventoDiferente 
                && ehEventoAtivo) {
                return e;
            }

            return false
        })
        aluno.disponivel = !evento;
        aluno.disponivelEvent = evento;
        return aluno
    });
}
export function validaProfessores(data: Date, duracaoMinutos: number, professores: Professor[], eventos: Evento[], turma_Id?: number, evento_Id?: number) {

    let intervaloDe = moment(data);
    let intervaloAte = moment(data).add(duracaoMinutos - 1, 'minutes');

    return professores.map(professor => {

        // Se tentar marcar com inicio antes do expediente
        if (professor.expedienteInicio) {
            let _data = moment().set({ hour: intervaloDe.hours(), minute: intervaloDe.minutes(), second: 0 })
            if (_data.isBefore(professor.expedienteInicio)) {
                professor.disponivel = false;
                return professor;
            }
        }

        // Se tentar marcar com termino após do expediente
        if (professor.expedienteFim) {
            let _data = moment().set({ hour: intervaloAte.hours(), minute: intervaloAte.minutes(), second: 0 })
            if (_data.isAfter(professor.expedienteFim) ) {
                professor.disponivel = false;
                return professor;
            }
        }

        eventos = eventos.sort((x,y) => x.data.getTime() - y.data.getTime())

        let evento = eventos.find(e => {
            let eventoIntervaloDe = moment(e.data);
            let eventoIntervaloAte =  moment(e.data).add(e.duracaoMinutos - 1, 'minute');

            let participacao = e.professores.find(x => x.professor_Id == professor.id);
            let participacaoAtiva = participacao?.active;
            let professorEstaNoEvento = e.professor_Id == professor.id || !!participacao
            let ehTurmaDiferente = turma_Id ? e.turma_Id != turma_Id : true;
            let ehEventoDiferente = evento_Id ? e.id != evento_Id : true;
            let ehEventoAtivo = e.active;
            
            let c1 = intervaloDe.isBetween(eventoIntervaloDe, eventoIntervaloAte, undefined, '[]');
            let c2 = intervaloAte.isBetween(eventoIntervaloDe, eventoIntervaloAte, undefined, '[]');
            let intervaloValido = c1 || c2;

            if (intervaloValido
                && professorEstaNoEvento
                && participacaoAtiva 
                && ehTurmaDiferente 
                && ehEventoDiferente 
                && ehEventoAtivo) {
                return e;
            }

            return false
        })

        professor.disponivel = !evento;
        professor.disponivelEvent = evento;
        return professor
    });
}

export function validaSalaAulas(data: Date, duracaoMinutos: number, salaAulas: SalaAula[], eventos: Evento[], turma_Id?: number, evento_Id?: number) {
    let intervaloDe = moment(data);
    let intervaloAte = moment(intervaloDe).add(duracaoMinutos - 1, 'minutes');

    return salaAulas.map(item => {

        let evento = eventos.find(e => {
            let eventoIntervaloDe = moment(e.data);
            let eventoIntervaloAte = moment(e.data).add(e.duracaoMinutos - 1, 'minutes');
            
            let ehSalaDoEvento = e.sala_Id == item.id;
            let ehTurmaDiferente = turma_Id ? e.turma_Id != turma_Id : true;
            let ehEventoDiferente = evento_Id ? e.id != evento_Id : true;
            let ehEventoAtivo = e.active;

            let c1 = intervaloDe.isBetween(eventoIntervaloDe, eventoIntervaloAte, undefined, '[]');
            let c2 = intervaloAte.isBetween(eventoIntervaloDe, eventoIntervaloAte, undefined, '[]');
            let intervaloValido = c1 || c2;

            if (intervaloValido
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

        return item;
    });
}
