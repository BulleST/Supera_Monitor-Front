import { Injectable } from "@angular/core";
import { Evento, EventoTipo } from "../models/evento.model";
import moment, { months } from "moment";
import { CalendarioUtils } from "./calendario-utils";
import { ToastrService } from "ngx-toastr";
import { Clipboard } from "@angular/cdk/clipboard";
import { EventoService } from "../services/evento.service";
import { Evento_Participacao_Aluno } from "../models/evento-participacao-aluno.model";
import { Aluno } from "../models/alunos.model";
import { showError } from "./error";
import { ConfirmationService } from "primeng/api";
import { lastValueFrom } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class MensagemWhatsapp {

    constructor(
        private calendarioUtils: CalendarioUtils,
        private toastr: ToastrService,
        private clipboard: Clipboard,
        private eventoService: EventoService,
        private confirmationService: ConfirmationService,
    ) {
    }

    showError(header: string, message: string, e: any) {
        this.toastr.error(message, header)
        showError(this.confirmationService, header, message, e)
    }

    copiarMensagem(mensagem: string) {
        navigator.clipboard.writeText(mensagem)
            .then(() => {
                this.toastr.info('Mensagem copiada para área de transferência');
            })
            .catch(() => {
                this.toastr.error('Erro ao copiar mensagem');
            });
    }

    async enviarMensagemFalta(evento: Evento, participacao: Evento_Participacao_Aluno, e: any) {
        if (!participacao.celular) {
            this.showError('Celular não informado', 'O aluno não possui um número de celular cadastrado.', e.target);
            return;
        }

        if (participacao.presente) {
            this.showError('Aluno presente', 'O aluno já está presente.', e.target);
            return;
        }

        let sugestoes: Evento[] = [];
        let data = moment(evento.data).format('YYYY-MM-DD')
        let prazo = moment(data).add(1, 'month')

        // Se estiver dentro do prazo de 1 mes, insere sugestão
        if (moment(prazo).isSameOrAfter(new Date, 'date')) {
            let request = {
                intervaloDe: moment(data, 'YYYY-MM-DD').add(1, 'day').toDate(),
                intervaloAte:prazo.toDate(),
                perfil_Cognitivo_Id: participacao.perfilCognitivo_Id,
            }
            await lastValueFrom(this.eventoService.getList(request))
                .then(res => {
                    sugestoes = res.filter(aula => {
                        const alunosAtivos = aula.alunos.filter(x => x.active);
                        const alunoNaoEstaNaAula = !alunosAtivos.find(x => x.aluno_Id == participacao.id);
                        const ehAula = aula.evento_Tipo_Id == EventoTipo.Aula || aula.evento_Tipo_Id == EventoTipo.TurmaExtra;
                        const temVagas = alunosAtivos.length < aula.capacidadeMaximaEvento;
                        const ehPerfilCognitivoCompativel = participacao.perfilCognitivo_Id && aula.perfilCognitivo.map(x => x.id).includes(participacao.perfilCognitivo_Id);
                        const aulaNaoFinalizada = !aula.finalizado;
                        const aulaEstaAtiva = aula.active;
                        const naoEhFeriado = !aula.feriado;

                        return alunoNaoEstaNaAula
                            && ehAula
                            && temVagas
                            && ehPerfilCognitivoCompativel
                            && aulaNaoFinalizada
                            && aulaEstaAtiva
                            && naoEhFeriado;
                    });
                })
        }

        let object = this.enviarMensagemFaltaSend(participacao.aluno, participacao.celular!, evento, participacao, sugestoes);
        window.open(object.link, '_blank');
        this.copiarMensagem(object.mensagem);
    }

    enviarMensagemCondicao(aluno: any, id: number) {
        let object = null;

        if (id && aluno && aluno.celular) {
            // Apresentação do Diretor Franqueado 
            if (id == 8) {
                object = this.enviarMensagemApresentacaoDiretorFranqueado(aluno.nome, aluno.celular);
                // Confirmação da adequação do aluno ao perfil da turma 
            } else if (id == 9) {
                object = this.enviarMensagemAdequacaoTurma(aluno.nome, aluno.celular);
                // Agendar 1ª Oficina 
            } else if (id == 12) {
                object = this.enviarMensagemLembreteOficina(aluno.nome, aluno.celular);
                // Feedback pós venda 
            } else if (id == 13) {
                object = this.enviarMensagemFeedbackPosVenda(aluno.nome, aluno.celular);
                // Confirmação de preeechimento do feedback pós venda 
            } else if (id == 32) {
                object = this.enviarMensagemConfirmacaoPreenchimentoFeedbackPosVenda(aluno.nome, aluno.celular);
                // Mensagem de boas-vindas 
            } else if (id == 37) {
                object = this.enviarMensagemBoasVindas(aluno.nome, aluno.celular, aluno.email, aluno.diaSemana, aluno.horario, aluno.professor, aluno.linkGrupo);
                // Agendar Superação 
            } else if (id == 22) {
                object = this.enviarMensagemLembreteSuperacao(aluno.nome, aluno.celular);
                // Agendar 2ª Superação 
            } else if (id == 29) {
                object = this.enviarMensagemLembreteSuperacao(aluno.nome, aluno.celular);
                // Agendar 2ª Oficina 
            } else if (id == 23) {
                object = this.enviarMensagemLembreteOficina(aluno.nome, aluno.celular);
            } else {
                object = this.enviarMensagem(aluno.nome, aluno.celular);
            }
        }

        if (object) {
            window.open(object.link, '_target');
            this.copiarMensagem(object.mensagem);
        }

        return object;
    }

    enviarMensagem(nome: string, celular: string) {
        let array = nome.split(' ');
        nome = array[0];
        celular = celular.replace(/\D/g, '')
        let mensagem = `Olá ${nome}, tudo bem?`;
        let link = `https://wa.me//${celular}?text=${encodeURIComponent(mensagem)}`;
        return {
            link: link,
            mensagem: mensagem
        };
    }

    enviarMensagemFaltaSend(nome: string, celular: string, evento: Evento, participacao: Evento_Participacao_Aluno, sugestoes: Evento[] = []) {
        let array = nome.split(' ');
        nome = array[0];
        celular = celular.replace(/\D/g, '')
        let tipo = this.calendarioUtils.getEventoTipo(evento);
        let data = moment(evento.data).format('DD [de] MMMM [às] HH[h]mm');
        let mensagem = `Olá ${nome}, 
            \r\n Espero que esteja bem!`;

        // cancelado
        if (!evento.active) {
            mensagem += `\r\nInfelizmente precisamos cancelar a ${tipo} do dia ${data}.`
            if (evento.feriado)
                mensagem += `\r\nMotivo: Feriado - ${evento.feriado.name}.`
            else
                mensagem += `\r\nMotivo: ${evento.observacao}.`
        } 
        // falta agendada
        else if (!participacao.active && !participacao.presente) {
            mensagem += `\r\nNotei que você desmarcou a ${tipo} do dia ${data}.`;
        } 
        // faltou
        else if (evento.finalizado && !participacao.presente) {
            mensagem += `\r\nNotei que você não esteve presente na ${tipo} do dia ${data} e gostaria de saber se houve um imprevisto. 
                \r\nImprevistos acontecem e queremos saber se você está enfrentando dificuldades.`;
        }
    
        // era reposicao agendada de um evento ativo
        if (evento.active && participacao.reposicaoDe_Evento_Id) {
            mensagem = `Como essa já era uma reposição de uma outra aula, não será possível agendarmos uma segunda reposição, e por isso estará com falta`;
        }
        // se for aula
        else if (evento.evento_Tipo_Id == EventoTipo.Aula) {
            let prazo = moment(evento.data).add(1, 'months');
            // passou do prazo
            if (moment(new Date).isAfter(prazo, 'date')) {
                mensagem += `\r\nInfelizmente, o prazo de um mês para agendar reposição acabou em ${prazo.format('DD/MM/YY')}.`;
            }
            // está no prazo
            else {
                if (!evento.active && participacao.reposicaoDe_Evento_Id) {
                    mensagem += `\r\nPrecisamos reagendar sua reposição para você não perder o conteúdo. `
                } 
                else {
                    mensagem += `\r\nPrecisamos agendar uma reposição, para você não perder o conteúdo. `
                }
                
                mensagem += `\r\nVocê tem até o dia *${prazo.format('DD/MM/YY')}* para agendar sua reposição.`

                if (sugestoes.length > 0) {
                    mensagem += `\r\n Temos vagas nas seguintes datas para você agendar sua reposição já:`;
                    sugestoes.forEach(sugestao => {
                        let d = moment(sugestao.data).format('DD/MM/YY [às] HH[h]mm');
                        mensagem += `\r\n • ${d} - Turma: ${sugestao.turma}`;
                    })
                }
                mensagem += `\r\n
                    \r\nMe avise o quanto antes sobre sua disponibilidade e agendaremos um horário conveniente para você.
                    \r\n
                    \r\nIremos aguardar sua resposta...`;
            }
                    
        }
        // Oficina
        else if (evento.evento_Tipo_Id == EventoTipo.Oficina) {
            mensagem += `\r\n O não comparecimento sem aviso prévio de 24h resultará no bloqueio da participação em outras oficinas durante o mês corrente.
                \r\n
                \r\nFico à disposição caso precise de algo`;
        }



        let link = `https://wa.me//${celular}?text=${encodeURIComponent(mensagem)}`;
        return {
            link: link,
            mensagem: mensagem
        };
    }

    enviarMensagemAgendamento(nome: string, celular: string, evento: Evento) {
        let array = nome.split(' ');
        nome = array[0];
        celular = celular.replace(/\D/g, '')
        let tipo = this.calendarioUtils.getEventoTipo(evento);
        let data = moment(evento.data).format('DD [de] MMMM [às] HH[h]mm');

        let mensagem = `Olá ${nome}, 
            \r\nEspero que esteja bem!
            \r\nSua ${tipo} foi agendada para o dia ${data}.
            \r\nFico à disposição caso precise de algo antes da ${tipo}.
            \r\n
            \r\nNos vemos em breve! `;
        let link = `https://wa.me//${celular}?text=${encodeURIComponent(mensagem)}`;
        return {
            link: link,
            mensagem: mensagem
        };
    }

    enviarMensagemCancelamento(nome: string, celular: string, evento: Evento) {
        let array = nome.split(' ');
        nome = array[0];
        celular = celular.replace(/\D/g, '')
        let tipo = this.calendarioUtils.getEventoTipo(evento);
        let data = moment(evento.data).format('DD/MM/YY [às] HH[h]mm');
        let mensagem = `Olá ${nome},
            \r\nEspero que esteja bem!
            \r\nInfelizmente sua ${tipo} do dia ${data} foi cancelada devido "${evento.observacao}". 
            \r\n
            \r\nPor favor, me avise sua disponibilidade para que possamos combinar um novo horário.
            \r\n
            \r\nAgradeço pela compreensão!`;
        let link = `https://wa.me//${celular}?text=${encodeURIComponent(mensagem)}`;
        return {
            link: link,
            mensagem: mensagem
        };
    }

    enviarMensagemReposicao(nome: string, celular: string, eventoDe: Evento, eventoPara: Evento) {
        let array = nome.split(' ');
        nome = array[0];
        celular = celular.replace(/\D/g, '')
        let dataDe = moment(eventoDe.data).format('DD/MM/YY [às] HH[h]mm');
        let dataPara = moment(eventoPara.data).format('DD/MM/YY [às] HH[h]mm');

        let mensagem = `Olá ${nome},
            \r\nEspero que esteja bem!
            \r\nSua reposição da aula do dia ${dataDe} está agendada para o dia ${dataPara}.
            \r\n
            \r\nFico à disposição caso precise de algo antes da aula.
            \r\n
            \r\nNos vemos em breve!
        `;
        let link = `https://wa.me//${celular}?text=${encodeURIComponent(mensagem)}`;
        return {
            link: link,
            mensagem: mensagem
        };
    }

    enviarMensagemAgendamentoFalta(nome: string, celular: string, evento: Evento, sugestoes: Evento[]) {
        let array = nome.split(' ');
        nome = array[0];
        celular = celular.replace(/\D/g, '')
        let data = moment(evento.data).format('DD/MM/YY [às] HH[h]mm');
        let dataLimite = moment(evento.data).add(1, 'month').format('DD/MM/YY');
        let semana = evento.semana

        let mensagem = `Olá ${nome},
            \r\nEspero que esteja bem!
            \r\nSua falta do dia ${data} foi registrada.
            \r\n Você terá até o dia ${dataLimite} para participar de uma reposição, caso contrário, perderá por completo o conteúdo da semana ${semana}.
        `;
        if (sugestoes.length > 0) {
            mensagem += `\r\n Temos vagas nas seguintes datas para você agendar sua reposição já:
                    \r\n `;
        }
        sugestoes.forEach(sugestao => {
            let data = moment(sugestao.data).format('DD/MM/YY [às] HH[h]mm');
            mensagem += `\r\n • ${data} - Turma: ${sugestao.turma}`;
        })
        mensagem += `\r\n
                    \r\nMe avise o quanto antes sobre sua disponibilidade e agendaremos um horário conveniente para você.
                    \r\n
                    \r\nIremos aguardar sua resposta...`;

        let link = `https://wa.me//${celular}?text=${encodeURIComponent(mensagem)}`;
        return {
            link: link,
            mensagem: mensagem
        };
    }

    enviarMensagemInscricao(nome: string, celular: string, evento: Evento) {
        let array = nome.split(' ');
        nome = array[0];
        celular = celular.replace(/\D/g, '')
        let tipo = this.calendarioUtils.getEventoTipo(evento);
        let data = moment(evento.data).format('DD [de] MMMM S[às] HH[h]mm');
        let mensagem = `Olá ${nome},
            \r\nEspero que esteja bem!
            \r\nSua inscrição na oficina do dia ${data} foi confirmada.
            \r\n
            \r\nFico à disposição caso precise de algo antes da oficina.
            \r\n
            \r\nNos vemos em breve!
        `;
        let link = `https://wa.me//${celular}?text=${encodeURIComponent(mensagem)}`;
        return {
            link: link,
            mensagem: mensagem
        };
    }

    enviarMensagemFeedbackPosVenda(nome: string, celular: string) {
        let array = nome.split(' ');
        nome = array[0];
        celular = celular.replace(/\D/g, '')
        let mensagem = `Olá ${nome},
           MENSAGEM DE FEEDBACK PÓS VENDA
        `;
        let link = `https://wa.me//${celular}?text=${encodeURIComponent(mensagem)}`;
        return {
            link: link,
            mensagem: mensagem
        };
    }

    enviarMensagemConfirmacaoPreenchimentoFeedbackPosVenda(nome: string, celular: string) {
        let array = nome.split(' ');
        nome = array[0];
        celular = celular.replace(/\D/g, '')
        let mensagem = `Olá ${nome}, 
                        \r\nEspero que esteja bem!
                        \r\nPassando para confirmar se você já conseguiu preencher o formulário que enviamos.
                        \r\nCaso ainda não tenha preenchido, posso te enviar novamente — é rapidinho! 😊
                        \r\n
                        \r\nLink: <Link do formulário>
                        \r\n
                        \r\nFico no aguardo, tá bom?
        `;
        let link = `https://wa.me//${celular}?text=${encodeURIComponent(mensagem)}`;
        return {
            link: link,
            mensagem: mensagem
        };
    }

    enviarMensagemApresentacaoDiretorFranqueado(nome: string, celular: string) {

        let array = nome.split(' ');
        nome = array[0];
        celular = celular.replace(/\D/g, '')
        let mensagem = `Olá ${nome},
           MENSAGEM DE APRESENTACAO DIRETOR FRANQUEADO
        `;
        let link = `https://wa.me//${celular}?text=${encodeURIComponent(mensagem)}`;
        return {
            link: link,
            mensagem: mensagem
        };
    }

    enviarMensagemBoasVindas(nome: string, celular: string, email: string, diaSemana?: number, horario?: any, professor?: string, linkGrupo?: string) {
        horario = horario ? new Date().toISOString().substring(0, 10) + 'T' + horario : undefined;
        let semana = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado",]
        let array = nome.split(' ');
        nome = array[0];
        celular = celular.replace(/\D/g, '')
        let mensagem = `Olá ${nome},
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
        let link = `https://wa.me//${celular}?text=${encodeURIComponent(mensagem)}`;
        return {
            link: link,
            mensagem: mensagem
        };
    }

    enviarMensagemAdequacaoTurma(nome: string, celular: string) {
        let array = nome.split(' ');
        nome = array[0];
        celular = celular.replace(/\D/g, '')
        let mensagem = `Olá ${nome},
                        \r\nEspero que esteja bem!
                        \r\n
                        \r\nQueremos saber como você está se sentindo em relação à sua turma.
                        \r\nEstá tudo indo bem por aí? Há algo em que possamos te ajudar ou melhorar para que sua experiência seja ainda mais positiva?
                        \r\n
                        \r\nConte com a gente! 😊
        `;
        let link = `https://wa.me//${celular}?text=${encodeURIComponent(mensagem)}`;
        return {
            link: link,
            mensagem: mensagem
        };
    }


    enviarMensagemLembreteOficina(nome: string, celular: string, proximaOficina?: Evento) {
        let array = nome.split(' ');
        nome = array[0];
        celular = celular.replace(/\D/g, '')
        let mensagem = `Olá ${nome},
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
        let link = `https://wa.me//${celular}?text=${encodeURIComponent(mensagem)}`;
        return {
            link: link,
            mensagem: mensagem
        };
    }


    enviarMensagemLembreteSuperacao(nome: string, celular: string) {
        let array = nome.split(' ');
        nome = array[0];
        celular = celular.replace(/\D/g, '')
        let mensagem = `Olá ${nome},
            Espero que esteja bem!
            Não se esqueça de agendar sua Superação com a gente.
            
            Essa é uma aula exclusiva, essencial para o desenvolvimento do cérebro e da cognição. Além disso, é uma ótima oportunidade para tirar todas as suas dúvidas com um professor, de forma prática e personalizada.
            Vamos juntos nessa jornada? 💪🙂

            Nos vemos em breve!
        `;
        let link = `https://wa.me//${celular}?text=${encodeURIComponent(mensagem)}`;
        return {
            link: link,
            mensagem: mensagem
        };
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
