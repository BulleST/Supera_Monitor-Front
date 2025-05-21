import { Component, OnChanges, OnDestroy } from '@angular/core';
import { Aluno } from '../../../../../models/alunos.model';
import { Evento, EventoTipo } from '../../../../../models/evento.model';
import { MyMap } from '../../../../../utils/map';
import { lastValueFrom, Subscription } from 'rxjs';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { AlunoService } from '../../../../../services/alunos.service';
import { EventoService } from '../../../../../services/evento.service';
import { TurmaService } from '../../../../../services/turma.service';
import { CalendarioUtils } from '../../../../../utils/calendario-utils';
import { Turma } from '../../../../../models/turma.model';
import { CalendarioRequest } from '../../../../../models/calendario.model';
import moment from 'moment';
import { validaAlunos } from '../../../../../utils/validacao';
import { PseudoEvento, ReposicaoAlunoRequest } from '../../../../../models/reposicao.model';
import { Roteiro } from '../../../../../models/roteiro.model';
import { MensagemWhatsapp } from '../../../../../utils/mensagem-whatsapp';
import { AlunoRestricaoService } from '../../../../../services/aluno-restricao.service';
import { RequestResponse } from '../../../../../helpers/request-response.interface';
import { EventoAulaRequest } from '../../../../../models/evento-aula.model';
import { Feriado } from '../../../../../models/feriado.model';
import { ToastrService } from 'ngx-toastr';
import { getError, showError } from '../../../../../utils';
import { playAlert, playSuccess } from '../../../../../utils/audio';

@Component({
    selector: 'app-reposicao',
    standalone: false,
    templateUrl: './reposicao.component.html',
    styleUrl: './reposicao.component.css',
    providers: [ConfirmationService]
})
export class ReposicaoComponent implements OnDestroy {
    visible: boolean = false;
    loading = false;
    error: string = '';
    subscription: Subscription[] = [];
    observacao = '';


    selectedAluno?: Aluno;
    alunos: Aluno[] = [];
    loadingAlunos = false;

    turmas: Turma[] = [];
    loadingTurmas = false;

    evento!: Evento;
    selectedEventoReposicao?: Evento;
    eventos: Evento[] = [];
    loadingEventos = false;

    roteiros: Roteiro[] = [];
    loadingRoteiros = false;

    feriados: Feriado[] = [];
    loadingFeriados = false;
    feriadoDates: Date[] = [];
    ano: number = new Date().getFullYear();

    constructor(
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private confirmationService: ConfirmationService,
        private alunoService: AlunoService,
        private service: EventoService,
        private turmaService: TurmaService,
        private mensagemWhatsapp: MensagemWhatsapp,
        private calendarioUtils: CalendarioUtils,
        private alunoRestricaoService: AlunoRestricaoService,
        private toastrService: ToastrService,
    ) {

        var params = this.activatedRoute.snapshot.params;
        if (!params['evento_id'] || !params['evento_nome']
            || !['aula'].includes(params['evento_nome'])) {
            this.visible = false;
            this.visibleChange();
            return
        }

        var alunos = this.alunoService.list.subscribe(res => {
            this.alunos = res.filter(x => x.active == true)
            this.setAlunos();
        });
        this.subscription.push(alunos);

        if (this.alunos.length == 0) {
            this.loadingAlunos = true;
            lastValueFrom(this.alunoService.getList())
                .then(res => this.loadingAlunos = false)
                .catch(res => this.loadingAlunos = false);
        }

        var turmas = this.turmaService.list.subscribe(res => this.turmas = res.filter(x => x.active == true));
        this.subscription.push(turmas);

        if (this.turmas.length == 0) {
            this.loadingTurmas = true;
            lastValueFrom(this.turmaService.getList())
                .then(res => this.loadingTurmas = false)
                .catch(res => this.loadingTurmas = false);
        }
        var feriados = this.service.feriados.subscribe(res => {
            this.feriados = res;
            this.feriadoDates = this.feriados.map(x => moment(x.date).toDate());
        });
        this.subscription.push(feriados);

        if (this.feriados.length == 0) {
            this.loadingFeriados = true;
            lastValueFrom(this.service.getFeriados(this.ano))
                .then(res => this.loadingFeriados = false)
                .catch(res => this.loadingFeriados = false);
        }
        var eventos = this.service.eventos.subscribe(res => {
            this.filterEventos(res);
        });
        this.subscription.push(eventos);

        var evento = this.service.evento.subscribe(async res => {
            if (!res) {
                try {
                    var evento = JSON.parse(localStorage.getItem('evento') ?? '')
                    this.service.setEvento(evento)
                }
                catch (e) {
                    this.visible = false;
                    this.visibleChange();
                }
                return;
            }

            if (res) {
                this.evento = res;
                this.visible = true;
                this.verificaDisponibilidade();

                this.setAlunos();

                if (this.evento.roteiro_Id == PseudoEvento.EventoId) {
                    var roteiro = this.roteiros.find(x => moment(this.evento.data).isBetween(x.dataInicio, x.dataFim))
                    this.evento.roteiro_Id = roteiro?.id ?? PseudoEvento.EventoId;
                }
            }
        });
        this.subscription.push(evento);


        setTimeout(() => {
            if (!this.evento) {
                this.visible = false;
                this.visibleChange();
            }
        }, 1000);

    }
    ngOnDestroy(): void {
        this.subscription.forEach(e => e.unsubscribe());
    }

