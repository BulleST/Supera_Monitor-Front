import { Component, OnDestroy, AfterViewInit, signal, ChangeDetectorRef, ViewChild, ViewChildren, QueryList, HostListener } from '@angular/core';
import { CalendarOptions, DatesSetArg, EventApi, EventHoveringArg } from '@fullcalendar/core';
import { AulaService } from '../../../services/aulas.service';
import { lastValueFrom, Subscription } from 'rxjs';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { Crypto, getError, Header, MobileService } from '../../../utils';
import { ActivatedRoute, Router } from '@angular/router';
import { Popover } from 'primeng/popover';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import multiMonthPlugin from '@fullcalendar/multimonth';
import listPlugin from '@fullcalendar/list';
import { CalendarioAlunoList, CalendarioList, CalendarioRequest, CalendarioView, loadingEvents } from '../../../models/calendario.model';
import { AccountService } from '../../../services/account.service';
import { AccountResponse } from '../../../models/account.model';
import { ScreenWidth } from '../../../utils/mobile';
import $ from 'jquery';
import {  AulaId, ReposicaoAlunoRequest } from '../../../models/reposicao.model';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import moment from 'moment';
import 'moment/locale/pt-br'

import { FullCalendarComponent } from '@fullcalendar/angular';
import { AlunoService } from '../../../services/alunos.service';
import { AulaCreateRequest } from '../../../models/aulas.model';
import { ToastrService } from 'ngx-toastr';
import { Jornada, jornadas } from '../../../models/jornada.model';
import { SelectedAulaComponent } from './selected-aula/selected-aula.component';

moment.locale('pt-br')

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css'],
    standalone: false,
    providers: [ConfirmationService]
})
export class HomeComponent implements OnDestroy, AfterViewInit {
    subscription: Subscription[] = [];
    screen: ScreenWidth = ScreenWidth.lg;
    selectedAula?: CalendarioList;
    selectedAluno?: CalendarioAlunoList;
    legenda: { backgroundColor: string, label: string }[] = [];

    loading = true;
    headerOpen = true;
    cdkDragCancel = false;

    account?: AccountResponse;

    @ViewChild('fullCalendar') fullCalendar!: FullCalendarComponent;
    @ViewChild('selectedAulaComponent') selectedAulaComponent!: SelectedAulaComponent;

    viewMenu: MenuItem[] = [];
    // view: 'meuCalendario' | 'calendarioGeral' = 'calendarioGeral';
    view: CalendarioView = CalendarioView.MeuCalendario;

