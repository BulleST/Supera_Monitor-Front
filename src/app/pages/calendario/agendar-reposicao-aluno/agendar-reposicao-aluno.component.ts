import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, signal, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { lastValueFrom, Subscription } from 'rxjs';
import { CalendarOptions, DatesSetArg, EventClickArg } from '@fullcalendar/core';
import moment from 'moment';
import dayGridPlugin from '@fullcalendar/daygrid';
import multiMonthPlugin from '@fullcalendar/multimonth';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { ToastrService } from 'ngx-toastr';
import { PseudoEvento, ReposicaoAlunoRequest } from '../../../models/reposicao.model';
import { CalendarioRequest } from '../../../models/calendario.model';
import { Evento, EventoTipo } from '../../../models/evento.model';
import { Aluno } from '../../../models/alunos.model';
import { AlunoService } from '../../../services/alunos.service';
import { Crypto, getError, showError } from '../../../utils';
import { EventoService } from '../../../services/evento.service';
import { MensagemWhatsapp } from '../../../utils/mensagem-whatsapp';
import { Evento_Participacao_Aluno } from '../../../models/evento-participacao-aluno.model';
import { ProfessorService } from '../../../services/professor.service';
import { PerfilCognitivo } from '../../../models/perfil-cognitivo.model';
import { Roteiro } from '../../../models/roteiro.model';
import { EventoAulaRequest } from '../../../models/evento-aula.model';
import { MyMap } from '../../../utils/map';
import { RequestResponse } from '../../../helpers/request-response.interface';
import { AlunoRestricaoService } from '../../../services/aluno-restricao.service';
import { Feriado } from '../../../models/feriado.model';
import { TurmaService } from '../../../services/turma.service';
import { CalendarioUtils } from '../../../utils/calendario-utils';
import { playAlert, playSuccess } from '../../../utils/audio';

@Component({
    selector: 'app-agendar-reposicao-aluno',
    standalone: false,
    templateUrl: './agendar-reposicao-aluno.component.html',
    styleUrl: './agendar-reposicao-aluno.component.css',
    providers: [ConfirmationService]
})
export class AgendarReposicaoAlunoComponent implements OnDestroy, AfterViewInit {
    visible: boolean = false;
    loading = false;
    error: string = '';
    subscription: Subscription[] = [];
    legenda: { corLegenda: string, label: string }[] = [];

    selectedAula?: any;
    selectedEvento?: Evento;
    EventoTipo = EventoTipo;

    aluno: Aluno = new Aluno;
    participacao: Evento_Participacao_Aluno = new Evento_Participacao_Aluno;
    evento: Evento = new Evento;
    eventos: Evento[] = [];
    tipoString = '';
    corLegenda: string = '';

    currentTitle: string = '';
    roteiros: Roteiro[] = [];
    loadingRoteiro = false;

    feriados: Feriado[] = [];
    loadingFeriados = false;


    calendarVisible = signal(false);
    calendarioRequest: CalendarioRequest = new CalendarioRequest;
    @ViewChild('fullCalendar') fullCalendar!: FullCalendarComponent;
    calendarioOptions: CalendarOptions = {
        initialView: 'dayGridMonth',
        themeSystem: 'standard',
        locale: 'pt-BR',
        plugins: [
            dayGridPlugin,
            multiMonthPlugin
        ],
        hiddenDays: [0],
        // dayMaxEvents: 3,
        // eventLimit: false,
        height: '600px',
        dayHeaders: true,
        weekends: true,
        expandRows: true,
        editable: false,
        showNonCurrentDates: true,
        headerToolbar: {
            left: '',
            center: '',
            right: ''
        },
        scrollTime: '10:00:00',
        eventStartEditable: false,
        eventDurationEditable: false,
        handleWindowResize: true,
        lazyFetching: true,
        datesSet: this.datesSet.bind(this),
        eventClick: this.eventClick.bind(this),
    }