    visibleChange() {
        if (!this.visible) {
            this.router.navigate(['../'], { relativeTo: this.activatedRoute });
        }
    }


    showError(header: string, message: string, e: any) {
        showError(this.confirmationService, header, message, e);
    }

    getCorTurma(turma_Id: number) {
        return this.turmas.find(x => x.id == turma_Id)?.corLegenda ?? ''
    }

    async verificaDisponibilidade() {
        var valid = true;

        this.loadingEventos = true;
        var request: CalendarioRequest = new CalendarioRequest;

        request.intervaloDe = moment(this.evento.data, 'YYYY-MM-DD').toDate();
        request.intervaloAte = moment(this.evento.data, 'YYYY-MM-DD').add(1, 'day').toDate();

        this.loadingEventos = true;
        await lastValueFrom(this.service.calendario(request))
            .then(res => this.loadingEventos = false)
            .catch(res => this.loadingEventos = false);

        this.validaAlunos();

        return valid

    }

    validaAlunos() {
        var data = this.evento.data;
        this.alunos = validaAlunos(data, this.evento.duracaoMinutos, this.alunos, this.eventos, undefined, undefined);
        var alunos = this.evento.alunos.map(x => x.aluno_Id)
        this.alunos = this.alunos.filter(x => alunos.includes(x.id) == false);
    }


    enviarMensagem(aluno: Aluno) {
        return this.mensagemWhatsapp.enviarMensagem(aluno.nome, aluno.celular);
    }

    enviarMensagemAgendamento(aluno: Aluno) {
        var evento = MyMap(this.evento, new Evento)
        evento.evento_Tipo_Id = EventoTipo.AulaExtra;
        return this.mensagemWhatsapp.enviarMensagemAgendamento(aluno.nome, aluno.celular, evento);
    }

    getTipo(e: Evento) {
        return this.calendarioUtils.getEventoTipo(e);
    }

    alunoChanged(e: any) {
        this.validaAlunos();

        if (!this.selectedAluno) {
            this.showError('Selecionar aluno', 'Selecione um aluno para agendar reposição.', e.event);
        }
        else if (this.selectedAluno.disponivel == false) {
            this.showError('Aluno indisponível', 'Você não pode selecionar um aluno indisponível.', e.event);
        } else {
            this.restricoesConfirm(e)
        }
    }