    currentJornada?: Jornada;
    currentTitle = '';
    cdkEventItensId: string[] = [];
    calendarioRequest: CalendarioRequest = new CalendarioRequest;
    calendarioVisible = signal(false);
    currentEvents = signal<EventApi[]>([]);
    calendarioList: CalendarioList[] = [];
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
        dayHeaders: true,
        weekends: false,
        weekNumbers: false,
        expandRows: true,
        editable: false,
        showNonCurrentDates: true,
        defaultAllDay: false,
        allDaySlot: false,
        headerToolbar: {
            left: '',
            center: '',
            right: ''
        },
        nowIndicator: true,
        dayMaxEvents: true,
        events: loadingEvents,
        scrollTime: '08:00:00',
        eventStartEditable: false,
        eventDurationEditable: false,
        handleWindowResize: false,
        buttonText: {
            today: 'hoje'
        },
        lazyFetching: true,
        datesSet: this.datesSet.bind(this),
        dateClick: this.dateClick.bind(this),
        eventsSet: this.events.bind(this),
        eventMouseEnter: this.eventMouseEnter.bind(this),
        eventMouseLeave: this.eventMouseLeave.bind(this),

    }
    constructor(
        private changeDetector: ChangeDetectorRef,
        private confirmationService: ConfirmationService,
        private header: Header,
        private service: AulaService,
        private alunoService: AlunoService,
        private accountService: AccountService,
        private mobileService: MobileService,
        private toastrService: ToastrService,
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

        var calendarioReload = this.service.calendarioReload.subscribe(res => {
            this.getCalendario(this.calendarioRequest, 'calendarioReload');
        });
        this.subscription.push(calendarioReload);


        var calendarView = this.service.calendarView.subscribe(async view => {
            if (view == CalendarioView.MeuCalendario) {
                this.calendarioRequest.professor_Id = this.account?.professor_Id;
                this.calendarioList = [];
            } else {
                this.calendarioRequest.professor_Id = undefined
            }
        })
        this.subscription.push(calendarView);
    }

    ngAfterViewInit(): void { }

    ngOnDestroy(): void {
        this.subscription.forEach(e => e.unsubscribe());
    }


    update() {
        this.getCalendario(this.calendarioRequest, 'atualizar');
    }

    prev() {
        this.fullCalendar.getApi().prev();
    }

    next() {
        this.fullCalendar.getApi().next();
    }

    today() {
        this.fullCalendar.getApi().today();
    }

    setView() {
        this.viewMenu = [
            {
                label: 'Meu Calendário',
                value: CalendarioView.MeuCalendario,
                icon: 'pi pi-user',
            }, {
                label: 'Calendário Geral',
                value: CalendarioView.Geral,
                icon: 'pi pi-calendar',
            }
        ]
    }

    calendarViewChanged() {
        this.service.calendarView.next(this.view);
        if (this.view == CalendarioView.MeuCalendario) {
            this.calendarioRequest.professor_Id = this.account?.professor_Id;
            this.calendarioList = [];
        } else {
            this.calendarioRequest.professor_Id = undefined
        }
        this.getCalendario(this.calendarioRequest, 'subscriber')
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

    getCalendario(request: CalendarioRequest, where: string) {

        this.loading = true;

        setTimeout(() => {
             lastValueFrom(this.service.getCalendario(request))
            .then(calendarioList => {
                console.log('getCalendario calendarioList', JSON.parse(JSON.stringify(calendarioList)))
                calendarioList.forEach(aula => {
                    var f = moment(aula.data).format('DD/MM/YYYY HH:mm');
                    var index = this.calendarioList.findIndex(x => x.turma_Id == aula.turma_Id && moment(x.data).format('DD/MM/YYYY HH:mm') == f);
                    if (index == -1)
                        this.calendarioList.push(aula);
                    else
                        this.calendarioList.splice(index, 1, aula);

                })

                this.setCalendario();
                this.setLegenda(this.calendarioList);
            })
            .catch(res => {
                this.loading = false;
                this.toastrService.error(`Não foi possível carregar calendário. \n ${getError(res)}`);
            })
        }, 1000);


       
    }

    setCalendario() {
        this.loading = true;
        this.cdkEventItensId = [];

        this.fullCalendar.getApi().removeAllEvents();
        this.calendarioOptions.events = this.calendarioList.map(item => {
            var event = {
                id: this.eventRamdomId(),
                backgroundColor: 'transparent',
                borderColor: 'transparent',
                title: item.turma ?? item.descricao,
                start: moment(item.data, 'YYYY-MM-DD HH:mm').toDate(),
                end: this.addHours(moment(item.data, 'YYYY-MM-DD HH:mm').toDate(), 2),
                extendedProps: item,
            }
            return event;
        });

        this.cdkEventItensId = this.calendarioOptions.events.map(x => 'event-' + x.id)
        this.fullCalendar.getApi().updateSize();
        this.loading = false;
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

    setLegenda(c: CalendarioList[]) {
        this.legenda = [];
        c.forEach(item => {
            if (!this.legenda.find(x => x.backgroundColor == item.corLegenda && x.label == item.professor)) {
                this.legenda.push(
                    {
                        label: item.professor,
                        backgroundColor: item.corLegenda,
                    }
                )
            }
        })
    }

    getForeColor(hex: string) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        var rgb = result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : {
            r: 0,
            g: 0,
            b: 0
        };
        return (rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114) > 200 ? '#000' : '#fff';
    }


    async datesSet(arg: DatesSetArg) {
        this.loading = true;

        this.currentTitle = moment(arg.start).locale('pt').format('MMMM [de] YYYY');
        this.currentTitle = this.currentTitle[0].toUpperCase() + this.currentTitle.substring(1)
        this.getTemaSemana(arg);
        let _loadingEvents = loadingEvents
            .sort((x, y) => x.start - y.start)
            .map(x => {
                x.start = moment(arg.start).add(new Date(x.start).getDay() - 1, 'days').format('YYYY-MM-DD') + x.start.substring(10)
                x.end = moment(arg.start).add(new Date(x.end).getDay() - 1, 'days').format('YYYY-MM-DD') + x.end.substring(10)
                return x
            })




        this.calendarioOptions.events = JSON.parse(JSON.stringify(_loadingEvents));
        this.calendarioRequest.intervaloDe = new Date(arg.view.currentStart.getTime());
        this.calendarioRequest.intervaloAte = undefined;

        this.getCalendario(this.calendarioRequest, 'datesSet');

    }

    dateClick(e: DateClickArg) {
        this.selectedAula = undefined;
    }

    // eventClick(e: EventClickArg) {
    eventClick(item: CalendarioList, e: any) {
        this.selectedAula = item;
        console.log('selectedAula', JSON.parse(JSON.stringify(this.selectedAula)))
        this.selectedAula.alunos.sort((x, y) => x.aluno < y.aluno ? -1 : x.aluno > y.aluno ? 1 : 0)
        this.selectedAulaComponent.selectedAula = item;
        this.selectedAulaComponent.showPopover(e);
    }

    eventMouseEnter(e: EventHoveringArg) {
        $('.fc-event-hover-placeholder').remove()
        if (!this.loading) {
            $('body').append(`<div id="event-placeholder-${e.event.id}" 
                                    class="fc-event-hover-placeholder text-white fixed z-2 fadein animation-duration-200 w-15rem"
                                    style="bottom: 20px; left: 40px; " >
                                ${$(e.el).find('.fc-event-main').html()}
                            </div>`)
        }

    }

    eventMouseLeave(e: EventHoveringArg) {
        $('.fc-event-hover-placeholder').remove()
    }


    calcLen(alunos: any) {
        if (!alunos) {
            return 0
        } else {
            return alunos.length
        }
    }

    cdkCancelDrag(where: string) {

        this.cdkDragCancel = true;
        this.cdkEventItensId.forEach(id => {
            $('#' + id).removeClass('scalein animation-duration-200 animation-iteration-1')
            $('#' + id).removeClass('sshadow-2 border-3 border-red-500')
        })
    }



    cdkDrop(event: CdkDragDrop<CalendarioAlunoList[]>, target: CalendarioList) {


        if (this.cdkDragCancel) {
            return;
        }
        if (!this.selectedAula)
            return;


        if (event.previousContainer != event.container) {

            if (target.alunos.length >= target.capacidadeMaximaAlunos) {
                document.dispatchEvent(new Event('mouseup'));
                this.cdkCancelDrag('keyup')
                return this.showError('Não autorizado', 'Essa aula atingiu o limite permitido de alunos.', event.event);
            }

            if (target.perfilCognitivo.map(x => x.id).includes(event.item.data.perfilCognitivo_Id) == false) {
                document.dispatchEvent(new Event('mouseup'));
                this.cdkCancelDrag('keyup')
                return this.showError('Não autorizado', 'Somente reposições entre alunos de turmas com mesma faixa etária são permididas.', event.event);
            }

            if (target.alunos.find(x => x.aluno_Id == event.item.data.aluno_Id)) {
                document.dispatchEvent(new Event('mouseup'));
                this.cdkCancelDrag('keyup')
                return this.showError('Não autorizado', 'Esse aluno já está marcado nessa aula', event.event);
            }




            if (target.data != this.selectedAula.data) {
                this.confirmationService.confirm({
                    target: event.container.element.nativeElement,
                    message: `Agendar reposição do aluno <b>${event.item.data.aluno}</b> para o dia ${moment(target.data).format('DD/MM/YYYY [às] HH[h]mm')}?`,
                    header: 'Agendar reposição',
                    icon: 'pi pi-exclamation-triangle',
                    acceptIcon: 'pi pi-check',
                    acceptLabel: 'Agendar',
                    acceptButtonStyleClass: 'p-button-rounded p-button-sm px-3 mr-0',
                    rejectVisible: true,
                    rejectIcon: 'pi pi-times',
                    rejectLabel: 'Cancelar',
                    rejectButtonStyleClass: 'p-button-rounded p-button-sm p-button-outlined',
                    accept: async () => {
                        this.agendaReposicao(event.item.data.aluno_Id, this.selectedAula as CalendarioList, target, { target: event.container.element.nativeElement });
                    },
                    reject: () => {
                    }
                });
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
            rejectVisible: false,
        })
    }

    async agendaReposicao(aluno_Id: number, source: CalendarioList, target: CalendarioList, e: any) {

        this.loading = true;
        var reposicaoRequest = new ReposicaoAlunoRequest;
        reposicaoRequest.aluno_Id = aluno_Id;


        // Se a aula source não existir, cria a aula
        if (source.aula_Id == AulaId.PseudoAula) {
            var aulaRequest: AulaCreateRequest = {
                sala_Id: source.sala_Id,
                turma_Id: source.turma_Id ?? 0,
                professor_Id: source.professor_Id,
                data: moment(source.data).format('YYYY-MM-DD[T]HH:mm:ss') as unknown as Date,
                observacao: ''
            }

            await lastValueFrom(this.service.create(aulaRequest))
                .then(res => reposicaoRequest.source_Aula_Id = res.object.id)
                .catch(res => this.showError('Ocorreu um erro', `Não foi possível agendar reposição. \n (Aula source não foi inserida). \n ${getError(res)}`, e));

        }
        else {
            reposicaoRequest.source_Aula_Id = source.aula_Id;
        }

        // Se a aula target não existir, cria a aula
        if (target.aula_Id == AulaId.PseudoAula) {
            var aulaRequest: AulaCreateRequest = {
                sala_Id: target.sala_Id,
                turma_Id: target.turma_Id ?? 0,
                professor_Id: target.professor_Id,
                data: moment(target.data).format('YYYY-MM-DD[T]HH:mm:ss') as unknown as Date,
                observacao: ''
            }

            await lastValueFrom(this.service.create(aulaRequest))
                .then(res => reposicaoRequest.dest_Aula_Id = res.object.id)
                .catch(res => this.showError('Ocorreu um erro', `Não foi possível agendar reposição. \n (Aula target não foi inserida). \n ${getError(res)}`, e));

        } else {
            reposicaoRequest.dest_Aula_Id = target.aula_Id;
        }

        await lastValueFrom(this.alunoService.reposicao(reposicaoRequest))
            .then(res => {
                this.loading = false;
                this.selectedAulaComponent.hidePopover();
                this.selectedAula = undefined;

                this.getCalendario(this.calendarioRequest, 'agendarReposicao');
                this.toastrService.success(`Reposição agendada para o dia ${moment(target.data).format('DD/MM/YYYY [às] HH[h]mm')}`)
            })
            .catch(res => {
                this.loading = false;
                this.showError('Ocorreu um erro', `Não foi possível agendar reposição.\n ${getError(res)}`, e)
            })
    }

    getTemaSemana(arg: any) {

        var list: Jornada[] = JSON.parse(JSON.stringify(jornadas));
        list = list.map(x => {
            x.dataInicio = new Date(new Date(x.dataInicio).toDateString());
            x.dataFim = new Date(new Date(x.dataFim).toDateString());
            return x
        })
        list.sort((x, y) => x.dataInicio < y.dataInicio ? -1 : x.dataInicio < y.dataInicio ? 1 : 0);
        var data = moment(arg.start, 'YYYY-MM-DD').toDate();

        var existe = list.find(x => data >= x.dataInicio && data <= x.dataFim );
        this.currentJornada = existe;

    }

}
