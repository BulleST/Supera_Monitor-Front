import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { lastValueFrom, Subscription } from 'rxjs';
import { Crypto } from '../../../utils';
import { Calendar, DayCellContentArg, EventApi, EventClickArg, EventContentArg } from '@fullcalendar/core';
import { Aulas_List, Calendario } from '../../../models/aulas.model';
import { AulaService } from '../../../services/aulas.service';
import moment from 'moment';
import $ from 'jquery';
import interactionPlugin, { DateClickArg, Draggable } from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import multiMonthPlugin from '@fullcalendar/multimonth';
import listPlugin from '@fullcalendar/list';
import { VerboseFormattingArg } from '@fullcalendar/core/internal';


@Component({
    selector: 'app-reposicao',
    standalone: false,
    templateUrl: './reposicao.component.html',
    styleUrl: './reposicao.component.css',
    providers: [ConfirmationService, MessageService],
})
export class ReposicaoComponent implements OnDestroy, AfterViewInit {
    visible: boolean = true;
    object: any = {};
    loading = false;
    error: string = '';
    isEditPage = false;
    subscription: Subscription[] = [];
    calendar!: Calendar;
    calendario: Calendario[] = [];
    selectedEvent?: Aulas_List;
    currentEvents = signal<EventApi[]>([]);

    date: Date = new Date;
    constructor(
        private confirmationService: ConfirmationService,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private crypto: Crypto,
        private aulasService: AulaService,
        private changeDetector: ChangeDetectorRef,
    ) {

        var list = this.aulasService.list.subscribe(res => this.calendario = res);
        this.subscription.push(list);
    }

    ngAfterViewInit(): void {
        this.initCalendar();
    }

    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
    }
    visibleChange() {
        if (!this.visible) {
            var route = this.isEditPage ? ['../../'] : ['../'];
            this.router.navigate(route, { relativeTo: this.activatedRoute });
        }
    }
    getDateWeek(date: Date, inicioAnoLetivo: Date) {
        const currentDate = (typeof date === 'object') ? date : new Date();
        inicioAnoLetivo = new Date(currentDate.getFullYear(), 0, 15);
        const daysToNextMonday = (inicioAnoLetivo.getDay() === 1) ? 0 : (7 - inicioAnoLetivo.getDay()) % 7;
        const nextMonday = new Date(currentDate.getFullYear(), 0, inicioAnoLetivo.getDate() + daysToNextMonday);

        return (currentDate < nextMonday) ? 52 : (currentDate > nextMonday ? Math.ceil((currentDate.valueOf() - nextMonday.valueOf()) / (24 * 3600 * 1000) / 7) : 1);
    }

    addHours(data: Date, h: number) {
        data.setTime(data.getTime() + (h * 60 * 60 * 1000));
        return data;
    }


    async initCalendar() {
        console.log('initCalendar')
        await lastValueFrom(this.aulasService.getList())
            .then(res => {
                let calendarDiv = document.getElementById('myCalendar') as HTMLElement;

                console.log('calendarDiv', calendarDiv)
                this.calendario = res;
                this.calendar = new Calendar(calendarDiv, {
                    initialView: 'multiMonthYear',
                    themeSystem: 'standard',
                    locale: 'pt-BR',
                    plugins: [
                        dayGridPlugin,
                        interactionPlugin,
                        timeGridPlugin,
                        listPlugin,
                        multiMonthPlugin
                    ],
                    selectable: true,
                    dayHeaders: true,
                    weekends: false,
                    expandRows: true,
                    editable: false,
                    showNonCurrentDates: true,
                    defaultAllDay: false,
                    allDaySlot: false,
                    headerToolbar: {
                        left: 'title',
                        center: '',
                        right: 'timeGridWeek,multiMonthYear'
                    },
                    titleFormat: (arg: VerboseFormattingArg) => {
                        console.log(arg)
                        const weekNumber = this.getDateWeek(arg.start.marker, new Date(2025, 1, 10));
                        return `Selecione uma data`
                        // return `Semana ${weekNumber} - Tema: XYZ`
                    },
                    nowIndicator: true,
                    dayMaxEvents: true,
                    businessHours: true,
                    eventSources: res.filter(x => x.professor == 'Antônio').map(x => ({
                        id: x.id.toString(), // id do professor
                        backgroundColor: x.color,
                        borderColor: x.color,
                        events: x.aulas.map(y => ({
                            id: y.id.toString(), // id da aula
                            title: y.turma,
                            start: y.dataInicio,
                            end: this.addHours(y.dataFim, 1),
                            data: y,
                        }))
                    })),
                    scrollTime: '08:00',
                    eventStartEditable: false,
                    eventDurationEditable: false,
                    handleWindowResize: false,
                    buttonText: {
                        today: 'hoje',
                        year: 'mês',
                        month: 'mês',
                        week: 'semana',
                        day: 'dia',
                        list: 'lista'
                    },
                    dayCellClassNames: (renderProps: DayCellContentArg) => {
                        console.log(renderProps)
                        if (this.selectedEvent && moment(renderProps.date).format('DD/MM/YYYY') == moment(this.selectedEvent?.dataInicio).format('DD/MM/YYYY')) {
                            return ['selected'];
                        }
                        return [''];
                    },
                    eventClassNames: (e: EventContentArg) => {
                        if (this.selectedEvent && e.event.extendedProps['data'].id == this.selectedEvent?.id) {
                            return ['selected'];
                        }
                        return [''];
                    },
                    droppable: true,
                    eventsSet: this.events.bind(this),
                    eventClick: this.eventClick.bind(this),
                });
                console.log('calendar', this.calendar)
                this.calendar.render();
                this.calendar.updateSize()
            })
    }

    eventClick(e: EventClickArg) {
        var item = e.event.extendedProps['data'] as Aulas_List;

        this.selectedEvent = item;
        this.calendar.select(e)
        this.calendar.render();
        // this.confirmationService.confirm({
        //     target: e.jsEvent.target as EventTarget,
        //     message: `Agendar reposição para o dia ${moment(item.dataInicio).format('DD/MM/YYYY')} às ${moment(item.dataInicio).format('HH:mm')}`,
        //     header: 'Confirmação',
        //     icon: 'pi pi-exclamation-triangle',
        //     acceptLabel: `Selecionar data`,
        //     acceptButtonStyleClass: 'p-button-sm p-button-rounded  px-3 mr-0',
        //     rejectLabel: 'Cancelar',
        //     rejectButtonStyleClass: 'p-button-text p-button-sm',
        //     accept: () => {


        //     },
        // });

    }

    events(events: EventApi[]) {
        this.currentEvents.set(events);
        this.changeDetector.detectChanges(); // workaround for pressionChangedAfterItHasBeenCheckedError
    }



}

