import { Injectable } from "@angular/core";
import { Evento } from "../models/evento.model";
import moment from "moment";
import { CalendarioUtils } from "./calendario-utils";
import { Account } from "../models/account.model";
import { Turma } from "../models/turma.model";

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
            \r\n Espero que esteja bem! 
            \r\nNotei que você não esteve presente na ${this.calendarioUtils.getEventoTipo(evento)} do dia ${moment(evento.data).format('DD/MM/YY')} e gostaria de saber se houve um imprevisto. 
            \r\nImprevistos acontecem e queremos saber se você está enfrentando dificuldades. 
            \r\nSugiro agendarmos uma reposição, para você não perder o conteúdo. 
            \r\nMe avise o quanto antes sobre sua disponibilidade e agendaremos um horário conveniente para você.
            \r\n
            \r\nIremos aguardar sua resposta...`;
        var link = `https://wa.me//${celular}?text=${encodeURIComponent(mensagem)}`;
        return link
    }

    enviarMensagemAgendamento(nome: string, celular: string, evento: Evento) {
        var array = nome.split(' ');
        nome = array[0];
        var celular = celular.replace(/\D/g, '')
        var mensagem = `Olá ${nome}, 
            \r\nEspero que esteja bem!
            \r\nSua ${this.calendarioUtils.getEventoTipo(evento)} foi agendada para o dia ${moment(evento.data).format('DD/MM/YY [às] HH[h]mm')}.
            \r\nFico à disposição caso precise de algo antes da ${this.calendarioUtils.getEventoTipo(evento)}.
            \r\n
            \r\nNos vemos em breve! `;
        var link = `https://wa.me//${celular}?text=${encodeURIComponent(mensagem)}`;
        return link
    }

    enviarMensagemReagendamento(nome: string, celular: string, evento: Evento) {
        var array = nome.split(' ');
        nome = array[0];
        var celular = celular.replace(/\D/g, '')
        var mensagem = `Olá ${nome},
            \r\nEspero que esteja bem!
            \r\nSua ${this.calendarioUtils.getEventoTipo(evento)} foi reagendada para dia ${moment(evento.data).format('DD/MM/YY [às] HH[h]mm')}. 
            \r\n
            \r\nFico à disposição caso precise de algo antes da ${this.calendarioUtils.getEventoTipo(evento)}.
            \r\n
            \r\nNos vemos em breve!`;
        var link = `https://wa.me//${celular}?text=${encodeURIComponent(mensagem)}`;
        return link
    }

    enviarMensagemCancelamento(nome: string, celular: string, evento: Evento) {
        var array = nome.split(' ');
        nome = array[0];
        var celular = celular.replace(/\D/g, '')
        var mensagem = `Olá ${nome},
            \r\nEspero que esteja bem!
            \r\nInfelizmente sua ${this.calendarioUtils.getEventoTipo(evento)} do dia ${moment(evento.data).format('DD/MM/YY [às] HH[h]mm')} foi cancelada devido "${evento.observacao}". 
            \r\n
            \r\nPor favor, me avise sua disponibilidade para que possamos combinar um novo horário.
            \r\n
            \r\nAgradeço pela compreensão!`;
        var link = `https://wa.me//${celular}?text=${encodeURIComponent(mensagem)}`;
        return link
    }

    enviarMensagemReposicao(nome: string, celular: string, evento: Evento) {
        var array = nome.split(' ');
        nome = array[0];
        var celular = celular.replace(/\D/g, '')
        var mensagem = `Olá ${nome},
            \r\nEspero que esteja bem!
            \r\nConfirmo que a reposição da ${this.calendarioUtils.getEventoTipo(evento)} está agendada para o dia ${moment(evento.data).format('DD/MM/YY [às] HH[h]mm')}.
            \r\n
            \r\nFico à disposição caso precise de algo antes da ${this.calendarioUtils.getEventoTipo(evento)}.
            \r\n
            \r\nNos vemos em breve!
        `;
        var link = `https://wa.me//${celular}?text=${encodeURIComponent(mensagem)}`;
        return link
    }

    enviarMensagemInscricao(nome: string, celular: string, evento: Evento) {
        var array = nome.split(' ');
        nome = array[0];
        var celular = celular.replace(/\D/g, '')
        var mensagem = `Olá ${nome},
            \r\nEspero que esteja bem!
            \r\nSua inscrição na oficina do dia ${moment(evento.data).format('DD/MM/YY [às] HH[h]mm')} foi confirmada.
            \r\n
            \r\nFico à disposição caso precise de algo antes da oficina.
            \r\n
            \r\nNos vemos em breve!
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
                        \r\nEspero que esteja bem!
                        \r\nPassando para confirmar se você já conseguiu preencher o formulário que enviamos.
                        \r\nCaso ainda não tenha preenchido, posso te enviar novamente — é rapidinho! 😊
                        \r\n
                        \r\nLink: <Link do formulário>
                        \r\n
                        \r\nFico no aguardo, tá bom?
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

    enviarMensagemBoasVindas(nome: string, celular: string, email: string, diaSemana?: number, horario?: Date, professor?: string, linkGrupo?: string) {
        var semana = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado",]

        var array = nome.split(' ');
        nome = array[0];
        var celular = celular.replace(/\D/g, '')
        var mensagem = `Olá ${nome},
            \r\nTudo bem?
            \r\nMeu nome é Antonio Neto, coordenador pedagógico da Equipe Supera Paraíso!
            \r\n
            \r\nEstamos felizes e honrados em ter você como nosso(a) aluno(a)! 
            \r\nSeja bem-vindo(a) à Família SUPERA! 💪🧠
            \r\n
            \r\nPara começar, vamos ver algumas informações importantes sobre o início do curso:
            \r\n
            
        `;
        if (diaSemana && horario) {
            mensagem += `\r\nSua Turma: ${semana[diaSemana]} ${moment(horario).format('HH:mm')}.`;
        }
        if (professor) {
            mensagem += `\r\nSeu educador é o ${professor}.`;
        }
        mensagem += `
                \r\n
                \r\nTe incluiremos no grupo da turma do SUPERA no WhatsApp, onde enviamos exercícios, reflexão da semana e recados voltados a turma 💪🧠
                \r\nAceite o convite e não perca nenhuma informação! 😉
                `;

        if (linkGrupo && diaSemana && horario) {
            mensagem += `
                \r\n
                \r\nCaso não tenha sido incluído, clique no link abaixo para entrar no grupo. 
                \r\n
                \r\n[${semana[diaSemana].toLowerCase()} - ${moment(horario).format('HH:mm')}]: ${linkGrupo}
                \r\n
            `;
        } else {
             mensagem += `
                \r\n
                \r\nCaso não tenha sido incluído, enviaremos o convite para você clicar e entrar no grupo.
            `;

        }

        mensagem += `
            \r\n
            \r\nSENSORIAL MOOVE (SUPERA ONLINE PREMIUM): Sendo nosso aluno, você possui acesso ao nosso aplicativo com exercícios complementares ao treino cognitivo. Poderá ser baixado nos links abaixo 👇 
            \r\n
            \r\nCelular (IPHONE): https://apps.apple.com/br/app/sensorial-moove/id1613606380
            \r\nCelular (ANDROID): https://play.google.com/store/apps/details?id=com.sensorial.moove&pli=1
            \r\nComputador: https://apps.microsoft.com/detail/9pj1l9fd95nc?hl=en-us&gl=BR
            \r\n
            ${email ? `\r\nSEU USUÁRIO: ${email}` : ''}
            \r\nSUA SENHA: Super@123
            \r\n
            \r\nQualquer dúvida, estou à disposição!`;
        var link = `https://wa.me//${celular}?text=${encodeURIComponent(mensagem)}`;
        return link
    }

    enviarMensagemAdequacaoTurma(nome: string, celular: string) {
        var array = nome.split(' ');
        nome = array[0];
        var celular = celular.replace(/\D/g, '')
        var mensagem = `Olá ${nome},
                        \r\nEspero que esteja bem!
                        \r\n
                        \r\nQueremos saber como você está se sentindo em relação à sua turma.
                        \r\nEstá tudo indo bem por aí? Há algo em que possamos te ajudar ou melhorar para que sua experiência seja ainda mais positiva?
                        \r\n
                        \r\nConte com a gente! 😊
        `;
        var link = `https://wa.me//${celular}?text=${encodeURIComponent(mensagem)}`;
        return link
    }


    enviarMensagemLembreteOficina(nome: string, celular: string, proximaOficina?: Evento) {
        var array = nome.split(' ');
        nome = array[0];
        var celular = celular.replace(/\D/g, '')
        var mensagem = `Olá ${nome},
                \r\nEspero que esteja bem!
                \r\n
                \r\nVenho te convidar para participar da nossa oficina Supera.
                \r\nVamos trabalhar juntos o seu desenvolvimento através de jogos e apostila Abrindo Horizontes!
                \r\n
                \r\nSerá uma alegria ter você com a gente!
                \r\n
                \r\nPosso contar com você? 💪🙂
                \r\n
                \r\n Atenção: o não comparecimento sem aviso prévio de 24h resultará no bloqueio da participação em outras oficinas durante o mês corrente.

        `;
        var link = `https://wa.me//${celular}?text=${encodeURIComponent(mensagem)}`;
        return link
    }


    enviarMensagemLembreteSuperacao(nome: string, celular: string) {
        var array = nome.split(' ');
        nome = array[0];
        var celular = celular.replace(/\D/g, '')
        var mensagem = `Olá ${nome},
            Espero que esteja bem!
            Não se esqueça de agendar sua Superação com a gente.
            
            Essa é uma aula exclusiva, essencial para o desenvolvimento do cérebro e da cognição. Além disso, é uma ótima oportunidade para tirar todas as suas dúvidas com um professor, de forma prática e personalizada.
            Vamos juntos nessa jornada? 💪🙂

            Nos vemos em breve!
        `;
        var link = `https://wa.me//${celular}?text=${encodeURIComponent(mensagem)}`;
        return link
    }