    async restricoesConfirm(e: any) {
        if (this.selectedAluno) {
            this.selectedAluno.restricoes = await lastValueFrom(this.alunoRestricaoService.getList(this.selectedAluno.id));

            if (this.selectedAluno.restricoes.filter(x => x.active).length || this.selectedAluno.restricaoMobilidade) {

                playAlert();

                var message = 'Esse aluno possui as seguintes restrições. <div>';

                if (this.selectedAluno.restricoes.filter(x => x.active).length)
                    message += this.selectedAluno.restricoes.filter(x => x.active).map(x => `<p class="ml-4">• ${x.descricao}</p>`).join('');

                if (this.selectedAluno.restricaoMobilidade) {
                    message += '<p class="font-bold ml-4">• Restrição de mobilidade.</p>'
                }
                message += '</div> <br> Deseja continuar?';


                this.confirmationService.confirm({
                    target: e.target,
                    header: 'Continuar?',
                    message: message,
                    acceptLabel: 'Continuar',
                    rejectLabel: 'Cancelar',
                    acceptButtonStyleClass: 'p-button-rounded mr-0',
                    rejectButtonStyleClass: 'p-button-rounded p-button-text bg-primary-50',
                    accept: () => this.selectEventoConfirm(e),
                    reject: () => this.removeSelection(),
                });
            } else {
                this.selectEventoConfirm(e)
            }
        }
    }

    selectEventoConfirm(e: any) {
        if (this.selectedAluno != undefined) {

            var request: CalendarioRequest = {
                aluno_Id: this.selectedAluno.id,
                intervaloDe: moment(this.evento.data).subtract(1, 'month').toDate(),
                intervaloAte: moment(this.evento.data).add(1, 'month').toDate(),
            }
            this.loadingEventos = true;
            lastValueFrom(this.service.calendario(request))
                .then(res => {

                    this.filterEventos(res);
                    this.loadingEventos = false;
                })
        }

    }

    filterEventos(eventos: Evento[]) {
        var feriadosDates = this.feriadoDates.map(x => moment(x).format('YYYY-MM-DD'));
        this.eventos = eventos;

        /* Apenas eventos do tipo aula */
        this.eventos = this.eventos.filter(evento => [EventoTipo.Aula, EventoTipo.AulaExtra].includes(evento.evento_Tipo_Id));
        /* Apenas aulas não reagendadas */
        this.eventos = this.eventos.filter(evento => !evento.reagendamentoPara_Evento_Id);
        /* Apenas aulas sem presença marcada e sem reposição marcada */
        if (this.selectedAluno) {
            // this.eventos = this.eventos.filter(evento => evento.alunos.find(a => a.aluno_Id == this.selectedAluno.id)
            this.eventos = this.eventos.filter(evento => evento.alunos.find(a => a.aluno_Id == this.selectedAluno!.id
                && a.presente != true
                && !a.reposicaoPara_Evento_Id
                && !a.reposicaoDe_Evento_Id) != undefined);
        }
        /* Apenas aulas instanciadas ou aulas em feriados */
        this.eventos = this.eventos.filter(evento => evento.id != PseudoEvento.EventoId || feriadosDates.includes(moment(evento.data).format('YYYY-MM-DD')));

        this.eventos = this.eventos
            .map(evento => {
                evento.alunos = evento.alunos.filter(x => x.aluno_Id == this.selectedAluno!.id);
                var data = moment(evento.data).format('YYYY-MM-DD')
                evento.feriado = this.feriados.find(x => moment(x.date).format('YYYY-MM-DD') == data);
                return evento;
            });


    }

    setAlunos() {
        if (this.evento && this.alunos.length) {
            var alunosEvento = this.evento.alunos.map(x => x.aluno_Id);
            var perfisEvento = this.evento.perfilCognitivo.map(x => x.id);
            this.alunos = this.alunos.filter(x => perfisEvento.includes(x.perfilCognitivo_Id) && !alunosEvento.includes(x.id));
        }
    }

    sendMensagemAluno(e: any, evento: any) {
        this.confirmationService.confirm({
            target: e.target,
            message: `Reposição concluída com sucesso. <br> Clique para enviar mensagem de confirmação.`,
            header: 'Enviar whatsapp',
            icon: 'pi pi-whatsapp text-green-500 text-4xl',
            acceptLabel: `Enviar mensagem`,
            acceptButtonStyleClass: ' p-button-rounded p-button-success  px-3 mr-0',
            acceptIcon: 'pi pi-whatsapp',
            rejectLabel: 'Não enviar',
            rejectButtonStyleClass: 'p-button-rounded p-button-text',
            accept: () => {
                this.visible = false
                this.visibleChange();
                var url = this.mensagemWhatsapp.enviarMensagemReposicao(this.selectedAluno!.nome, this.selectedAluno!.celular, evento);
                window.open(url, '_target');
            },
            reject: () => {
                this.visible = false
                this.visibleChange();
            }
        });
    }

