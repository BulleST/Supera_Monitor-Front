import { Injectable } from "@angular/core";
import { Evento } from "../models/evento.model";
import moment from "moment";
import { CalendarioUtils } from "./calendario-utils";

@Injectable({
    providedIn: 'root'
})
export class MensagemWhatsapp {

    constructor(
        private calendarioUtils: CalendarioUtils
    ) {
    }

    enviarMensagem(nome: string, celular: string) {
        var array = nome.split(' ');
        nome = array[0];
        var celular = celular.replace(/\D/g, '')
        var mensagem = `Olá ${nome}, tudo bem?`;
        var link = `https://wa.me//${celular}?text=${encodeURIComponent(mensagem)}`;
        return link
    }

    enviarMensagemFalta(nome: string, celular: string, evento: Evento) {
        var array = nome.split(' ');
        nome = array[0];
        var celular = celular.replace(/\D/g, '')
        var mensagem = `Olá ${nome}, 
            \n Espero que esteja bem! Notei que você não esteve presente na ${this.calendarioUtils.getEventoTipo(evento)} do dia ${moment(evento.data).format('DD/MM/YY')} e gostaria de saber se houve um imprevisto. 
            Imprevistos acontecem e queremos saber se você está enfrentando dificuldades. 
            Sugiro agendarmos uma reposição, para você não perder o conteúdo. 
            Me avise o quanto antes sobre sua disponibilidade e agendaremos um horário conveniente para você.
            
            Iremos aguardar sua resposta...`;
        var link = `https://wa.me//${celular}?text=${encodeURIComponent(mensagem)}`;
        return link
    }

    enviarMensagemAgendamento(nome: string, celular: string, evento: Evento) {
        var array = nome.split(' ');
        nome = array[0];
        var celular = celular.replace(/\D/g, '')
        var mensagem = `Olá ${nome}, 
            Espero que esteja bem!
            Sua ${this.calendarioUtils.getEventoTipo(evento)} foi agendada para dia ${moment(evento.data).format('DD/MM/YY [às] HH[h]mm')}.
            Fico à disposição caso precise de algo antes da ${this.calendarioUtils.getEventoTipo(evento)}.
            
            Nos vemos em breve! `;
        var link = `https://wa.me//${celular}?text=${encodeURIComponent(mensagem)}`;
        return link
    }

    enviarMensagemReagendamento(nome: string, celular: string, evento: Evento) {
        var array = nome.split(' ');
        nome = array[0];
        var celular = celular.replace(/\D/g, '')
        var mensagem = `Olá ${nome},
            Espero que esteja bem!
            Sua ${this.calendarioUtils.getEventoTipo(evento)} foi reagendada para dia ${moment(evento.data).format('DD/MM/YY [às] HH[h]mm')}. 
            
            Fico à disposição caso precise de algo antes da ${this.calendarioUtils.getEventoTipo(evento)}.

            Nos vemos em breve!`;
        var link = `https://wa.me//${celular}?text=${encodeURIComponent(mensagem)}`;
        return link
    }

    enviarMensagemConfirmacao(nome: string, celular: string, evento: Evento) {
        var array = nome.split(' ');
        nome = array[0];
        var celular = celular.replace(/\D/g, '')
        var mensagem = `Olá ${nome}, 
            Espero que esteja bem!
            Lembrete importante: Não se esqueça da ${this.calendarioUtils.getEventoTipo(evento)} agendada para o dia ${moment(evento.data).format('DD/MM/YY [às] HH[h]mm')}.
            Conto com sua presença para que não perca conteúdo importante.
            Não se esqueça! Qualquer imprevisto, me avise com antecedência.
            
            Até lá! `;
        var link = `https://wa.me//${celular}?text=${encodeURIComponent(mensagem)}`;
        return link
    }

    enviarMensagemCancelamento(nome: string, celular: string, evento: Evento) {
        var array = nome.split(' ');
        nome = array[0];
        var celular = celular.replace(/\D/g, '')
        var mensagem = `Olá ${nome},
            Espero que esteja bem!
            Infelizmente sua ${this.calendarioUtils.getEventoTipo(evento)} do dia ${moment(evento.data).format('DD/MM/YY [às] HH[h]mm')} foi cancelada devido ${evento.observacao}. 
            
            Por favor, me avise sua disponibilidade para que possamos combinar um novo horário.

            Agradeço pela compreensão!`;
        var link = `https://wa.me//${celular}?text=${encodeURIComponent(mensagem)}`;
        return link
    }

