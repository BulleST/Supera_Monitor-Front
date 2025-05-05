import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, OnDestroy, signal, ViewChild } from '@angular/core';
import { Evento, EventoTipo } from '../../models/evento.model';
import { CalendarOptions, DatesSetArg, EventAddArg, EventApi, EventHoveringArg, EventSourceInput } from '@fullcalendar/core';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { CalendarioRequest, CalendarioView, loadingEvents } from '../../models/calendario.model';
import { MobileService, ScreenWidth } from '../../utils/mobile';
import { PerfilCognitivo } from '../../models/perfil-cognitivo.model';
import { Router } from '@angular/router';
import { lastValueFrom, Subscription } from 'rxjs';
import { SelectedEventoComponent } from './selected-evento/selected-evento.component';
import { Roteiro } from '../../models/roteiro.model';
import { getError, Header } from '../../utils';
import { AlunoService } from '../../services/alunos.service';
import { AccountService } from '../../services/account.service';
import { RoteiroService } from '../../services/roteiro.service';
import { ToastrService } from 'ngx-toastr';
import { AccountResponse } from '../../models/account.model';
import { Evento_Participacao_Aluno } from '../../models/evento-participacao-aluno.model';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { EventoService } from '../../services/evento.service';
import { ProfessorService } from '../../services/professor.service';
import { PseudoEvento, ReposicaoAlunoRequest } from '../../models/reposicao.model';
import { EventoAulaRequest } from '../../models/evento-aula.model';
import { MyMap } from '../../utils/map';
import { RequestResponse } from '../../helpers/request-response.interface';
import { MensagemWhatsapp } from '../../utils/mensagem-whatsapp';
import { AlunoRestricaoService } from '../../services/aluno-restricao.service';
import { Feriado } from '../../models/feriado.model';

import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import multiMonthPlugin from '@fullcalendar/multimonth';
import listPlugin from '@fullcalendar/list';
import moment from 'moment';
import 'moment/locale/pt-br';
import $ from 'jquery'
import html2canvas from 'html2canvas';
import domtoimage from 'dom-to-image';
import fitty from 'fitty';


@Component({
    selector: 'app-calendario',
    standalone: false,
    templateUrl: './calendario.component.html',
    styleUrl: './calendario.component.css',
    providers: [ConfirmationService],
    // changeDetection: ChangeDetectionStrategy.OnPush,

})
export class CalendarioComponent implements OnDestroy, AfterViewInit {
    subscription: Subscription[] = [];
    screen: ScreenWidth = ScreenWidth.lg;
    ScreenWidth = ScreenWidth;
    todaydate = new Date;
    EventoTipo = EventoTipo;
    PseudoEvento = PseudoEvento;
    eventos: Evento[] = [];
    selectedAluno?: Evento_Participacao_Aluno;
    selectedEvento?: Evento;
    cdkEventItensId: string[] = [];
    legenda: { label: string, corLegenda: string, ativo: boolean }[] = [];
    loading = false;
    headerOpen = true;
    account?: AccountResponse;
    data = new Date;
    minData = new Date(2025, 0, 1);
    observacaoReposicao: string = '';
    agendarMenuItem: MenuItem[] = [
        {
            label: 'Aula 0',
            routerLink: 'calendario/aula-zero/agendar',
            command: () => {
                var evento = new Evento;
                evento.evento_Tipo_Id = EventoTipo.AulaZero;
                this.service.setEvento(evento);
            }
        },
        {
            label: 'Aula Extra',
            routerLink: 'calendario/aula-extra/agendar',
            command: () => {
                var evento = new Evento;
                evento.evento_Tipo_Id = EventoTipo.AulaExtra;
                this.service.setEvento(evento);
            }
        },
        {
            label: 'Superação',
            routerLink: 'calendario/superacao/agendar',
            command: () => {
                var evento = new Evento;
                evento.evento_Tipo_Id = EventoTipo.Superacao;
                this.service.setEvento(evento);
            }
        },
        {
            label: 'Oficina',
            routerLink: 'calendario/oficina/agendar',
            command: () => {
                var evento = new Evento;
                evento.evento_Tipo_Id = EventoTipo.Oficina;
                this.service.setEvento(evento);
            }
        },
        {
            label: 'Reunião',
            routerLink: 'calendario/reuniao/agendar',
            command: () => {
                var evento = new Evento;
                evento.evento_Tipo_Id = EventoTipo.Reuniao;
                this.service.setEvento(evento);
            }
        },
    ];

