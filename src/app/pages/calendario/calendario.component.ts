import { AfterViewInit, ChangeDetectorRef, Component, HostListener, OnDestroy, signal, ViewChild } from '@angular/core';
import { Evento, EventoTipo } from '../../models/evento.model';
import { CalendarOptions, DatesSetArg, EventApi, EventHoveringArg } from '@fullcalendar/core';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { ConfirmationService } from 'primeng/api';
import { CalendarioRequest, CalendarioView } from '../../models/calendario.model';
import { MobileService, ScreenWidth } from '../../utils/mobile';
import { lastValueFrom, Subscription } from 'rxjs';
import { SelectedEventoComponent } from './full-calendar/selected-evento/selected-evento.component';
import { Roteiro } from '../../models/roteiro.model';
import { getError, Header, showError } from '../../utils';
import { AlunoService } from '../../services/alunos.service';
import { AccountService } from '../../services/account.service';
import { RoteiroService } from '../../services/roteiro.service';
import { ToastrService } from 'ngx-toastr';
import { AccountResponse } from '../../models/account.model';
import { Evento_Participacao_Aluno } from '../../models/evento-participacao-aluno.model';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { EventoService } from '../../services/evento.service';
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
import moment from 'moment';
import 'moment/locale/pt-br';
import $ from 'jquery';
import { CalendarioUtils } from '../../utils/calendario-utils';
import { PerfilCognitivo } from '../../models/perfil-cognitivo.model';
import { PerfilCognitivoService } from '../../services/perfil-cognitivo.services';
import { NgModel } from '@angular/forms';