    constructor(
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private crypto: Crypto,
        private changeDetector: ChangeDetectorRef,
        private alunoService: AlunoService,
        private turmaService: TurmaService,
        private alunoRestricaoService: AlunoRestricaoService,
        private confirmationService: ConfirmationService,
        private toastrService: ToastrService,
        private service: EventoService,
        private mensagemWhatsapp: MensagemWhatsapp,
        private professorService: ProfessorService,
        private calendarioUtils: CalendarioUtils,
    ) {

        var params = this.activatedRoute.params.subscribe(res => {
            if (!res['aluno_id']) {
                this.visible = false;
                this.visibleChange();
            } else {
                this.participacao.aluno_Id = this.crypto.decrypt(res['aluno_id']);
                this.aluno.id = this.participacao.aluno_Id;
                this.loadAluno();
            }
        });
        this.subscription.push(params);

        var evento = this.service.evento.subscribe(res => {
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
                this.tipoString = this.getTipo(this.evento);
                this.participacao = this.evento.alunos.find(x => x.aluno_Id == this.participacao.aluno_Id) as Evento_Participacao_Aluno;
                this.visible = true;
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


    ngAfterViewInit(): void {

    }

    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
    }

    visibleChange() {
        if (!this.visible) {
            var route = ['../../../'];
            this.router.navigate(route, { relativeTo: this.activatedRoute });
        }
    }

    async loadAluno() {
        this.loading = true;
        // this.aluno = await this.alunoService.get(this.participacao.aluno_Id);
        this.aluno = await lastValueFrom(this.alunoService.get(this.participacao.aluno_Id));
        if (!this.aluno) {
            this.visible = false;
            this.visibleChange();
        }

        this.aluno.restricoes = await lastValueFrom(this.alunoRestricaoService.getList(this.participacao.aluno_Id));
        this.aluno.restricoes = this.aluno.restricoes.filter(x => !!x.deactivated)

        this.calendarioRequest.perfil_Cognitivo_Id = this.aluno.perfilCognitivo_Id;

        if (this.aluno.turma_Id) {
            this.corLegenda = (await this.turmaService.get(this.aluno.turma_Id)).corLegenda;
        }

        this.getCalendario();

        this.calendarVisible.update(() => true);
    }

    prev() {
        this.fullCalendar.getApi().prev();
    }

    next() {
        this.fullCalendar.getApi().next();
    }

    async today() {
        this.fullCalendar.getApi().today();

        this.calendarioRequest.intervaloDe = moment(new Date()).startOf('week').toDate();
        this.calendarioRequest.intervaloAte = moment(new Date()).endOf('week').toDate();

        await this.getCalendario();
        this.setCalendario();

    }

    getTipo(e: Evento) {
        return this.calendarioUtils.getEventoTipo(e)
    }


    async getCalendario() {
        this.loading = true;

        this.calendarioRequest.perfil_Cognitivo_Id = this.aluno.perfilCognitivo_Id;

        await lastValueFrom(this.service.calendario(this.calendarioRequest))
            .then(calendarioList => {
                this.eventos = calendarioList
                    .filter(x => [EventoTipo.Aula, EventoTipo.AulaExtra].includes(x.evento_Tipo_Id)
                        && x.active == true
                        && x.finalizado == false
                        && moment(x.data).isSameOrAfter(new Date))

                if (this.calendarioRequest.perfil_Cognitivo_Id) {
                    this.eventos = this.eventos.filter(x => x.perfilCognitivo.map(perfil => perfil.id).includes(this.calendarioRequest.perfil_Cognitivo_Id!));
                }
                
                if (this.aluno.restricaoMobilidade) {
                    this.eventos = this.eventos.filter(x => x.andar == 1);
                }

                this.setCalendario();
                this.setLegenda();
            })
            .catch(res => {
                this.loading = false;
                this.toastrService.error(`Não foi possível carregar calendário.\n ${getError(res)}`);
            })

    }

    setCalendario() {
        this.loading = true;

        var calendar = this.fullCalendar.getApi();
        calendar.removeAllEvents();

        var feriadosDates = this.feriados.map(x => moment(x.date).format('YYYY-MM-DD'));
        var eventos = this.eventos.filter(x => x.active == true
        /* não é feriado */ && feriadosDates.includes(moment(x.data).format('YYYY-MM-DD')) == false
        /* tem vagas disponíveis */ && x.capacidadeMaximaAlunos > x.alunos.length
        /* mesmo perfil do aluno */ && x.perfilCognitivo.map(y => y.id).includes(this.aluno.perfilCognitivo_Id)
        /* aluno não está na aula */ && x.alunos.map(x => x.aluno_Id).includes(this.aluno.id) == false);

        var events = eventos.map(item => {
            var backgroundColor = '#2e2e2e';
            if (item.corLegenda) {
                backgroundColor = item.corLegenda;
            } else if (item.professores && item.professores.length > 0) {
                backgroundColor = item.professores[0].corLegenda;
            }
            var color = this.calendarioUtils.getTextColor(backgroundColor)
            var event: any = {
                id: this.calendarioUtils.eventRandomId(),
                backgroundColor: backgroundColor,
                borderColor: backgroundColor,
                textColor: color,
                title: item.turma ?? item.descricao,
                start: moment(item.data, 'YYYY-MM-DD HH:mm').toDate(),
                end: moment(item.data).add(item.duracaoMinutos, 'minutes').toDate(),
                extendedProps: item,
            }
            return event;
        });

        this.feriados.forEach(item => {
            var evento: any = {
                id: PseudoEvento.EventoId,
                data: moment(item.date).toDate(),
                descricao: item.name,
                evento_Tipo_Id: EventoTipo.Feriado,
                ...item
            };

            var event = {
                id: this.calendarioUtils.eventRandomId(),
                textColor: 'white',
                backgroundColor: 'red',
                borderColor: 'red',
                title: item.name,
                start: moment(item.date).toDate(),
                end: moment(item.date).toDate(),
                allDay: true,
                extendedProps: evento
            }
            events.push(event)
        })
        this.calendarioOptions.events = events;

        this.fullCalendar.getApi().updateSize();
        this.loading = false;
    }
    getPerfilCognitivo(perfilCognitivo: PerfilCognitivo[]) {
        if (!perfilCognitivo || perfilCognitivo.length == 0)
            return '';
        return perfilCognitivo.map(x => x.nome).join(', ');
    }

    async setLegenda() {
        this.legenda = [];
        var professores = this.professorService.list.value;
        if (professores.length == 0)
            await lastValueFrom(this.professorService.getList()).then(res => professores = res);

        this.legenda = professores.map(item => ({
            label: item.nome,
            corLegenda: item.corLegenda,
            ativo: true
        }))
    }

    async datesSet(arg: DatesSetArg) {
        this.currentTitle = moment(arg.view.currentStart).format('MMMM [de] YYYY')

        this.calendarioRequest.intervaloDe = arg.view.currentStart;
        this.calendarioRequest.intervaloAte = arg.view.currentEnd;

        await this.getCalendario();
        await this.loadFeriados();
        this.setCalendario();
    }


    eventClick(e: EventClickArg) {
        var target = e.event.extendedProps as Evento;
        if (!target.feriado) {

            if (target.alunos.length >= target.capacidadeMaximaAlunos) {
                return this.showError('Não autorizado', 'Selecione uma aula com vagas disponíveis.', e.jsEvent)
            }

            if (target.alunos.map(x => x.aluno_Id).includes(this.aluno.id)) {
                return this.showError('Não autorizado', 'Esse aluno já está atribuído a essa aula', e.jsEvent)
            }

            if (target.perfilCognitivo.map(x => x.id).includes(this.aluno.perfilCognitivo_Id) == false) {
                return this.showError('Não autorizado', 'Somente reposições entre alunos de turmas com mesmo perfil cognitivo são permididas.', e.jsEvent);

            }
            if (this.aluno.restricoes.length > 0) {
                var message = `Este aluno possui algumas restrições.<ul class="my-2">`
                this.aluno.restricoes.forEach(item => message += ` <li>    • ${item.descricao}</li>`)
                message += ` </ul>Deseja continuar?`
                this.confirmationService.confirm({
                    target: e.jsEvent.target as EventTarget,
                    message: message,
                    header: 'Atenção',
                    acceptIcon: 'pi pi-check',
                    acceptLabel: 'Continuar',
                    acceptButtonStyleClass: 'p-button-rounded',
                    rejectVisible: true,
                    rejectIcon: 'pi pi-times',
                    rejectLabel: 'Cancelar',
                    rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
                    accept: async () => {
                        setTimeout(() => {
                            this.selecionarEvento(e, target);
                        }, 200);
                    },
                });
            } else {
                setTimeout(() => {
                    this.selecionarEvento(e, target);
                }, 200);
            }
        }
    }

    async loadFeriados() {
        this.loadingFeriados = true;
        var ano = this.calendarioRequest.intervaloDe?.getFullYear();
        await lastValueFrom(this.service.getFeriados(ano))
            .then(res => {
                this.feriados = res;
                this.loadingFeriados = false;
            })
            .catch(res => this.loadingFeriados = false);
    }

    selecionarEvento(e: EventClickArg, target: Evento) {
        console.log(e, target)
        this.confirmationService.confirm({
            target: e.jsEvent.target as EventTarget,
            message: `Selecionar aula do dia <b class="text-primary-500">${moment(target.data).format('DD/MM/YYYY [às] HH[h]mm')}</b> na turma <b>${target.turma}</b> com o professor <b>${target.professor}</b>?`,
            header: 'Selecionar aula',
            acceptIcon: 'pi pi-check',
            acceptLabel: 'Selecionar',
            acceptButtonStyleClass: 'p-button-rounded',
            rejectIcon: 'pi pi-times',
            rejectLabel: 'Cancelar',
            rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
            accept: async () => {
                this.selectedAula = e.event;
                this.selectedEvento = target;
            },
            reject: () => {
                delete this.selectedAula;
                delete this.selectedEvento;
            }
        });
    }


    showError(header: string, message: string, e: any) {
        showError(this.confirmationService, header, message, e);
    }

    sendConfirmation(e: any) {
        // playAlert();

        var target = this.selectedEvento as Evento;
        this.confirmationService.confirm({
            target: e.target,
            message: `Tem certeza que deseja marcar reposição do aluno <b>${this.aluno.nome} </b> do dia <b>${moment(this.evento.data).format('DD/MM/YY [às] HH[h]mm')}</b> para o dia <b class="text-primary-500">${moment(target.data).format('DD/MM/YYYY [às] HH[h]mm')}</b> na turma <b>${target.descricao}</b> com o professor <b>${target.professor}</b>?`,
            header: 'Agendar reposição',
            acceptIcon: 'pi pi-check',
            acceptLabel: 'Agendar',
            acceptButtonStyleClass: 'p-button-rounded',
            rejectIcon: 'pi pi-times',
            rejectLabel: 'Cancelar',
            rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
            accept: () => {
                this.send(target, e)
            },
            reject: () => {
            }
        });
    }


    async send(target: Evento, e: any) {

        this.loading = true;

        var request = new ReposicaoAlunoRequest;
        request.aluno_Id = this.aluno.id;
        request.source_Aula_Id = this.evento.id;
        request.dest_Aula_Id = target.id;
        var response: RequestResponse = { success: true, message: '', object: undefined };


        // Se a aula source não existir, cria a aula
        if (request.source_Aula_Id == PseudoEvento.EventoId) {
            response = await this.requestAulaTurma(this.evento)
            request.source_Aula_Id = response.object.id;
            if (!response.success) {
                return this.showError('Reposição não agendada', `Ocorreu um erro ao agendar reposição. <br> ${response.message}`, e);
            }
        }

        // Se a aula target não existir, cria a aula
        if (request.dest_Aula_Id == PseudoEvento.EventoId) {
            response = await this.requestAulaTurma(target)
            request.dest_Aula_Id = response.object.id;
            if (!response.success) {
                return this.showError('Reposição não agendada', `Ocorreu um erro ao agendar reposição. <br> ${response.message}`, e);
            }
        }

        await lastValueFrom(this.alunoService.reposicao(request))
            .then(res => {
                this.loading = false;
                this.selectedAula = undefined;
                this.service.calendarioReload.emit(this.evento.id);
                // playSuccess();
                this.toastrService.success(`Reposição agendada para o dia ${moment(target.data).format('DD/MM/YYYY [às] HH[h]mm')}`)

                if (this.aluno.celular) {
                    this.sendMensagemAluno(e, target);
                } else {
                    this.visible = false;
                    this.visibleChange();
                }

            })
            .catch(res => {
                this.loading = false;
                this.showError('Erro', `Não foi possível agendar reposição. \n ${getError(res)}`, e)
            })
    }

    requestAulaTurma(evento: Evento) {
        var request: EventoAulaRequest = MyMap(evento, new EventoAulaRequest);
        request.alunos = evento.alunos.map(x => x.aluno_Id);
        request.professores = evento.professor_Id ? [evento.professor_Id] : [];
        request.perfilCognitivo = evento.perfilCognitivo.map(x => x.id);
        request.data = moment(new Date(request.data)).format('YYYY-MM-DD[T]HH:mm') as any;

        return lastValueFrom(this.service.createAulaTurma(request));
    }


    sendMensagemAluno(e: any, evento: any) {
        this.confirmationService.confirm({
            target: e.target,
            message: `Reposição concluída com sucesso. <br> Clique para enviar mensagem de confirmação.`,
            header: 'Enviar whatsapp',
            icon: 'pi pi-whatsapp text-green-500 text-4xl',
            acceptLabel: `Enviar mensagem`,
            acceptIcon: 'pi pi-whatsapp',
            rejectLabel: 'Não enviar',
            acceptButtonStyleClass: 'p-button-rounded p-button-success',
            rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
            accept: () => {
                this.visible = false
                this.visibleChange();
                var url = this.mensagemWhatsapp.enviarMensagemReposicao(this.aluno.nome, this.aluno.celular, evento);
                window.open(url, '_target');
            },
            reject: () => {
                this.visible = false
                this.visibleChange();
            }
        });
    }



}