    @ViewChild('fullCalendar') fullCalendar!: FullCalendarComponent;
    @ViewChild('popoverComponent') popoverComponent!: SelectedEventoComponent;

    feriados: Feriado[] = [];
    loadingFeriados = false;

    currentRoteiro?: Roteiro;
    roteiros: Roteiro[] = [];
    loadingRoteiro = false;

    dayView = false;
    currentTitle = '';
    cdkDragCancel = false;
    viewMenu: MenuItem[] = [];
    view: CalendarioView = CalendarioView.MeuCalendario;
    currentEvents = signal<EventApi[]>([]);
    calendarVisible = signal(false);
    calendarioRequest: CalendarioRequest = new CalendarioRequest;
    calendarioOptions: CalendarOptions = {
        initialView: 'timeGridWeek',
        themeSystem: 'standard',
        locale: 'pt-BR',
        plugins: [
            dayGridPlugin,
            interactionPlugin,
            timeGridPlugin,
            listPlugin,
            multiMonthPlugin
        ],
        hiddenDays: [0],
        dayHeaders: true,
        weekends: true,
        weekNumbers: false,
        expandRows: true,
        editable: false,
        selectable: false,
        showNonCurrentDates: true,
        // defaultAllDay: false,
        // allDaySlot: false,
        headerToolbar: {
            left: '',
            center: '',
            right: ''
        },
        nowIndicator: true,
        dayMaxEvents: true,
        events: [],
        scrollTime: '09:00:00',
        scrollTimeReset: false,
        eventStartEditable: false,
        eventDurationEditable: false,
        handleWindowResize: false,
        // height: 'calc(100vh - 260px)',
        // height: 'calc(100vh - 160px)',
        buttonText: {
            today: 'hoje'
        },
        slotDuration: '00:30:00',
        slotLabelFormat: {
            hour: 'numeric',
            minute: '2-digit',
            omitZeroMinute: true,
            meridiem: 'short'
        },
        lazyFetching: true,
        datesSet: this.datesSet.bind(this),
        dateClick: this.dateClick.bind(this),
        eventsSet: this.events.bind(this),
        // eventMouseEnter: this.eventMouseEnter.bind(this),
        // eventMouseLeave: this.eventMouseLeave.bind(this),

    }

    constructor(
        private router: Router,
        private changeDetector: ChangeDetectorRef,
        private confirmationService: ConfirmationService,
        private header: Header,
        private service: EventoService,
        private alunoService: AlunoService,
        private alunoRestricaoService: AlunoRestricaoService,
        private professorService: ProfessorService,
        private accountService: AccountService,
        private roteiroService: RoteiroService,
        private mobileService: MobileService,
        private toastrService: ToastrService,
        private mensagemWhatsapp: MensagemWhatsapp,

    ) {
        this.setView();
        var screen = this.mobileService.get().subscribe(res => {
            this.screen = res;
            if (this.fullCalendar) {
                this.fullCalendar.getApi().updateSize();
            }
        });
        this.subscription.push(screen);


        var open = this.header.menuAsideOpen.subscribe(res => {
            this.headerOpen = res;
            if (this.fullCalendar) {
                this.fullCalendar.getApi().updateSize();
            }
        });
        this.subscription.push(open);

        var account = this.accountService.account.subscribe(res => this.account = res);
        this.subscription.push(account);

        var roteiros = this.roteiroService.list.subscribe(res => this.roteiros = res);
        this.subscription.push(roteiros);

        var calendarioReload = this.service.calendarioReload.subscribe(res => this.update('calenadrioReload'));
        this.subscription.push(calendarioReload);

        var calendarView = this.service.calendarView.subscribe(async view => {
            if (view == CalendarioView.MeuCalendario) {
                this.calendarioRequest.professor_Id = this.account?.professor_Id;
                this.eventos = [];
            } else {
                this.calendarioRequest.professor_Id = undefined
            }
        })
        this.subscription.push(calendarView);

        this.setLegenda();


        this.calendarioRequest.intervaloDe = moment(new Date).startOf('week').toDate();
        this.calendarioRequest.intervaloAte = moment(new Date).endOf('week').toDate();


    }
    ngOnDestroy(): void {
        this.subscription.forEach(e => e.unsubscribe());
    }