@Component({
    selector: 'app-calendario',
    standalone: false,
    templateUrl: './calendario.component.html',
    styleUrl: './calendario.component.css',
    providers: [ConfirmationService],
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
    loading = false;
    headerOpen = true;
    account?: AccountResponse;
    data = new Date;
    minData = new Date(2025, 0, 1);
    observacaoReposicao: string = '';

    @ViewChild('fullCalendar') fullCalendar!: FullCalendarComponent;
    @ViewChild('popoverComponent') popoverComponent!: SelectedEventoComponent;

    feriados: Feriado[] = [];
    loadingFeriados = false;

    perfilCognitivo: PerfilCognitivo[] = [];
    loadingPerfilCognitivo = false;

    currentRoteiro?: Roteiro;
    roteiros: Roteiro[] = [];
    loadingRoteiro = false;


    loadedAnos: number[] = [];

    dayView = false;
    currentTitle = '';
    cdkDragCancel = false;
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
            // listPlugin,
            // multiMonthPlugin
        ],
        hiddenDays: [0],
        dayHeaders: true,
        weekends: true,
        weekNumbers: false,
        expandRows: true,
        editable: false,
        selectable: false,
        showNonCurrentDates: true,
        allDaySlot: false,
        headerToolbar: {
            left: '',
            center: '',
            right: ''
        },
        nowIndicator: true,
        events: [],
        scrollTime: '09:00:00',
        scrollTimeReset: true,
        eventStartEditable: false,
        eventDurationEditable: false,
        handleWindowResize: false,
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
        windowResize: this.calcHeight.bind(this),
    }

    constructor(
        private changeDetector: ChangeDetectorRef,
        private confirmationService: ConfirmationService,
        private header: Header,
        private service: EventoService,
        private alunoService: AlunoService,
        private alunoRestricaoService: AlunoRestricaoService,
        private accountService: AccountService,
        private roteiroService: RoteiroService,
        private mobileService: MobileService,
        private toastrService: ToastrService,
        private mensagemWhatsapp: MensagemWhatsapp,
        private calendarioUtils: CalendarioUtils,
        private perfilCognitivoService: PerfilCognitivoService,
    ) {
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

        var roteiros = this.roteiroService.list.subscribe(res => this.roteiros = res.sort((x, y) => x.dataInicio.getTime() - y.dataInicio.getTime()));
        this.subscription.push(roteiros);

        var perfilCognitivo = this.perfilCognitivoService.list.subscribe(res => this.perfilCognitivo = res);
        this.subscription.push(perfilCognitivo);

        var feriados = this.service.feriados.subscribe(res => this.feriados = res);
        this.subscription.push(feriados);

        if (this.perfilCognitivo.length == 0) {
            this.loadingPerfilCognitivo = true;
            lastValueFrom(this.perfilCognitivoService.getList('calendario'))
                .then(res => this.loadingPerfilCognitivo = false)
                .catch(res => this.loadingPerfilCognitivo = false);

        }

        var calendarioReload = this.service.calendarioReload.subscribe(res => this.update('calenadrioReload'));
        this.subscription.push(calendarioReload);

        var calendarView = this.service.calendarView.subscribe(async view => {
            if (view == CalendarioView.MeuCalendario) {
                this.calendarioRequest.professor_Id = this.account?.professor_Id;
                this.eventos = [];
            } else {
                this.calendarioRequest.professor_Id = undefined;
            }
            this.service.calendarioReload.emit(1);
        })
        this.subscription.push(calendarView);



        this.calendarioRequest.intervaloDe = moment(new Date).startOf('week').toDate();
        this.calendarioRequest.intervaloAte = moment(new Date).endOf('week').toDate();
        this.loadedAnos = [];


    }
    
    ngOnDestroy(): void {
        this.subscription.forEach(e => e.unsubscribe());
    }

    ngAfterViewInit(): void {
        this.loadRoteiros('ngAfterViewInit');
        this.calcHeight();
    }

    calcHeight() {
        let header = document.querySelector('app-header') as HTMLElement;
        let toolbar = document.querySelector('#toolbar') as HTMLElement;
        let div = document.querySelector('#calendar-navigator') as HTMLElement;
        let legenda = document.querySelector('#legenda') as HTMLElement;
        let calendar = document.querySelector('full-calendar') as HTMLElement;

        let windowHeight = window.outerHeight
        let calculation = windowHeight - (header?.offsetHeight ?? 0) - (toolbar?.offsetHeight ?? 0) - (div?.offsetHeight ?? 0) - (legenda?.offsetHeight ?? 0);
       
        this.calendarioOptions.height = calculation + 'px';
    }

    async update(where: string) {
        this.unselectAula();

        this.loadRoteiros('update');
        await this.cancelarEventos();
        await this.getCalendario('update');
        this.setCalendario();
        this.calcHeight();
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

    dataSelect(model: NgModel) {
        if (model.dirty && model.touched) {
            // Se for exibição diária
            if (this.dayView) {
                this.calendarioRequest.intervaloDe = this.data;
                this.fullCalendar.getApi().gotoDate(this.calendarioRequest.intervaloDe);
            }
            // Se for exibição da semana
            else {
                if (moment(this.data).week() != moment(this.calendarioRequest.intervaloDe).week()) {
                    this.calendarioRequest.intervaloDe = moment(this.data).day(1).toDate();
                    this.calendarioRequest.intervaloAte = moment(this.calendarioRequest.intervaloDe).add(7, 'days').toDate();
                    this.fullCalendar.getApi().gotoDate(this.calendarioRequest.intervaloDe);
                }
            }

            model.control.markAsUntouched();
            model.control.markAsPristine();
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
                this.toastrService.error(`Não foi possível carregar calendário. <br> ${getError(res)}`);
            })
    }

    setCalendario() {  
        this.loading = true;
        this.cdkEventItensId = [];
        
        var calendar = this.fullCalendar.getApi();
        calendar.removeAllEvents();
        
        var feriadosDates = this.feriados.map(x => moment(x.date).format('YYYY-MM-DD'));
        var eventos = this.eventos.filter(x => feriadosDates.includes(moment(x.data).format('YYYY-MM-DD')) == false);
        
        var events = eventos.map(item => {
            var id = 'event-' + this.calendarioUtils.eventRandomId();
            
            if ([EventoTipo.Aula, EventoTipo.AulaExtra].includes(item.evento_Tipo_Id)) {
                this.cdkEventItensId.push(id);
            }

            const eventStyles = this.calendarioUtils.getEventStyles(item)
            
            var event: any = {
                id: id,
                backgroundColor: eventStyles.backgroundColor,
                borderColor: eventStyles.borderColor,
                textColor: eventStyles.textColor,
                title: item.turma ?? item.descricao,
                start: moment(item.data).toDate(),
                end: moment(item.data).add(item.duracaoMinutos, 'minutes').toDate(),
                extendedProps: item,
            }

            return event;
        });

        this.feriados.filter(x => moment(x.date).isBetween(this.calendarioRequest.intervaloDe, this.calendarioRequest.intervaloAte, 'days', '[]'))
            .forEach(item => {
            var event = {
                id: this.calendarioUtils.eventRandomId(),
                textColor: 'white',
                backgroundColor: 'red',
                borderColor: 'red',
                title: item.name,
                start: moment(item.date).toDate(),
                end: moment(item.date).toDate(),
                allDay: true,
                extendedProps: {
                    id: PseudoEvento.EventoId,
                    data: moment(item.date).toDate(),
                    descricao: item.name,
                    evento_Tipo_Id: EventoTipo.Feriado,
                    ...item,
                },
            }
            events.push(event)
        })
        this.calendarioOptions.events = events;
        this.fullCalendar.getApi().updateSize();
        this.loading = false;
        this.calcHeight();


        var temFeriadoNaSemana = this.feriados.filter(x => moment(x.date).isBetween(this.calendarioRequest.intervaloDe, this.calendarioRequest.intervaloAte, 'days', '[]'));
        if (temFeriadoNaSemana.length) {
            this.calendarioOptions.allDaySlot = true;
        } else {
            this.calendarioOptions.allDaySlot = false;
        }

    }

    async datesSet(arg: DatesSetArg) {
        this.loading = true;

        this.currentTitle = moment(arg.start).locale('pt').format('MMMM [de] YYYY');
        this.currentTitle = this.currentTitle[0].toUpperCase() + this.currentTitle.substring(1);

        this.getTemaSemana(arg);

        this.calendarioRequest.intervaloDe = arg.view.currentStart;
        this.calendarioRequest.intervaloAte = arg.view.currentEnd;

        await this.loadFeriados();
        await this.cancelarEventos();
        await this.getCalendario('datesset');
        this.setCalendario();

    }

    dateClick(e: DateClickArg) {
        this.selectedEvento = undefined;
    }

    async selectEvento(e: any, item: Evento) {

        this.popoverComponent.hidePopover();
        
        item = JSON.parse(JSON.stringify(item));

        if (item.reagendamentoDe_Evento_Id && !item.reagendamentoDe_Evento) {
            await lastValueFrom(this.service.get(item.reagendamentoDe_Evento_Id))
                .then(res => {
                    item.reagendamentoDe_Evento = res;
                })
        }

        if (item.alunos && item.alunos.length) {
            item.alunos.map(async aluno => {
                if (aluno.reposicaoDe_Evento_Id) {
                    aluno.reposicaoDe_Evento = await lastValueFrom(this.service.get(aluno.reposicaoDe_Evento_Id))
                }
                if (aluno.reposicaoPara_Evento_Id) {
                    aluno.reposicaoPara_Evento = await lastValueFrom(this.service.get(aluno.reposicaoPara_Evento_Id))
                }
                return aluno;
            })
        }

        this.selectedEvento = item;
        this.popoverComponent.evento = item;
        this.popoverComponent.showPopover(e, item);

        this.changeDetector.markForCheck();
        this.changeDetector.detectChanges();

    }

    unselectAula() {
        this.selectedEvento = undefined;
        this.popoverComponent.evento = undefined as any;
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

            var erroMessage = '';

            if (target.alunos.length >= target.capacidadeMaximaAlunos) {
                erroMessage = 'Essa aula atingiu o limite permitido de alunos.';
            }

            if (target.perfilCognitivo.map(x => x.id).includes(aluno.perfilCognitivo_Id) == false) {
                erroMessage = 'Somente reposições entre alunos de turmas com mesmo perfil cognitivo são permitidas.';
            }

            if (target.alunos.find(x => x.aluno_Id == aluno.aluno_Id)) {
                erroMessage = 'Esse aluno já está atribuído à essa aula';
            }

            if (target.finalizado) {
                erroMessage = 'Essa aula já foi finalizada';
            }

            if (moment(source.data).format('YYYY-MM-DD HH:mm') == moment(target.data).format('YYYY-MM-DD HH:mm')) {
                erroMessage = 'O aluno não pode repor no mesmo dia e horário.';
            }

            if (aluno.reposicaoDe_Evento_Id) {
                erroMessage = 'O aluno não pode repor uma aula duas vezes.';
            }

            if (erroMessage) {
                this.cdkCancelDrag('keyup')
                document.dispatchEvent(new Event('mouseup'));
                return this.showError('Não autorizado', erroMessage, event.event);
            }


            if (target.data != source.data) {

                var restricoes = await lastValueFrom(this.alunoRestricaoService.getList(aluno.aluno_Id));
                aluno.restricoes = restricoes;

                var message = ``;

                if (restricoes.filter(x => !x.active).length > 0 || aluno.restricaoMobilidade) {

                    message = 'Este aluno possui algumas restrições. <br> <ul>'
                    if (aluno.restricaoMobilidade) {
                        message += `<li>Restrição de mobilidade</li>`
                    }
                    if (restricoes.filter(x => !x.active).length > 0) {
                        message += restricoes.map(x => `<li>${x.descricao}</li>`);
                    }
                    message += '</ul><br>Deseja continuar?'

                    this.confirmationService.confirm({
                        target: event.event.target as EventTarget,
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
                            this.agendaReposicaoConfirm(event.event, aluno, source, target);
                            this.cdkCancelDrag('keyup')
                        },
                        reject: () => {
                            this.cdkCancelDrag('keyup')
                        }
                    });

                } else {
                    this.agendaReposicaoConfirm(event.event, aluno, source, target);
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
    @HostListener('window:resize', ['$event'])
    onResize(event: Event) {
      this.calcHeight();
    }

    events(events: EventApi[]) {
        this.currentEvents.set(events);
        this.changeDetector.detectChanges(); // workaround for pressionChangedAfterItHasBeenCheckedError
    }

    showError(header: string, message: string, e: any) {
        showError(this.confirmationService, header, message, e);
    }

    agendaReposicaoConfirm(e: any, aluno: Evento_Participacao_Aluno, source: Evento, target: Evento) {
        this.confirmationService.confirm({
            key: 'agendarReposicao',
            message: `Agendar reposição do aluno(a) <b>${aluno.aluno}</b> para o dia ${moment(target.data).format('DD/MM/YYYY [às] HH[h]mm')}?`,
            header: 'Agendar reposição',
            acceptIcon: 'pi pi-check',
            acceptLabel: 'Agendar',
            acceptButtonStyleClass: 'p-button-rounded',
            rejectVisible: true,
            rejectIcon: 'pi pi-times',
            rejectLabel: 'Cancelar',
            rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
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
                this.showError('Ocorreu um erro', `Não foi possível agendar reposição. <br> ${getError(res)}`, e)
            })
    }

    sendMensagemAluno(e: any, evento: any, aluno: Evento_Participacao_Aluno) {
        if (aluno.celular) {
            this.confirmationService.confirm({
                target: e.target,
                message: `Reposição agendada com sucesso. <br> Clique para enviar mensagem de confirmação.`,
                header: 'Enviar whatsapp',
                icon: 'pi pi-whatsapp text-green-500 text-4xl',
                acceptIcon: 'pi pi-whatsapp',
                acceptLabel: `Enviar mensagem`,
                rejectLabel: 'Não enviar',
                acceptButtonStyleClass: 'p-button-rounded p-button-success',
                rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
                accept: () => {
                    let object = this.mensagemWhatsapp.enviarMensagemReposicao(aluno.aluno, aluno.celular!, evento);
                    window.open(object.link, '_target');
                    this.mensagemWhatsapp.copiarMensagem(object.mensagem);
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


    getTemaSemana(arg: DatesSetArg) {
        if (this.roteiros.length) {
            // between não funncionou aqui ??
            var roteiro = this.roteiros.find(x => moment(arg.start).isSameOrAfter(x.dataInicio) && moment(arg.start).isSameOrBefore(x.dataInicio));
            this.currentRoteiro = roteiro;
        } else {
            this.currentRoteiro = undefined;
        }
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
                this.roteiros = res.sort((x, y) => x.dataInicio.getTime() - y.dataInicio.getTime());
                this.currentRoteiro = res.find(x => moment(this.data).isBetween(x.dataInicio, x.dataFim, 'days', '[]'))
            })
            .catch(res => this.loadingRoteiro = false)

    }

    async loadFeriados() {
        if (!this.loadedAnos.includes(moment(this.calendarioRequest.intervaloDe).year())) {
            this.loadedAnos.push(moment(this.calendarioRequest.intervaloDe).year());
            await lastValueFrom(this.service.getFeriados(moment(this.calendarioRequest.intervaloDe).year()))
                .then(res => this.loadingFeriados = false)
                .catch(res => this.loadingFeriados = false);
        }

        this.loadedAnos = [...new Set(this.loadedAnos)];

        this.loadingFeriados = true;
    }


    getEventoTipo(e: Evento) {
        return this.calendarioUtils.getEventoTipo(e)
    }

    requestAulaTurma(evento: Evento) {
        var request: EventoAulaRequest = MyMap(evento, new EventoAulaRequest);
        request.alunos = evento.alunos.map(x => x.aluno_Id);
        request.professores = evento.professor_Id ? [evento.professor_Id] : [];
        request.perfilCognitivo = evento.perfilCognitivo.map(x => x.id);
        request.sala_Id = request.sala_Id ?? 13 // online; 

        if (evento.id == PseudoEvento.EventoId)
            return lastValueFrom(this.service.createAulaTurma(request));
        return lastValueFrom(this.service.editAulaTurma(request));
    }

    async cancelarEventos() {

        if (!this.loadedAnos.includes(moment(this.calendarioRequest.intervaloDe).year())) {
            this.loadedAnos.push(moment(this.calendarioRequest.intervaloDe).year());
            await lastValueFrom(this.service.cancelarEventos(moment(this.calendarioRequest.intervaloDe).year()))
                .then(res => {
                })
        }

        this.loadedAnos = [...new Set(this.loadedAnos)];

        
    }   

}

