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
import { Evento, EventoTipo } from '../../../../models/evento.model';
import { EventoService } from '../../../../services/evento.service';
import { Professor } from '../../../../models/professor.model';
import { Feriado } from '../../../../models/feriado.model';
import { AlunoService } from '../../../../services/alunos.service';
import { ProfessorService } from '../../../../services/professor.service';
import { PseudoEvento } from '../../../../models/reposicao.model';
import { CalendarioUtils } from '../../../../utils/calendario-utils';

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
    @ViewChild('fullCalendar') fullCalendar!: FullCalendarComponent;
    @ViewChild('popoverSelectedAula') popoverSelectedAula!: Popover;

    selectedAula?: EventImpl;
    professores: Professor[] = [];
    loadingProfessores = false;

    feriados: Feriado[] = [];
    loadingFeriados = false;
    ano = new Date().getFullYear();
    currentTitle = '';
    EventoTipo = EventoTipo;

    calendarVisible = signal(false);
    currentEvents = signal<EventApi[]>([]);
    eventos: Evento[] = [];
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
        private service: EventoService,
        private professorService: ProfessorService,
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
        
        var feriados = this.service.feriados.subscribe(res => this.feriados = res);
        this.subscription.push(feriados);


    }

    async ngOnChanges(changes: SimpleChanges) {
        if (changes['object']) {
            this.object = changes['object'].currentValue;
            if (this.object.id) {
                this.calendarioRequest.aluno_Id = this.object.id;
                this.calendarioRequest.intervaloDe = moment().startOf('month').toDate();
                this.calendarioRequest.intervaloAte = moment().endOf('month').toDate();

            }
        }
    }

    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
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
            .then(list => {
                this.eventos = list;
            })
            .catch(res => {
                this.loading = false;
            })
    }

    setCalendario() {
        this.loading = true;

        var calendar = this.fullCalendar.getApi();
        calendar.removeAllEvents();

        var feriadosDates = this.feriados.map(x => moment(x.date).format('YYYY-MM-DD'));
        var eventos = this.eventos.filter(x => x.evento_Tipo_Id != EventoTipo.Reuniao 
                                            && x.active == true 
                                            && feriadosDates.includes(moment(x.data).format('YYYY-MM-DD')) == false);

        var events = eventos.map(item => {
            var backgroundColor = item.corLegenda ? item.corLegenda 
                    : item.professores && item.professores.length > 0 ? item.professores[0].corLegenda
                        : '#2e2e2e';
            var textColor = this.calendarioUtils.getTextColor(backgroundColor);
            var id = 'event-' + this.calendarioUtils.eventRamdomId();

            var event: any = {
                id: id,
                backgroundColor: backgroundColor,
                borderColor: backgroundColor,
                textColor: textColor,
                title: item.turma ?? item.descricao,
                start: moment(item.data).toDate(),
                end: moment(item.data).add(item.duracaoMinutos, 'minutes').toDate(),
                extendedProps: item,
            }
            return event;
        });

        this.feriados.forEach(item => {
            var event = {
                id: this.calendarioUtils.eventRamdomId(),
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
            .then(res => this.loadingFeriados = false)
            .catch(res => this.loadingFeriados = false);
    }

}