    ngAfterViewInit(): void {
        // this.getCalendario('ngAfterViewInit');
        // this.loadFeriados();
        this.loadRoteiros('ngAfterViewInit');
    }

    async update(where: string) {
        this.unselectAula();

        this.loadRoteiros('update');
        await this.getCalendario('update');
        await this.loadFeriados();
        this.setCalendario();
    }

    prev() {
        this.fullCalendar.getApi().prev();
        this.unselectAula();
        this.data = this.fullCalendar.getApi().getDate();
    }

    next() {
        this.fullCalendar.getApi().next();
        this.unselectAula();
        this.data = this.fullCalendar.getApi().getDate();
    }

    async today() {
        this.fullCalendar.getApi().today();
        this.unselectAula();
        this.data = new Date();

        this.calendarioRequest.intervaloDe = moment(this.data).startOf('week').toDate();
        this.calendarioRequest.intervaloAte = moment(this.data).endOf('week').toDate();

        await this.getCalendario('datesSet');
        this.setCalendario();
    }

    setView() {
        this.viewMenu = [
            {
                label: 'Meu Calendário',
                value: CalendarioView.MeuCalendario,
                icon: 'pi pi-user',
            },
            {
                label: 'Calendário Geral',
                value: CalendarioView.Geral,
                icon: 'pi pi-calendar',
            }
        ]
    }

    async calendarViewChanged() {
        this.service.calendarView.next(this.view);
        if (this.view == CalendarioView.MeuCalendario) {
            this.calendarioRequest.professor_Id = this.account?.professor_Id;
            this.eventos = [];
        } else {
            this.calendarioRequest.professor_Id = undefined
        }
        await this.getCalendario('calendarViewChanged');
        this.setCalendario();
    }

    dataSelect() {
        // Se for exibição diária
        if (this.dayView) {
            this.calendarioRequest.intervaloDe = this.data;
            this.fullCalendar.getApi().gotoDate(this.calendarioRequest.intervaloDe);
            this.currentRoteiro = this.roteiros.find(x => moment(this.calendarioRequest.intervaloDe).isBetween(x.dataInicio, x.dataFim))
        }
        // Se for exibição da semana
        else {
            if (moment(this.data).week() != moment(this.calendarioRequest.intervaloDe).week()) {
                this.calendarioRequest.intervaloDe = moment(this.data).day(1).toDate();
                this.calendarioRequest.intervaloAte = moment(this.calendarioRequest.intervaloDe).add(7, 'days').toDate();
                this.fullCalendar.getApi().gotoDate(this.calendarioRequest.intervaloDe);
                this.currentRoteiro = this.roteiros.find(x => moment(this.calendarioRequest.intervaloDe).isBetween(x.dataInicio, x.dataFim))
            }
        }
    }

    roteiroChanged() {
        if (this.currentRoteiro) {
            if (moment(this.currentRoteiro.dataInicio).week() != moment(this.calendarioRequest.intervaloDe).week()) {
                this.data = this.currentRoteiro.dataInicio;
                this.calendarioRequest.intervaloDe = moment(this.data).day(1).toDate();
                this.fullCalendar.getApi().gotoDate(this.calendarioRequest.intervaloDe);
            }
        }
    }

