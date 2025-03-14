import { ChangeDetectorRef, Component, signal, ViewChild } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { lastValueFrom, Subscription } from 'rxjs';
import { CalendarioAula, CalendarioRequest } from '../../../models/calendario.model';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { Popover } from 'primeng/popover';
import { EventImpl } from '@fullcalendar/core/internal';
import { CalendarOptions, DatesSetArg, EventApi } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import multiMonthPlugin from '@fullcalendar/multimonth';
import { AulaService } from '../../../services/aulas.service';
import moment from 'moment';
import { Professor } from '../../../models/professor.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfessorService } from '../../../services/professor.service';
import { Crypto } from '../../../utils';

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
    object: Professor = new Professor;

    request: CalendarioRequest = new CalendarioRequest;
    @ViewChild('fullCalendar') fullCalendar!: FullCalendarComponent;
    @ViewChild('popoverSelectedAula') popoverSelectedAula!: Popover;

    selectedAula?: EventImpl;

    calendarVisible = signal(false);
    currentEvents = signal<EventApi[]>([]);
    calendarioList: CalendarioAula[] = []
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
        private service: AulaService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private professorService: ProfessorService,
        private crypto: Crypto,
    ) {
        var params = this.activatedRoute.params.subscribe(async res => {
            if (res['id']) {
                this.loading = true;
                var id = this.crypto.decrypt(res['id'])

                this.professorService.get(id)
                    .then(res => {
                        this.request.professor_Id = res.id;
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

        await lastValueFrom(this.service.getCalendario(request))
            .then(calendarioList => {

                calendarioList.forEach(aula => {
                    var f = moment(aula.data).format('DD/MM/YYYY HH:mm');
                    var index = this.calendarioList.findIndex(x => x.turma_Id == aula.turma_Id && moment(x.data).format('DD/MM/YYYY HH:mm') == f);
                    if (index == -1) {
                        this.calendarioList.push(aula);
                    }
                    else {
                        this.calendarioList.splice(index, 1, aula);
                    }
                });

                this.setCalendario();
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
                title: item.descricao,
                start: moment(item.data, 'YYYY-MM-DD HH:mm').toDate(),
                end: this.addHours(moment(item.data, 'YYYY-MM-DD HH:mm').toDate(), 2),
                data: item,
            }
            return event;
        });

        this.fullCalendar.getApi().addEvent(this.calendarioOptions.events)

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


    goToProfessor() {
        this.router.navigate(['professores', 'editar', this.crypto.encrypt(this.object.id)]);
    }
}
