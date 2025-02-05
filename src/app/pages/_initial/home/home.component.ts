import { Component, OnDestroy, AfterViewInit, signal, ChangeDetectorRef, ViewChild } from '@angular/core';
import { Calendar, DateSelectArg, EventApi, EventClickArg, EventContentArg, EventDropArg } from '@fullcalendar/core';
import { AulaService } from '../../../services/aulas.service';
import { lastValueFrom, Subscription } from 'rxjs';
import { Aluno_Aula, Aulas_List, Calendario } from '../../../models/aulas.model';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Crypto, Header } from '../../../utils';
import { ActivatedRoute, Router } from '@angular/router';
import { VerboseFormattingArg } from '@fullcalendar/core/internal';
import { Popover } from 'primeng/popover';
import moment from 'moment';
import $ from 'jquery';
import interactionPlugin, { DateClickArg,  Draggable } from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import multiMonthPlugin from '@fullcalendar/multimonth';
import listPlugin from '@fullcalendar/list';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css'],
    standalone: false,
    providers: [ConfirmationService, MessageService]
})
export class HomeComponent implements OnDestroy, AfterViewInit {
    subscription: Subscription[] = [];
    calendarVisible = signal(true);
    currentEvents = signal<EventApi[]>([]);

    selectedAluno?: Aluno_Aula;
    selectedEvent?: Aulas_List;
    @ViewChild('op') op!: Popover;
    legenda: { color: string, label: string }[] = [];
    calendar!: Calendar;
    calendario: Calendario[] = []

    constructor(
        private changeDetector: ChangeDetectorRef,
        private aulasService: AulaService,
        private confirmationService: ConfirmationService,
        private messageService: MessageService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private crypto: Crypto,
        private header: Header
    ) {

        var list = this.aulasService.list.subscribe(res => this.calendario = res);
        this.subscription.push(list);

        var open = this.header.menuAsideOpen.subscribe(res => {
            if (this.calendar) {
                console.log('oi')
                setTimeout(() => {
                    this.calendar.updateSize();

                }, 300);
            }
        });
        this.subscription.push(open);


    }

    ngAfterViewInit(): void {
        this.initCalendar();
    }

    ngOnDestroy(): void {
        this.subscription.forEach(e => e.unsubscribe());
    }

    async initCalendar() {

        await lastValueFrom(this.aulasService.getList())
            .then(res => {
                let calendarDiv = document.getElementById('calendarDiv') as HTMLElement;

                this.calendario = res;
                this.calendar = new Calendar(calendarDiv, {
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
                    weekNumberCalculation: (m: Date) => {
                        const weekNumber = this.getDateWeek(m, new Date(2025, 1, 10));
                        return weekNumber;
                    },
                    expandRows: true,
                    editable: false,
                    showNonCurrentDates: true,
                    defaultAllDay: false,
                    allDaySlot: false,
                    headerToolbar: {
                        left: 'prev,next,today',
                        center: 'title',
                        right: 'timeGridWeek,timeGridDay,multiMonthYear'
                    },
                    titleFormat: (arg: VerboseFormattingArg) => {
                        console.log(arg)
                        const weekNumber = this.getDateWeek(arg.start.marker, new Date(2025, 1, 10));
                        return `Semana ${weekNumber} - Tema: XYZ`
                    },
                    nowIndicator: true,
                    dayMaxEvents: true,
                    businessHours: true,
                    eventSources: res.map(x => ({
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
                    // height: 'auto',
                    // contentHeight: 'auto',
                    // viewHeight: 'auto',
                    eventStartEditable: false,
                    eventDurationEditable: false,
                    handleWindowResize: false,
                    buttonText: {
                        today: 'hoje',
                        year: 'ano',
                        month: 'mês',
                        week: 'semana',
                        day: 'dia',
                        list: 'lista'
                    },
                    droppable: true,
                    // eventContent: (arg: EventContentArg) => {
                    //     let aula = arg.event.extendedProps['data'] as Aulas_List;
                    //     let div = document.createElement('div');
                    //     div.classList.add('cursor-pointer');
                        
                    //     $(div).append(`
                    //             <div class="cursor-pointer flex align-items-center justify-content-between column-gap-2 overflow-hidden white-space-nowrap">
                    //                 <span>${moment(arg.event.start).format('HH:mm')}</span>
                    //             </div>
                    //             <div class="flex align-items-center justify-content-between column-gap-2 overflow-hidden white-space-nowrap">
                    //                 <span>${aula.turma}</span>
                    //             </div>
                            
                    //             `);
                    //     return { domNodes: [div] }
                    // },

                    dateClick: (arg) => this.dateClick(arg),
                    eventClick: this.eventClick.bind(this),
                    eventsSet: this.events.bind(this),
                });
                this.calendar.render();
                this.setLegenda(res);


            })
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

    setLegenda(c: Calendario[]) {
        this.legenda = [...new Set(c.map(x => ({
            label: x.professor,
            color: x.color
        })))];
    }
    eventdrop(e: EventDropArg) {
        console.log('eventdrop', e)
    }

    dateClick(e: DateClickArg) {
        // var item = e.event.extendedProps['data'] as Aulas_List;
        this.selectedEvent = undefined;
        this.op.hide();

    }

    eventClick(e: EventClickArg) {
        var item = e.event.extendedProps['data'] as Aulas_List;
        this.selectedEvent = item;
        // this.op.show(e.jsEvent, e.el);

        // this.op.hasTargetChanged(e.jsEvent, e.el);
        // this.op.align();
        this.router.navigate(['aula', this.crypto.encrypt(item.id)], { relativeTo: this.activatedRoute });
        this.op.hide();

        // setTimeout(() => {

        //     let draggableEl = document.getElementById('draggableContainer') as HTMLElement;
        //     console.log(draggableEl)
        //     let draggable = new Draggable(draggableEl, {
        //         itemSelector: '.item-class',
        //     });
        //     draggable.handleDragStart(e.event.extendedProps['data'])
        //     console.log(draggable)
        // }, 200);
    }

    events(events: EventApi[]) {
        this.currentEvents.set(events);
        this.changeDetector.detectChanges(); // workaround for pressionChangedAfterItHasBeenCheckedError
    }


}