    removeSelection() {
        delete this.selectedEventoReposicao;
        delete this.selectedAluno;
    }

    sendConfirmation(e: any, form: NgForm) {
        if (form.invalid) {
            return this.showError('Ops!', `Não foi possível salvar! \n Preencha os dados corretamente para continuar`, e);
        } else if (!this.selectedAluno) {
            return this.showError('Selecione um aluno', `Selecione um aluno para salvar.`, e);
        } else if (this.selectedAluno!.disponivel == false) {
            return this.showError('Aluno indisponível', `Você não pode inserir alunos indisponíveis`, e);
        }

        playAlert();

        this.confirmationService.confirm({
            target: e.target,
            message: `Tem certeza que deseja inserir o aluno selecionado nessa aula?`,
            header: `Agendar reposição`,
            acceptIcon: 'pi pi-check',
            acceptLabel: 'Sim',
            acceptButtonStyleClass: 'p-button-rounded  px-3 mr-0',
            rejectVisible: true,
            rejectIcon: 'pi pi-times',
            rejectLabel: 'Cancelar',
            rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
            accept: async () => {
                this.send(e);
            },
            reject: () => {
            }
        });

    }

    async send(e: any) {
        this.loading = true;

        // Salva a aula target no db
        if (this.evento.id == PseudoEvento.EventoId) {
            let response: RequestResponse = await lastValueFrom(this.requestAulaTurma(this.evento));
            this.evento.id = response.object.id;
        }
        // Salva a aula source no db
        if (this.selectedEventoReposicao!.id == PseudoEvento.EventoId) {
            let response: RequestResponse = await lastValueFrom(this.requestAulaTurma(this.selectedEventoReposicao as Evento));
            this.selectedEventoReposicao!.id = response.object.id;
        }


        var request = new ReposicaoAlunoRequest;
        request.aluno_Id = this.selectedAluno!.id;
        request.source_Aula_Id = this.selectedEventoReposicao!.id;
        request.dest_Aula_Id = this.evento.id;
        request.observacoes = this.observacao;

        await lastValueFrom(this.alunoService.reposicao(request))
            .then(res => {
                this.loading = false;
                this.service.calendarioReload.emit(0);
                this.visible = false;
                this.visibleChange();

                playSuccess();

                this.toastrService.success(`Reposição agendada para o dia ${moment(this.evento.data).format('DD/MM/YYYY [às] HH[h]mm')}`)

                lastValueFrom(this.service.get(this.evento.id))
                    .then(async res => {
                        this.evento = res;

                        if (this.evento.alunos && this.evento.alunos.length) {
                            if (this.evento.reagendamentoDe_Evento_Id) {
                                this.evento.reagendamentoDe_Evento = await lastValueFrom(this.service.get(this.evento.reagendamentoDe_Evento_Id))
                            }
                            this.evento.alunos.map(async aluno => {
                                if (aluno.reposicaoDe_Evento_Id) {
                                    aluno.reposicaoDe_Evento = await lastValueFrom(this.service.get(aluno.reposicaoDe_Evento_Id))
                                }
                                if (aluno.reposicaoPara_Evento_Id) {
                                    aluno.reposicaoPara_Evento = await lastValueFrom(this.service.get(aluno.reposicaoPara_Evento_Id))
                                }
                                return aluno;
                            })
                        }

                        this.service.setEvento(this.evento);

                    })


                if (this.selectedAluno!.celular) {
                    this.sendMensagemAluno(e, this.evento);
                }

            })
            .catch(res => {
                this.loading = false;
                this.showError('Ocorreu um erro', `Não foi possível agendar reposição. \n ${getError(res)}`, e)
            })
    }

    requestAulaTurma(evento: Evento) {
        var request: EventoAulaRequest = MyMap(evento, new EventoAulaRequest);

        request.data = moment(evento.data).toDate();
        request.alunos = evento.alunos.map(x => x.aluno_Id);
        request.professores = evento.professor_Id ? [evento.professor_Id] : [];
        request.perfilCognitivo = evento.perfilCognitivo.map(x => x.id);

        return this.service.createAulaTurma(request);
    }
}