    enviarMensagemReposicao(nome: string, celular: string, evento: Evento) {
        var array = nome.split(' ');
        nome = array[0];
        var celular = celular.replace(/\D/g, '')
        var mensagem = `Olá ${nome},
            Espero que esteja bem!
            Confirmo que a reposição da ${this.calendarioUtils.getEventoTipo(evento)} está agendada para o dia ${moment(evento.data).format('DD/MM/YY [às] HH[h]mm')}.
            Fico à disposição caso precise de algo antes da ${this.calendarioUtils.getEventoTipo(evento)}.
            
            Nos vemos em breve!
        `;
        var link = `https://wa.me//${celular}?text=${encodeURIComponent(mensagem)}`;
        return link
    }

    enviarMensagemInscricao(nome: string, celular: string, evento: Evento) {
        var array = nome.split(' ');
        nome = array[0];
        var celular = celular.replace(/\D/g, '')
        var mensagem = `Olá ${nome},
            Espero que esteja bem!
            Confirmo que a reposição da ${this.calendarioUtils.getEventoTipo(evento)} está agendada para o dia ${moment(evento.data).format('DD/MM/YY [às] HH[h]mm')}.
            Fico à disposição caso precise de algo antes da ${this.calendarioUtils.getEventoTipo(evento)}.
            
            Nos vemos em breve!
        `;
        var link = `https://wa.me//${celular}?text=${encodeURIComponent(mensagem)}`;
        return link
    }

    enviarMensagemFeedbackPosVenda(nome: string, celular: string) {
        var array = nome.split(' ');
        nome = array[0];
        var celular = celular.replace(/\D/g, '')
        var mensagem = `Olá ${nome},
           MENSAGEM DE FEEDBACK PÓS VENDA
        `;
        var link = `https://wa.me//${celular}?text=${encodeURIComponent(mensagem)}`;
        return link
    }
    enviarMensagemConfirmacaoPreenchimentoFeedbackPosVenda(nome: string, celular: string) {
        var array = nome.split(' ');
        nome = array[0];
        var celular = celular.replace(/\D/g, '')
        var mensagem = `Olá ${nome},
           MENSAGEM DE CONFIRMAÇÃO DE PREENCHIMENTO DE FEEDBACK PÓS VENDA
        `;
        var link = `https://wa.me//${celular}?text=${encodeURIComponent(mensagem)}`;
        return link
    }

    enviarMensagemApresentacaoDiretorFranqueado(nome: string, celular: string) {
        var array = nome.split(' ');
        nome = array[0];
        var celular = celular.replace(/\D/g, '')
        var mensagem = `Olá ${nome},
           MENSAGEM DE APRESENTACAO DIRETOR FRANQUEADO
        `;
        var link = `https://wa.me//${celular}?text=${encodeURIComponent(mensagem)}`;
        return link
    }

    enviarMensagemBoasVindas(nome: string, celular: string) {
        var array = nome.split(' ');
        nome = array[0];
        var celular = celular.replace(/\D/g, '')
        var mensagem = `Olá ${nome},
           MENSAGEM DE BOAS VINDAS
        `;
        var link = `https://wa.me//${celular}?text=${encodeURIComponent(mensagem)}`;
        return link
    }

    enviarMensagemAdequacaoTurma(nome: string, celular: string) {
        var array = nome.split(' ');
        nome = array[0];
        var celular = celular.replace(/\D/g, '')
        var mensagem = `Olá ${nome},
           MENSAGEM DE CONFIRMAÇÃO DE ADEQUAÇÃO DO ALUNO AO PERFIL DA TURMA
        `;
        var link = `https://wa.me//${celular}?text=${encodeURIComponent(mensagem)}`;
        return link
    }


    enviarMensagemLembreteOficina(nome: string, celular: string) {
        var array = nome.split(' ');
        nome = array[0];
        var celular = celular.replace(/\D/g, '')
        var mensagem = `Olá ${nome},
           MENSAGEM DE LEMBRETE DE OFICINA
        `;
        var link = `https://wa.me//${celular}?text=${encodeURIComponent(mensagem)}`;
        return link
    }


    enviarMensagemLembreteSuperacao(nome: string, celular: string) {
        var array = nome.split(' ');
        nome = array[0];
        var celular = celular.replace(/\D/g, '')
        var mensagem = `Olá ${nome},
           MENSAGEM DE LEMBRETE DE SUPERAÇÃO
        `;
        var link = `https://wa.me//${celular}?text=${encodeURIComponent(mensagem)}`;
        return link
    }


}
