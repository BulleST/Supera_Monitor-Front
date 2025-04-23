import { ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, signal, SimpleChanges, ViewChild } from '@angular/core';
import { Aluno } from '../../../../models/alunos.model';
import { lastValueFrom, Subscription } from 'rxjs';
import { CalendarioAula, CalendarioRequest } from '../../../../models/calendario.model';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { EventImpl } from '@fullcalendar/core/internal';
import { CalendarOptions, DatesSetArg, EventApi } from '@fullcalendar/core';
import moment from 'moment';
import dayGridPlugin from '@fullcalendar/daygrid';
import multiMonthPlugin from '@fullcalendar/multimonth';
import { ConfirmationService } from 'primeng/api';
import { Popover } from 'primeng/popover';
import { Evento } from '../../../../models/evento.model';
import { EventoService } from '../../../../services/evento.service';

@Component({
    selector: 'app-calendario',
    templateUrl: './calendario.component.html',
    styleUrl: './calendario.component.css',
    standalone: false,
    providers: [ConfirmationService],
})
export class CalendarioComponent implements OnChanges, OnDestroy {
    @Input() object = new Aluno;
    subscription: Subscription[] = [];
    loading = false;

    legenda: { corLegenda: string, label: string }[] = [];
    request: CalendarioRequest = new CalendarioRequest;
    @ViewChild('fullCalendar') fullCalendar!: FullCalendarComponent;
    @ViewChild('popoverSelectedAula') popoverSelectedAula!: Popover;

    selectedAula?: EventImpl;

    calendarVisible = signal(true);
    currentEvents = signal<EventApi[]>([]);
    calendarioList: Evento[] = []
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
            right: 'atualizar today prev next'
        },
        customButtons: {
            atualizar: {
                text: 'atualizar',
                hint: 'atualizar',
                click: () => {
                    this.getCalendario(this.request)
                }
            }
        },
        buttonText: {
            today: 'hoje',
            year: 'meses',
            month: 'mês',
            week: 'semana',
            day: 'dia',
            list: 'lista'
        },
        events: [],
        scrollTime: '10:00:00',
        eventStartEditable: false,
        eventDurationEditable: false,
        handleWindowResize: true,
        lazyFetching: true,
        eventsSet: this.events.bind(this),
        datesSet: (arg: DatesSetArg) => {
            this.request.intervaloDe = new Date(arg.start.getTime());
            this.request.intervaloAte = undefined;
            if (this.object.id) {
                this.getCalendario(this.request);
            }
        },
    }

    constructor(
        private confirmationService: ConfirmationService,
        private changeDetector: ChangeDetectorRef,
        private service: EventoService,
    ) {

    }

    async ngOnChanges(changes: SimpleChanges) {
        if (changes['object']) {
            this.object = changes['object'].currentValue;
            if (this.object.id) {
                this.request.aluno_Id = this.object.id;
                
            }
        }
    }

    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
    }

    events(events: EventApi[]) {
        this.currentEvents.set(events);
        this.changeDetector.detectChanges();
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

        await lastValueFrom(this.service.calendario(request))
            .then(calendarioList => {
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
                title: item.descricao ?? item.turma,
                start: moment(item.data, 'YYYY-MM-DD HH:mm').toDate(),
                end: this.addHours(moment(item.data, 'YYYY-MM-DD HH:mm').toDate(), 2),
                extendedProps: item,
            }
            return event;
        });
        this.fullCalendar.getApi().render();
        setTimeout(() => {
            this.fullCalendar.getApi().render();
        }, 100);

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


    setLegenda(calendario: Evento[]) {
        this.legenda = [];
        calendario.forEach(item => {
            if (!this.legenda.find(x => x.corLegenda == item.corLegenda && x.label == item.professor)) {
                this.legenda.push({
                    label: item.professor ?? '',
                    corLegenda: item.corLegenda ?? '',
                });
            }
        })
    }

}
