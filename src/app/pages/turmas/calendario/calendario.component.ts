import { ChangeDetectorRef, Component, signal, ViewChild } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { lastValueFrom, Subscription } from 'rxjs';
import { CalendarioRequest } from '../../../models/calendario.model';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { Popover } from 'primeng/popover';
import { EventImpl } from '@fullcalendar/core/internal';
import { CalendarOptions, DatesSetArg, EventApi } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import multiMonthPlugin from '@fullcalendar/multimonth';
import moment from 'moment';
import { ActivatedRoute, Router } from '@angular/router';
import { Crypto } from '../../../utils';
import { Turma } from '../../../models/turma.model';
import { TurmaService } from '../../../services/turma.service';
import { Evento } from '../../../models/evento.model';
import { EventoService } from '../../../services/evento.service';

@Component({
    selector: 'app-calendario',
    standalone: false,
    templateUrl: './calendario.component.html',
    styleUrl: './calendario.component.css',
    providers: [ConfirmationService],
})
export class CalendarioComponent {
    visible: boolean = false;
    subscription: Subscription[] = [];
    loading = false;
    object: Turma = new Turma;

    legenda: { corLegenda: string, label: string }[] = [];
    request: CalendarioRequest = new CalendarioRequest;
    @ViewChild('fullCalendar') fullCalendar!: FullCalendarComponent;
    @ViewChild('popoverSelectedAula') popoverSelectedAula!: Popover;

    selectedAula?: EventImpl;

    calendarVisible = signal(false);
    currentEvents = signal<EventApi[]>([]);
    calendarioList: Evento[] = [];
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
        weekends: true,
        hiddenDays: [0],
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
        events: [],
        scrollTime: '10:00:00',
        eventStartEditable: false,
        eventDurationEditable: false,
        handleWindowResize: true,
        lazyFetching: true,
        eventsSet: this.events.bind(this),
        datesSet: (arg: DatesSetArg) => {
            this.request.intervaloDe = arg.start;
            this.request.intervaloAte = arg.end;
            if (this.object.id) {
                this.getCalendario(this.request);
            }
        },
    }

    constructor(
        private confirmationService: ConfirmationService,
        private changeDetector: ChangeDetectorRef,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private service: EventoService,
        private turmaService: TurmaService,
        private crypto: Crypto,
    ) {
        var params = this.activatedRoute.params.subscribe(async res => {
            if (res['id']) {
                this.loading = true;
                var id = this.crypto.decrypt(res['id'])

                this.turmaService.get(id)
                    .then(res => {
                        this.request.turma_Id = res.id;
                        this.object = res;
                        this.loading = false;
                        this.visible = true;
                        this.calendarVisible.set(true);
                    })
                    .catch(res => {
                        this.visible = false;
                        this.visibleChange();
                    });
            } else {
                this.visible = true;
            }
        })
        this.subscription.push(params);

    }



    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
    }

    visibleChange() {
        if (!this.visible) {
            this.router.navigate(['../../'], { relativeTo: this.activatedRoute });
        }
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
                this.calendarioList = calendarioList.filter(x => x.active == true);
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


    setLegenda(evento: Evento[]) {
        this.legenda = [];
        evento.forEach(item => {
            if (!this.legenda.find(x => x.corLegenda == item.corLegenda && x.label == item.professor)) {
                this.legenda.push({
                    label: item.professor ?? '',
                    corLegenda: item.corLegenda ?? '',
                });
            }
        })
    }
    goToTurma() {
        this.router.navigate(['turmas', 'editar', this.crypto.encrypt(this.object.id)]);
    }
}
