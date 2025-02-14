import { ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, signal, SimpleChanges, ViewChild } from '@angular/core';
import { Aluno } from '../../../../models/alunos.model';
import { lastValueFrom, Subscription } from 'rxjs';
import { CalendarioList, CalendarioRequest } from '../../../../models/calendario.model';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { EventImpl } from '@fullcalendar/core/internal';
import { CalendarOptions, DatesSetArg, EventApi, EventClickArg } from '@fullcalendar/core';
import moment from 'moment';
import dayGridPlugin from '@fullcalendar/daygrid';
import multiMonthPlugin from '@fullcalendar/multimonth';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Popover } from 'primeng/popover';
import { AulaService } from '../../../../services/aulas.service';

@Component({
    selector: 'app-calendario',
    standalone: false,
    templateUrl: './calendario.component.html',
    styleUrl: './calendario.component.css',
    providers: [ConfirmationService, MessageService],
})
export class CalendarioComponent implements OnChanges, OnDestroy {
    @Input() object = new Aluno;
    subscription: Subscription[] = [];
    loading = false;

    legenda: { backgroundColor: string, label: string }[] = [];
    request: CalendarioRequest = new CalendarioRequest;
    @ViewChild('fullCalendar') fullCalendar!: FullCalendarComponent;
    @ViewChild('popoverSelectedAula') popoverSelectedAula!: Popover;

    selectedAula?: EventImpl;

    calendarVisible = signal(true);
    currentEvents = signal<EventApi[]>([]);
    calendarioList: CalendarioList[] = []
    calendarioOptions: CalendarOptions = {
        initialView: 'dayGridMonth',
        themeSystem: 'standard',
        locale: 'pt-BR',
        plugins: [
            dayGridPlugin,
            multiMonthPlugin
        ],
        dayMaxEvents: 3,
        multiMonthMaxColumns: 1,// force a single column,
        views: {
            multiMonthFourMonth: {
                type: 'multiMonth',
                duration: { months: 4 }
            }
        },
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
            right: 'today prev next'
        },
        events: [],
        scrollTime: '10:00:00',
        eventStartEditable: false,
        eventDurationEditable: false,
        handleWindowResize: true,
        lazyFetching: true,
        eventClick: this.eventClick.bind(this),
        eventsSet: this.events.bind(this),
        datesSet: (arg: DatesSetArg) => {
            this.request.intervaloDe = new Date(arg.start.getTime());
            this.request.intervaloAte = undefined;
            this.getCalendario(this.request);
        },
    }

    constructor(
        private confirmationService: ConfirmationService,
        private changeDetector: ChangeDetectorRef,
        private service: AulaService,
    ) {

    }

    async ngOnChanges(changes: SimpleChanges) {
        if (changes['object']) {
            this.object = changes['object'].currentValue;
            this.request.aluno_Id = this.object.id;
            this.getCalendario(this.request)
        }
    }

    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
    }

    events(events: EventApi[]) {
        this.currentEvents.set(events);
        this.changeDetector.detectChanges();
    }


    eventClick(e: EventClickArg) {

    }
    showError(header: string, message: string, e: any) {
        this.confirmationService.confirm({
            target: e.target,
            message: message,
            header: header,
            icon: 'pi pi-times-circle text-2xl -mr-2 text-red-500 text-red-500',
            acceptLabel: 'OK',
            acceptButtonStyleClass: 'p-button-sm p-button-rounded  px-3 mr-0',
            rejectVisible: false,
        })
    }
    async getCalendario(request: CalendarioRequest) {

        this.loading = true;

        await lastValueFrom(this.service.getCalendario(request))
            .then(calendarioList => {

                calendarioList
                    .filter(x => x.alunos.length < x.capacidadeMaximaAlunos && x.data >= new Date)
                    .forEach(aula => {
                        var f = moment(aula.data).format('DD/MM/YYYY HH:mm');
                        var index = this.calendarioList.findIndex(x => x.turma_Id == aula.turma_Id && moment(x.data).format('DD/MM/YYYY HH:mm') == f);
                        if (index == -1)
                            this.calendarioList.push(aula);
                        else
                            this.calendarioList.splice(index, 1, aula);

                    })
                this.calendarioList.sort((x, y) => (x.data > y.data ? -1 : 1));

                this.setCalendario();
                this.setLegenda(this.calendarioList);
            })
            .catch(res => {
                this.loading = false;
            })

    }

    setCalendario() {
        this.loading = true;
        this.calendarioOptions.events = this.calendarioList.map(item => {
            var event = {
                id: this.eventRamdomId(),
                backgroundColor: item.corLegenda,
                borderColor: item.corLegenda,
                title: item.turma,
                start: moment(item.data, 'YYYY-MM-DD HH:mm').toDate(),
                end: this.addHours(moment(item.data, 'YYYY-MM-DD HH:mm').toDate(), 2),
                data: item,
            }
            return event;
        });

        this.loading = false;
    }

    addHours(data: Date, h: number) {
        data.setTime(data.getTime() + (h * 60 * 60 * 1000));
        return data;
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


    setLegenda(c: CalendarioList[]) {
        this.legenda = [];
        c.forEach(item => {
            if (!this.legenda.find(x => x.backgroundColor == item.corLegenda && x.label == item.professor)) {
                this.legenda.push({
                    label: item.professor,
                    backgroundColor: item.corLegenda,
                });
            }
        })
    }

}
