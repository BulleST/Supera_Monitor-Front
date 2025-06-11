import { ChangeDetectorRef, Component, signal, ViewChild } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { lastValueFrom, Subscription } from 'rxjs';
import { CalendarioRequest } from '../../../models/calendario.model';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { Popover } from 'primeng/popover';
import { EventImpl } from '@fullcalendar/core/internal';
import { CalendarOptions, DatesSetArg, EventApi } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import moment from 'moment';
import { ActivatedRoute, Router } from '@angular/router';
import { Crypto } from '../../../utils';
import { Turma } from '../../../models/turma.model';
import { TurmaService } from '../../../services/turma.service';
import { Evento, EventoTipo } from '../../../models/evento.model';
import { EventoService } from '../../../services/evento.service';
import { ProfessorService } from '../../../services/professor.service';
import { Professor } from '../../../models/professor.model';
import { Feriado } from '../../../models/feriado.model';
import { CalendarioUtils } from '../../../utils/calendario-utils';

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
    @ViewChild('fullCalendar') fullCalendar!: FullCalendarComponent;
    @ViewChild('popoverSelectedAula') popoverSelectedAula!: Popover;

    selectedAula?: EventImpl;
    professores: Professor[] = [];
    loadingProfessores = false;

    feriados: Feriado[] = [];
    loadingFeriados = false;
    ano = new Date().getFullYear();
    currentTitle = '';

    calendarVisible = signal(false);
    currentEvents = signal<EventApi[]>([]);
    calendarioList: Evento[] = [];
    calendarioRequest: CalendarioRequest = new CalendarioRequest;
    calendarioOptions: CalendarOptions = {
        initialView: 'dayGridMonth',
        themeSystem: 'standard',
        locale: 'pt-BR',
        plugins: [
            dayGridPlugin,
        ],
        dayMaxEvents: 3,
        dayHeaders: true,
        weekends: true,
        hiddenDays: [0],
        expandRows: true,
        editable: false,
        showNonCurrentDates: true,
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
        eventsSet: this.events.bind(this),
        datesSet: async (arg: DatesSetArg) => {
            this.currentTitle = moment(arg.view.currentStart).locale('pt').format('MMMM [de] YYYY');
            this.currentTitle = this.currentTitle[0].toUpperCase() + this.currentTitle.substring(1);

            this.calendarioRequest.intervaloDe = arg.view.currentStart;
            this.calendarioRequest.intervaloAte = arg.view.currentEnd;

            if (this.ano != this.calendarioRequest.intervaloDe.getFullYear() || this.feriados.length == 0) {
                this.ano == this.calendarioRequest.intervaloDe.getFullYear();
                await this.loadFeriados();
            }

            if (this.object.id) {
                await this.getCalendario();
                this.setCalendario();
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
        private professorService: ProfessorService,
        private crypto: Crypto,
        private calendarioUtils: CalendarioUtils,
    ) {
        var professores = this.professorService.list.subscribe(res => {
            this.professores = res;
            this.setLegenda();
        });
        this.subscription.push(professores);

        if (this.professores.length == 0) {
            this.loadingProfessores = true;
            lastValueFrom(this.professorService.getList())
                .then(res => this.loadingProfessores = false)
                .catch(res => this.loadingProfessores = false);
        }


        var params = this.activatedRoute.params.subscribe(async res => {
            if (res['id']) {
                this.loading = true;
                var id = this.crypto.decrypt(res['id'])

                this.turmaService.get(id)
                    .then(res => {
                        this.object = res;
                        this.loading = false;
                        this.visible = true;
                        this.calendarVisible.set(true);

                        this.calendarioRequest.turma_Id = res.id;
                        this.calendarioRequest.intervaloDe = moment().startOf('month').toDate();
                        this.calendarioRequest.intervaloAte = moment().endOf('month').toDate();
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

    async update(where: string) {
        await this.loadFeriados();
        await this.getCalendario();
        this.setCalendario();
    }

    prev() {
        this.fullCalendar.getApi().prev();
    }

    next() {
        this.fullCalendar.getApi().next();
    }

    async today() {
        this.fullCalendar.getApi().today();

        this.calendarioRequest.intervaloDe = moment().startOf('week').toDate();
        this.calendarioRequest.intervaloAte = moment().endOf('week').toDate();

        await this.getCalendario();
        this.setCalendario();
    }

    events(events: EventApi[]) {
        this.currentEvents.set(events);
        this.changeDetector.detectChanges();
    }

    async getCalendario() {

        this.loading = true;

        await lastValueFrom(this.service.calendario(this.calendarioRequest))
            .then(calendarioList => {
                this.calendarioList = calendarioList.filter(x => x.active == true && x.evento_Tipo_Id == EventoTipo.Aula);
            })
            .catch(res => {
                this.loading = false;
            })
    }

    setCalendario() {
        this.loading = true;

        var feriadosDates = this.feriados.map(x => moment(x.date).format('YYYY-MM-DD'));
        var eventos = this.calendarioList.filter(x => x.active == true /*&& feriadosDates.includes(moment(x.data).format('YYYY-MM-DD')) == false  */);

        var events = eventos.map(item => {
            var backgroundColor = '#2e2e2e';
            if (item.corLegenda) {
                backgroundColor = item.corLegenda
            } else if (item.professores && item.professores.length > 0) {
                backgroundColor = item.professores[0].corLegenda;
            }
            var color = this.calendarioUtils.getTextColor(backgroundColor)
            var event: any = {
                id: this.calendarioUtils.eventRandomId(),
                backgroundColor: backgroundColor,
                borderColor: backgroundColor,
                foreColor: color,
                title: item.turma ?? item.descricao,
                start: moment(item.data, 'YYYY-MM-DD HH:mm').toDate(),
                end: moment(item.data).add(item.duracaoMinutos, 'minutes').toDate(),
                extendedProps: item,
            }
            return event;
        });

        this.feriados.forEach(item => {
            var event = {
                id: this.calendarioUtils.eventRandomId(),
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
        });
        
        this.calendarioOptions.events = events;

        setTimeout(() => {
            this.fullCalendar.getApi().render();
        }, 100);

        this.loading = false;
    }

    setLegenda() {
        this.legenda = this.professores.map(professor => {
            return {
                label: professor.nome ?? '',
                corLegenda: professor.corLegenda ?? '',
            };
        })
    }

    async loadFeriados() {
        this.loadingFeriados = true;
        await lastValueFrom(this.service.getFeriados(this.ano))
            .then(res => {
                this.feriados = res;
                this.loadingFeriados = false;
            })
            .catch(res => this.loadingFeriados = false);
    }

    goToTurma() {
        this.router.navigate(['turmas', 'editar', this.crypto.encrypt(this.object.id)]);
    }
}