    eventRamdomId() {
        let length = 5;
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        let counter = 0;
        while (counter < length) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
            counter += 1;
        }
        return result;
    }

    async getCalendario(where: string) {
        this.loading = true;

        this.calendarVisible.update(() => true);

        await lastValueFrom(this.service.calendario(this.calendarioRequest))
            .then(list => {
                this.eventos = list;
                this.loading = false;
            })
            .catch(res => {
                this.loading = false;
                this.toastrService.error(`Não foi possível carregar calendário. \n ${getError(res)}`);
            })
    }

    setCalendario() {
        this.loading = true;
        this.cdkEventItensId = [];

        var calendar = this.fullCalendar.getApi();
        calendar.removeAllEvents();


        var feriadosDates = this.feriados.map(x => moment(x.date).format('YYYY-MM-DD'));
        var eventos = this.eventos.filter(x => x.active == true /*&& feriadosDates.includes(moment(x.data).format('YYYY-MM-DD')) == false  */);

        var events = eventos.map(item => {
            var backgroundColor = '#2e2e2e';
            if (item.corLegenda) {
                backgroundColor = item.corLegenda
            }
            else if (item.evento_Tipo_Id == EventoTipo.Reuniao) {
                backgroundColor = '#f37435' // primary color
            }
            else if (item.professores && item.professores.length > 0) {
                backgroundColor = item.professores[0].corLegenda;
            }
            var color = this.getForeColor(backgroundColor)
            var event: any = {
                id: this.eventRamdomId(),
                backgroundColor: backgroundColor,
                borderColor: backgroundColor,
                foreColor: color,
                title: item.turma ?? item.descricao,
                start: moment(item.data, 'YYYY-MM-DD HH:mm').toDate(),
                end: this.addHours(moment(item.data, 'YYYY-MM-DD HH:mm').toDate(), 2),
                extendedProps: item,
            }
            return event;
        });

        this.feriados.forEach(item => {
            var event = {
                id: this.eventRamdomId(),
                foreColor: 'white',
                backgroundColor: 'red',
                borderColor: 'red',
                title: item.name,
                start: moment(item.date).toDate(),
                end: moment(item.date).toDate(),
                allDay: true,
                extendedProps: item,
                feriado: true,
            }
            events.push(event)
        })
        this.calendarioOptions.events = events;

        this.cdkEventItensId = this.calendarioOptions.events
            .filter((x: any) => [EventoTipo.Aula, EventoTipo.AulaExtra].includes(x.extendedProps.evento_Tipo_Id))
            .map(x => 'event-' + x.id)
        this.fullCalendar.getApi().updateSize();
        this.loading = false;

        // this.htmlToImage();
    }

    addHours(data: Date, h: number) {
        data.setTime(data.getTime() + (h * 60 * 60 * 1000));
        return data;
    }

    getDateWeek(date: Date, inicioAnoLetivo: Date) {
        const currentDate = (typeof date === 'object') ? date : new Date();
        inicioAnoLetivo = new Date(currentDate.getFullYear(), 0, 15);
        const daysToNextMonday = (inicioAnoLetivo.getDay() === 1) ? 0 : (7 - inicioAnoLetivo.getDay()) % 7;
        const nextMonday = new Date(currentDate.getFullYear(), 0, inicioAnoLetivo.getDate() + daysToNextMonday);

        return (currentDate < nextMonday) ? 52 : (currentDate > nextMonday ? Math.ceil((currentDate.valueOf() - nextMonday.valueOf()) / (24 * 3600 * 1000) / 7) : 1);
    }


    getForeColor(hex: string) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        var rgb = result ? {
            r: parseInt(result[1], 16), g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : {
            r: 0,
            g: 0,
            b: 0
        };
        return (rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114) > 180 ? '#2e2e2e' : '#fff';
    }


    async datesSet(arg: DatesSetArg) {
        this.loading = true;

        this.currentTitle = moment(arg.start).locale('pt').format('MMMM [de] YYYY');
        this.currentTitle = this.currentTitle[0].toUpperCase() + this.currentTitle.substring(1);

        this.getTemaSemana(arg);

        this.calendarioRequest.intervaloDe = arg.view.currentStart;
        this.calendarioRequest.intervaloAte = arg.view.currentEnd;
        await this.getCalendario('datesset');
        await this.loadFeriados();
        this.setCalendario();


    }

    dateClick(e: DateClickArg) {
        this.selectedEvento = undefined;
    }
    async selectEvento(e: any, item: Evento/**, component: SelectedEventoComponent */) {
        this.popoverComponent.hidePopover();
        item = JSON.parse(JSON.stringify(item));
        if (item.reagendamentoDe_Evento_Id && !item.reagendamentoDe_Evento) {
            await lastValueFrom(this.service.get(item.reagendamentoDe_Evento_Id))
                .then(res => {
                    item.reagendamentoDe_Evento = res;
                })
        }

        this.selectedEvento = item;
        this.popoverComponent.evento = item;
        this.popoverComponent.showPopover(e);

    }

    unselectAula() {
        this.selectedEvento = undefined;
        this.popoverComponent.evento = undefined;
        this.popoverComponent.hidePopover();
    }


    eventMouseEnter(e: EventHoveringArg) {
        $('.fc-event-hover-placeholder').remove()
        if (!this.loading) {
            $('body').append(`<div id="event-placeholder-${e.event.id}" 
                                        class="fc-event-hover-placeholder text-white fixed z-2 fadein animation-duration-200 w-15rem"
                                        style="bottom: 20px; left: 40px; " >
                                    ${e.el.outerHTML}
                                </div>`)
        }

    }
    eventMouseLeave(e: EventHoveringArg) {
        $('.fc-event-hover-placeholder').remove()
    }

    cdkCancelDrag(where: string) {
        this.cdkDragCancel = true;
        this.cdkEventItensId.forEach(id => {
            $('#' + id).parents('.fc-event').removeClass('scalein animation-duration-200 animation-iteration-1')
            $('#' + id).parents('.fc-event').removeClass('sshadow-2 border-3 border-red-500')
        })
    }

    async cdkDrop(event: CdkDragDrop<Evento_Participacao_Aluno[]>, target: Evento) {
        if (this.cdkDragCancel) return;
        if (!this.selectedEvento) return;


        if (event.previousContainer != event.container) {

            var source = this.selectedEvento;
            var aluno = event.item.data as Evento_Participacao_Aluno;
            if (target.alunos.length >= target.capacidadeMaximaAlunos) {
                document.dispatchEvent(new Event('mouseup'));
                this.cdkCancelDrag('keyup');
                return this.showError('Não autorizado', 'Essa aula atingiu o limite permitido de alunos.', event.event);
            }

            if (target.perfilCognitivo.map(x => x.id).includes(aluno.perfilCognitivo_Id) == false) {
                document.dispatchEvent(new Event('mouseup'));
                this.cdkCancelDrag('keyup')
                return this.showError('Não autorizado', 'Somente reposições entre alunos de turmas com mesmo perfil cognitivo são permididas.', event.event);
            }

            if (target.alunos.find(x => x.aluno_Id == aluno.aluno_Id)) {
                document.dispatchEvent(new Event('mouseup'));
                this.cdkCancelDrag('keyup')
                return this.showError('Não autorizado', 'Esse aluno já está atribuído à essa aula', event.event);
            }

            if (target.finalizado) {
                document.dispatchEvent(new Event('mouseup'));
                this.cdkCancelDrag('keyup')
                return this.showError('Não autorizado', 'Essa aula já foi finalizada', event.event);
            }

            if (target.data != source.data) {

                var restricoes = await lastValueFrom(this.alunoRestricaoService.getList(aluno.aluno_Id));
                restricoes = restricoes.filter(x => !x.deactivated)
                if (restricoes.length > 0) {
                    this.confirmationService.confirm({
                        target: event.event.target as EventTarget,
                        message: `Este aluno possui algumas restrições. <br> 
                                    <ul>
                                        ${restricoes.map(x => `<li>${x.descricao}</li>`)}
                                    </ul>
                                    <br>
                                    Deseja continuarl?`,
                        header: 'Atenção',
                        icon: 'pi pi-exclamation-triangle',
                        acceptIcon: 'pi pi-check',
                        acceptLabel: 'Continuar',
                        acceptButtonStyleClass: 'p-button-rounded p-button-sm px-3 mr-0',
                        rejectVisible: true,
                        rejectIcon: 'pi pi-times',
                        rejectLabel: 'Cancelar',
                        rejectButtonStyleClass: 'p-button-rounded p-button-sm p-button-outlined',
                        accept: async () => {
                            this.agendaReposicaoConffirm(event.event, aluno, source, target);
                            this.cdkCancelDrag('keyup')
                        },
                        reject: () => {
                            this.cdkCancelDrag('keyup')
                        }
                    });
                } else {
                    this.agendaReposicaoConffirm(event.event, aluno, source, target);
                }
            }
        }
    }

    @HostListener('window:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            document.dispatchEvent(new Event('mouseup'));
            this.cdkCancelDrag('keyup')
        }
    }

    events(events: EventApi[]) {
        this.currentEvents.set(events);
        this.changeDetector.detectChanges(); // workaround for pressionChangedAfterItHasBeenCheckedError
    }

    showError(header: string, message: string, e: any) {
        this.confirmationService.confirm({
            target: e.target ?? e,
            message: message,
            header: header,
            icon: 'pi pi-times-circle text-2xl -mr-2 text-red-500 text-red-500',
            acceptLabel: 'OK',
            acceptButtonStyleClass: 'p-button-sm p-button-rounded  px-3 mr-0',
            acceptIcon: '',
            rejectVisible: false,
        })
    }

    agendaReposicaoConffirm(e: any, aluno: Evento_Participacao_Aluno, source: Evento, target: Evento) {
        this.confirmationService.confirm({
            key: 'agendarReposicao',
            message: `Agendar reposição do aluno(a) <b>${aluno.aluno}</b> para o dia ${moment(target.data).format('DD/MM/YYYY [às] HH[h]mm')}?`,
            header: 'Agendar reposição',
            acceptIcon: 'pi pi-check',
            acceptLabel: 'Agendar',
            acceptButtonStyleClass: 'p-button-rounded p-button-sm px-3 mr-0',
            rejectVisible: true,
            rejectIcon: 'pi pi-times',
            rejectLabel: 'Cancelar',
            rejectButtonStyleClass: 'p-button-rounded p-button-sm p-button-outlined',
            accept: async () => {
                this.agendaReposicao(e, aluno, source, target);
                this.cdkCancelDrag('keyup')
            },
            reject: () => {
                this.cdkCancelDrag('keyup')
            }
        });
    }

    async agendaReposicao(e: any, aluno: Evento_Participacao_Aluno, source: Evento, target: Evento) {
        this.loading = true;

        var request = new ReposicaoAlunoRequest;
        request.aluno_Id = aluno.aluno_Id;
        request.source_Aula_Id = source.id;
        request.dest_Aula_Id = target.id;
        request.observacoes = this.observacaoReposicao;
        var response: RequestResponse = { success: true, message: '', object: undefined };

        // Se a aula source não existir, cria a aula
        if (request.source_Aula_Id == PseudoEvento.EventoId) {
            response = await this.requestAulaTurma(source)
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
                this.selectedAluno = undefined;
                this.service.calendarioReload.emit(source.id);
                this.unselectAula();
                this.toastrService.success(`Reposição agendada para o dia ${moment(target.data).format('DD/MM/YYYY [às] HH[h]mm')}`)

                this.sendMensagemAluno(e, target, aluno);

                this.observacaoReposicao = '';

            })
            .catch(res => {
                this.loading = false;
                this.showError('Ocorreu um erro', `Não foi possível agendar reposição. \n ${getError(res)}`, e)
            })
    }

    requestAulaTurma(evento: Evento) {
        var request: EventoAulaRequest = MyMap(evento, new EventoAulaRequest);
        request.alunos = evento.alunos.map(x => x.aluno_Id);
        request.professores = evento.professor_Id ? [evento.professor_Id] : [];
        request.perfilCognitivo = evento.perfilCognitivo.map(x => x.id);

        return lastValueFrom(this.service.createAulaTurma(request));
    }

    sendMensagemAluno(e: any, evento: any, aluno: Evento_Participacao_Aluno) {
        if (aluno.celular) {
            this.confirmationService.confirm({
                target: e.target,
                message: `Reposição agendada com sucesso. <br> Clique para enviar mensagem de confirmação.`,
                header: 'Enviar whatsapp',
                icon: 'pi pi-whatsapp text-green-500 text-4xl',
                acceptLabel: `Enviar mensagem`,
                acceptButtonStyleClass: 'p-button-sm p-button-rounded p-button-success  px-3 mr-0',
                acceptIcon: 'pi pi-whatsapp',
                rejectLabel: 'Não enviar',
                rejectButtonStyleClass: 'p-button-text p-button-sm',
                accept: () => {
                    var url = this.mensagemWhatsapp.enviarMensagemReposicao(aluno.aluno, aluno.celular!, evento);
                    window.open(url, '_target');
                },
            });
        }
    }


    touchStartX: number = 0;
    touchStartY: number = 0;
    touchEndX: number = 0;
    touchEndY: number = 0;

    touchStart(e: any) {
        this.touchStartX = e.changedTouches[0].screenX;
        this.touchStartY = e.changedTouches[0].screenY;
    }

    touchEnd(e: any) {
        this.touchEndX = e.changedTouches[0].screenX;
        this.touchEndY = e.changedTouches[0].screenY;
        this.handleGesture();
    }

    handleGesture() {
        if (this.touchEndX < this.touchStartX && this.touchEndX < 501) // Swiped Left
            this.next();

        if (this.touchEndX > this.touchStartX && this.touchEndX > 399)  // Swiped Right
            this.prev();

        // if (this.touchEndY < this.touchStartY) // Swiped Up
        // if (this.touchEndY > this.touchStartY) // Swiped Down
        // if (this.touchEndY === this.touchStartY) // Tap
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

    getPerfilCognitivo(perfilCognitivo: PerfilCognitivo[]) {
        if (!perfilCognitivo || perfilCognitivo.length == 0)
            return '';
        return perfilCognitivo.map(x => x.nome).join(', ');
    }

    async getTemaSemana(arg: any) {
        var data = moment(arg.start, 'DD-MM-YYYY').toDate();
        var existe = this.roteiros.find(x => moment(data).isSameOrAfter(x.dataInicio) && moment(data).isSameOrBefore(x.dataFim));
        this.currentRoteiro = existe;
    }

    agendarEvento(item: MenuItem, e: any) {
        this.router.navigateByUrl(item.routerLink);
        if (item.command)
            item.command(e);
    }

    calendarChanged() {
        this.dayView = !this.dayView;
        if (this.dayView) {
            this.fullCalendar.getApi().changeView('dayGridDay')
        } else {
            this.fullCalendar.getApi().changeView('timeGridWeek')
        }
    }

    loadRoteiros(where: string) {
        this.loadingRoteiro = true;
        lastValueFrom(this.roteiroService.getList('loadRoteiros'))
            .then(res => {
                this.loadingRoteiro = false;
                this.roteiros = res;
            })
            .catch(res => this.loadingRoteiro = false)

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

    event(evento: Evento) {
        var html = ``;
        switch (evento.evento_Tipo_Id) {
            case EventoTipo.Aula:
                html = this.eventAula(evento);
                break;
        }
    }
    eventAula(evento: Evento): string {
        return '';
    }
    eventSuperacao(evento: Evento): string {
        return '';
    }
    eventAula0(evento: Evento): string {
        return '';
    }
    eventReuniao(evento: Evento): string {
        return `
            
                <div class="w-full h-full flex flex-column flex-1 p-1 border-2 cursor-pointer" style="background-color: rgb(243, 116, 53); border-color: rgb(243, 116, 53); color: rgb(255, 255, 255);">
                    <header>
                        <div class="event-header">
                            <i class="pi pi-clock text-xs"></i>
                            <span class="text-xs">12:00</span>
                        </div>
                    </header>
                    <div class="flex align-items-center my-auto gap-2 w-full" style="height: 3rem;">
                        <div class="text-base font-bold overflow-hidden w-full h-full mb-auto flex">
                            <p class="my-auto">Reunião Geral</p>
                        </div>
                    </div>
                    <div class="flex align-items-start justify-content-between flex-nowrap h-1rem">
                    </div>
                </div>
        
        `;
    }
    eventOficina(evento: Evento): string {
        return '';
    }
    async htmlToImage() {
        var div = document.createElement('div');
        $(div).append(`
                <div class="event" style="background-color: rgb(243, 116, 53); border-color: rgb(243, 116, 53); color: rgb(255, 255, 255);">
                    <header>
                        <div class="event-header">
                            <i class="pi pi-clock text-xs"></i>
                            <span class="text-xs">12:00</span>
                        </div>
                    </header>
                    <div class="event-body" style="height: 3rem;">
                        <div class="text-base font-bold overflow-hidden w-full h-full mb-auto flex">
                            <p class="my-auto">Reunião Geral</p>
                        </div>
                    </div>
                    <div class="event-footer"></div>
                </div>`)

        console.log(div)

        document.body.appendChild(div)


        // domtoimage.toPng(div)
        // .then(function (dataUrl: any) {
        //     console.log('dataUrl', dataUrl)
        //     var img = new Image();
        //     img.src = dataUrl;
        //     document.body.appendChild(img);
        // })
        // .catch(function (error: any) {
        //     console.error('oops, something went wrong!', error);
        // });

        await html2canvas(div, { scale: 3 })
            .then(canvas => {
                console.log('canvas', canvas);
                const imagem = canvas.toDataURL('image/jpeg');
                console.log('imagem', imagem);
                const novaAba = window.open();
                if (novaAba) novaAba.document.write(`<img src="${imagem}" />`);
            })
    }


    setHorario(data: Date) {
        data = moment(data).toDate();
        // console.log('data', data)
        if (data.getMinutes() == 0)
            return data.getHours() + 'h';
        else
            return moment(data).format('HH:mm');
    }


}