/*---Mensagem de Falta-----------------------------------------------------------------------------------

Olá <nome do aluno>, 
Espero que esteja bem! 
Notei que você não esteve presente na <aula/superação/aula-0/oficina> do dia <data dia/mes/ano hora:minuto> e gostaria de saber se houve um imprevisto. 
Imprevistos acontecem e queremos saber se você está enfrentando dificuldades. 
Sugiro agendarmos uma reposição, para você não perder o conteúdo. 
Me avise o quanto antes sobre sua disponibilidade e agendaremos um horário conveniente para você.

Iremos aguardar sua resposta...
*/
/*---Mensagem de Agendamento-----------------------------------------------------------------------------

Olá <nome do aluno>, 
Espero que esteja bem! 
Sua <aula/superação/aula-0/oficina> foi agendada para o dia <data dia/mes/ano hora:minuto>.

Fico à disposição caso precise de algo antes da <aula/superação/aula-0/oficina>.

Nos vemos em breve!
*/
/*---Mensagem de Reagendamento---------------------------------------------------------------------------

Olá <nome do aluno>, 
Espero que esteja bem! 
Sua <aula/superação/aula-0/oficina> foi reagendada para o dia <data dia/mes/ano hora:minuto>.

Fico à disposição caso precise de algo antes da <aula/superação/aula-0/oficina>.

Nos vemos em breve!
*/
/*---Mensagem de Cancelamento----------------------------------------------------------------------------

Olá <nome do aluno>, 
Espero que esteja bem! 
Infelizmente sua <aula/superação/aula-0/oficina> do dia <data dia/mes/ano hora:minuto> foi cancelada devido <motivo inserido em observações>.

Por favor, me avise sua disponibilidade para que possamos combinar um novo horário.

Agradeço pela compreensão!
*/
/*---Mensagem de Reposição agendada----------------------------------------------------------------------

Olá <nome do aluno>, 
Espero que esteja bem!
Confirmo que a reposição da sua aula está agendada para o dia <data dia/mes/ano hora:minuto>.
Fico à disposição caso precise de algo antes da aula.

Nos vemos em breve!
*/
/*---Mensagem de Incrição oficina------------------------------------------------------------------------

Olá <nome do aluno>, 
Espero que esteja bem!
Sua inscrição na oficina do dia <data dia/mes/ano hora:minuto> foi confirmada.
Fico à disposição caso precise de algo antes da oficina.

Nos vemos em breve!
*/
/*---Jornada Supera - Semana 0 - Mensagem de boas vindas-------------------------------------

Olá <nome do aluno>, 
Tudo bem?
Meu nome é Antonio Neto, coordenador pedagógico da Equipe Supera Paraíso!

Estamos felizes e honrados em ter você como nosso(a) aluno(a)! 
Seja bem-vindo(a) à Família SUPERA! 💪🧠

Para começar, vamos ver algumas informações importantes sobre o início do curso:
Sua Turma: <dia da semana> - <hora:minuto>
Seu educador é o <educador do aluno>

Te incluímos em dois grupos do SUPERA no WhatsApp 💪🧠

O Supera INFORMATIVOS é onde enviamos recados gerais, gabaritos, oficinas e etc. 

Já o SUPERA [<dia da semana> - <hora:minuto>] é o grupo apenas da sua turma, onde enviamos exercícios, reflexão da semana e recados voltados a turma.

SENSORIAL MOOVE (SUPERA ONLINE PREMIUM): Sendo nosso aluno, você possui acesso ao nosso aplicativo com exercícios complementares ao treino cognitivo. Poderá ser baixado nos links abaixo 👇 

Celular (IPHONE): https://apps.apple.com/br/app/sensorial-moove/id1613606380
Celular (ANDROID): https://play.google.com/store/apps/details?id=com.sensorial.moove&pli=1
Computador: https://apps.microsoft.com/detail/9pj1l9fd95nc?hl=en-us&gl=BR

SEU USUÁRIO: <email do aluno>
SUA SENHA: Super@123

Qualquer dúvida, estou à disposição!
*/
/*---Jornada Supera - 1ª Semana- Apresentação do diretor franqueado--------------------------
    PENDENTE
*/
/*---Jornada Supera - 2ª Semana - Confirmação da adequação do aluno ao perfil da turma-------
Olá <nome do aluno>, 
Espero que esteja bem!

Queremos saber como você está se sentindo em relação à sua turma.
Está tudo indo bem por aí? Há algo em que possamos te ajudar ou melhorar para que sua experiência seja ainda mais positiva?

Conte com a gente! 😊
*/
/*---Jornada Supera - 3ª Semana - Feedback pós-venda-----------------------------------------
    PENDENTE
*/
/*---Jornada Supera - 3ª Semana - Confirmação de preenchimento do feedback pós-venda---------
Olá <nome do aluno>, 
Espero que esteja bem!
Passando para confirmar se você já conseguiu preencher o formulário que enviamos.
Caso ainda não tenha preenchido, posso te enviar novamente — é rapidinho! 😊

Link: <Link do formulário>

Fico no aguardo, tá bom?
*/
/*---Jornada Supera - 3ª e 7ª Semana - Lembrete para agendar oficina-------------------------

Olá <nome do aluno>, 
Espero que esteja bem!
Gostaria de te convidar para participar de uma oficina super especial com a gente.
Nela, vamos trabalhar juntos o desenvolvimento da criatividade, autoestima, coordenação motora e da sua capacidade de expressão de forma divertida e envolvente!

Será uma alegria ter você com a gente!

Posso contar com você? 💪🙂
*/
/*---Jornada Supera - 7ª e 11ª Semana - Lembrete para agendar superação----------------------

Olá <nome do aluno>, 
Espero que esteja bem!
Não se esqueça de agendar sua Superação com a gente.

Essa é uma aula exclusiva, essencial para o desenvolvimento do cérebro e da cognição. Além disso, é uma ótima oportunidade para tirar todas as suas dúvidas com um professor, de forma prática e personalizada.
Vamos juntos nessa jornada? 💪🙂

Nos vemos em breve!
*/

}
