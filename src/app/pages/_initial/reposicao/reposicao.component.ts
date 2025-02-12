import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { lastValueFrom, Subscription } from 'rxjs';
import { Crypto } from '../../../utils';
import { Calendar, CalendarOptions, DayCellContentArg, EventApi, EventClickArg, EventContentArg } from '@fullcalendar/core';
// import { Aulas_List, Calendario } from '../../../models/aulas.model';
import { AulaService } from '../../../services/aulas.service';
import moment from 'moment';
import $ from 'jquery';
import interactionPlugin, { DateClickArg, Draggable } from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import multiMonthPlugin from '@fullcalendar/multimonth';
import listPlugin from '@fullcalendar/list';
import { VerboseFormattingArg } from '@fullcalendar/core/internal';
import { CalendarioList } from '../../../models/calendario.model';
import { AlunoService } from '../../../services/alunos.service';
import { Aluno } from '../../../models/alunos.model';
import { Reposicao, ReposicaoRequest } from '../../../models/reposicao.model';
import { Turma } from '../../../models/turma.model';
import { TurmaService } from '../../../services/turma.service';


@Component({
    selector: 'app-reposicao',
    standalone: false,
    templateUrl: './reposicao.component.html',
    styleUrl: './reposicao.component.css',
    providers: [ConfirmationService, MessageService],
})
export class ReposicaoComponent implements OnDestroy, AfterViewInit {
    visible: boolean = true;
    object: Reposicao = new Reposicao;
    loading = false;
    error: string = '';
    subscription: Subscription[] = [];

    calendarVisible = signal(true);
    currentEvents = signal<EventApi[]>([]);
    calendario: CalendarioList[] = []
    calendarOptions: CalendarOptions = {
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
            left: '',
            center: '',
            right: ''
        },
        nowIndicator: true,
        dayMaxEvents: true,
        // businessHours: true,
        events: [],
        scrollTime: '10:00',
        eventStartEditable: false,
        eventDurationEditable: false,
        handleWindowResize: false,
        buttonText: {
            today: 'hoje',
            year: 'ano',
            month: 'mês',
            week: 'semana',
            list: 'lista'
        },
        droppable: true,
        loading: (arg) => {
        },
        eventClick: this.eventClick.bind(this),
        eventsSet: this.events.bind(this),
        eventClassNames: (arg) => {
            console.log(arg)
            return arg.event.id;
        }
    }

    aluno: Aluno = new Aluno;
    alunos: Aluno[] = [];
    loadingAluno = false;

    turma: Turma = new Turma;
    turmas: Turma[] = [];
    loadingTurma = false;

    constructor(
        private confirmationService: ConfirmationService,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private crypto: Crypto,
        private aulasService: AulaService,
        private changeDetector: ChangeDetectorRef,
        private alunoService: AlunoService,
        private turmaService: TurmaService,
    ) {

        var list = this.aulasService.list.subscribe(res => this.calendario = res);
        this.subscription.push(list);

        var params = this.activatedRoute.params.subscribe(res => {
            if (res['object']) {
                this.loading = true;
                this.object = this.crypto.decrypt(res['object']);

                this.loadAluno();
                this.loadTurma();

                this.loading = false;
                this.visible = true;

            } else {
                this.visible = false;
                this.visibleChange()
            }
        })
        this.subscription.push(params);
    }

    ngAfterViewInit(): void {
    }

    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
    }

    visibleChange() {
        if (!this.visible) {
            var route = ['../../'] ;
            this.router.navigate(route, { relativeTo: this.activatedRoute });
        }
    }
    
    async loadAluno() {
        this.loadingAluno = true;
        await lastValueFrom(this.alunoService.getList())
        this.alunos = this.alunoService.list.value;
        this.aluno = this.alunos.find(x => x.id == this.object.aluno_Id) as Aluno;
        if (!this.aluno)
            this.visible = false;
        
        this.loadingAluno = false;

        this.loadCalendar();
    }
    
    async loadTurma() {
        this.loadingTurma = true;
        await lastValueFrom(this.turmaService.getList())
        this.turmas = this.turmaService.list.value;
        this.turma  = this.turmas.find(x => x.id == this.object.aluno_Id) as Turma;
        if (!this.aluno)
            this.visible = false;
        
        this.loadingAluno = false;

        this.loadCalendar();
    }

    loadCalendar() {

    }

    getDateWeek(date: Date, inicioAnoLetivo: Date) {
        const currentDate = (typeof date === 'object') ? date : new Date();
        inicioAnoLetivo = new Date(currentDate.getFullYear(), 0, 15);
        const daysToNextMonday = (inicioAnoLetivo.getDay() === 1) ? 0 : (7 - inicioAnoLetivo.getDay()) % 7;
        const nextMonday = new Date(currentDate.getFullYear(), 0, inicioAnoLetivo.getDate() + daysToNextMonday);

        return (currentDate < nextMonday) ? 52 : (currentDate > nextMonday ? Math.ceil((currentDate.valueOf() - nextMonday.valueOf()) / (24 * 3600 * 1000) / 7) : 1);
    }

    events(events: EventApi[]) {
        this.currentEvents.set(events);
        this.changeDetector.detectChanges(); // workaround for pressionChangedAfterItHasBeenCheckedError
    }

    eventClick(e: EventClickArg) {

    }


}

