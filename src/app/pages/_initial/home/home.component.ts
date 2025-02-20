import { Component, OnDestroy, AfterViewInit, signal, ChangeDetectorRef, ViewChild, ViewChildren, QueryList, HostListener } from '@angular/core';
import { CalendarOptions, DatesSetArg, EventApi, EventClickArg, EventDropArg, EventHoveringArg } from '@fullcalendar/core';
import { AulaService } from '../../../services/aulas.service';
import { lastValueFrom, Subscription } from 'rxjs';
import { ConfirmationService } from 'primeng/api';
import { Crypto, Header, MobileService } from '../../../utils';
import { ActivatedRoute, Router } from '@angular/router';
import { VerboseFormattingArg } from '@fullcalendar/core/internal';
import { Popover } from 'primeng/popover';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import multiMonthPlugin from '@fullcalendar/multimonth';
import listPlugin from '@fullcalendar/list';
import { CalendarioAlunoList, CalendarioList, CalendarioRequest, loadingEvents } from '../../../models/calendario.model';
import { AccountService } from '../../../services/account.service';
import { ProfessorService } from '../../../services/professor.service';
import { AccountResponse } from '../../../models/account.model';
import { ScreenWidth } from '../../../utils/mobile';
import $ from 'jquery';
import { Reposicao, ReposicaoRequest } from '../../../models/reposicao.model';
import { CdkDragDrop, CdkDragEnter, CdkDragExit, CdkDragStart } from '@angular/cdk/drag-drop';
import moment from 'moment';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { AlunoService } from '../../../services/alunos.service';
import { AulaCreateRequest } from '../../../models/aulas.model';
import { LoadingService } from '../../../parts/loading/loading';
import { ToastrService } from 'ngx-toastr';
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

    modalSelectedAlunoVisible = false;
    @ViewChild('popoverSelectedAluno') popoverSelectedAluno!: Popover;
    @ViewChild('popoverSelectedAula') popoverSelectedAula!: Popover;
    @ViewChild('fullCalendar') fullCalendar!: FullCalendarComponent;

    view: 'meuCalendario' | 'calendarioGeral' = 'calendarioGeral';

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
        startParam: '2025-01-01',
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
        customButtons: {
            atualizar: {
                text: 'atualizar',
                hint: 'atualizar',
                click: () => {
                    this.getCalendario({}, 'atualizar')
                }
            },

        },
        headerToolbar: {
            left: 'title',
            center: '',
            right: 'atualizar today prev next'
        },
        titleFormat: (arg: VerboseFormattingArg) => {
            const weekNumber = this.getDateWeek(arg.start.marker, new Date(2025, 1, 10));
            return `Semana ${weekNumber}`
        },
        nowIndicator: true,
        dayMaxEvents: true,
        // businessHours: true,
        events: loadingEvents,
        scrollTime: '08:00:00',
        eventStartEditable: false,
        eventDurationEditable: false,
        handleWindowResize: false,
        buttonText: {
            today: 'hoje',
            year: 'meses',
            month: 'mês',
            week: 'semana',
            day: 'dia',
            list: 'lista'
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
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private crypto: Crypto,
        private header: Header,
        private service: AulaService,
        private alunoService: AlunoService,
        private accountService: AccountService,
        private professorService: ProfessorService,
        private mobileService: MobileService,
        private loadingService: LoadingService,
        private toastrService: ToastrService,
    ) {

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
            console.log(view)
            if (view) {
                if (this.account && this.account?.role == "Assistant") {
                    var professores = this.professorService.list.value;
                    if (professores.length == 0) {
                        professores = await lastValueFrom(this.professorService.getList());
                    }
                    var professor = professores.find(x => x.account_Id == this.account!.id);
                    if (professor)
                        this.calendarioRequest.professor_Id = professor.id
                }

                this.calendarioRequest.professor_Id = this.account?.professor_Id ?? 15;
                this.calendarioList = [];

            } else {
                this.calendarioRequest.professor_Id = undefined
            }


            this.getCalendario(this.calendarioRequest, 'calendarioReload');

        })
        this.subscription.push(calendarView);
    }

    ngAfterViewInit(): void { }

    ngOnDestroy(): void {
        this.subscription.forEach(e => e.unsubscribe());
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

    async initCalendario() {
        this.loading = true;
        var account = this.accountService.accountSubject.value as AccountResponse;
        if (account?.role == "Assistant") {
            var professores = this.professorService.list.value;
            if (professores.length == 0) {
                professores = await lastValueFrom(this.professorService.getList());
            }
            var professor = professores.find(x => x.account_Id == account.id);
            if (professor)
                this.calendarioRequest.professor_Id = professor.id
        }

        const today = new Date();
        const day = today.getDay();
        const diff = today.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(today.setDate(diff));
        this.calendarioRequest.intervaloDe = monday;
        await this.getCalendario(this.calendarioRequest, 'initCalendar')
    }

    async getCalendario(request: CalendarioRequest, where: string) {
        this.loading = true;

        await lastValueFrom(this.service.getCalendario(request))
            .then(calendarioList => {

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
                this.toastrService.error('Não foi possível carregar calendário');
            })
    }

    setCalendario() {
        this.cdkEventItensId = [];

        this.calendarioOptions.events = this.calendarioList.map(item => {
            var event = {
                id: this.eventRamdomId(),
                backgroundColor: 'transparent',
                borderColor: 'transparent',
                title: item.turma,
                start: moment(item.data, 'YYYY-MM-DD HH:mm').toDate(),
                end: this.addHours(moment(item.data, 'YYYY-MM-DD HH:mm').toDate(), 2),
                data: item,
            }
            return event;
        });

        this.fullCalendar.getApi().updateSize()
        this.calendarioOptions.eventDidMount = (arg) => {
            this.cdkEventItensId.push('event-' + arg.event.id)
        }

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
                        // foreColor: this.getForeColor(item.corLegenda)
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
        let _loadingEvents = loadingEvents
            .sort((x, y) => x.start - y.start)
            .map(x => {
                x.start = moment(arg.start).add(new Date(x.start).getDay() - 1, 'days').format('YYYY-MM-DD') + x.start.substring(10)
                x.end = moment(arg.start).add(new Date(x.end).getDay() - 1, 'days').format('YYYY-MM-DD') + x.end.substring(10)
                return x
            })

        this.calendarioOptions.events = _loadingEvents;
        this.calendarioRequest.intervaloDe = new Date(arg.view.currentStart.getTime());
        this.calendarioRequest.intervaloAte = undefined;

        this.getCalendario(this.calendarioRequest, 'datesSet');

    }

    dateClick(e: DateClickArg) {
        // var item = e.event.extendedProps['data'] as Aulas_List;
        this.selectedAula = undefined;
        this.popoverSelectedAula.hide();
    }

    // eventClick(e: EventClickArg) {
    eventClick(item: CalendarioList, e: any) {
        console.log('eventClick', e)
        // this.selectedAula = e.event.extendedProps['data'] as CalendarioList;
        this.selectedAula = item;

        this.popoverSelectedAula.show(e);
        try {
            this.popoverSelectedAula.align()
        }
        catch (e) {

        } setTimeout(() => {
        }, 100);
        this.selectedAula.alunos = this.selectedAula.alunos.sort((x, y) => x.aluno < y.aluno ? -1 : x.aluno > y.aluno ? 1 : 0)
    }

    eventMouseEnter(e: EventHoveringArg) {
        $('.fc-event-hover-placeholder').remove()
        if (!this.loading) {
            $('body').append(`
            <div id="event-placeholder-${e.event.id}" 
                    class="fc-event-hover-placeholder text-white fixed z-2 fadein animation-duration-200 w-15rem"
                    style="bottom: 20px; left: 40px; " >
                ${$(e.el).find('.fc-event-main').html()}
            </div>
        `)
        }

    }

    eventMouseLeave(e: EventHoveringArg) {
        $('.fc-event-hover-placeholder').remove()
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

            if (target.turma_Tipo_Id != this.selectedAula?.turma_Tipo_Id) {
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

    cdkDragEntered(e: CdkDragEnter) {
        this.cdkDragCancel = false;
        console.log(e.container.element.nativeElement)
        $(e.container.element.nativeElement).not('#alunos').addClass('scalein animation-duration-200 animation-iteration-1')
        $(e.container.element.nativeElement).not('#alunos').addClass('shadow-2 border-3 border-red-500')
    }

    cdkDragExited(e: CdkDragExit) {
        this.cdkDragCancel = false;
        $(e.container.element.nativeElement).removeClass('scalein animation-duration-200 animation-iteration-1')
        $(e.container.element.nativeElement).removeClass('shadow-2 border-3 border-red-500')
    }

    @HostListener('window:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            document.dispatchEvent(new Event('mouseup'));
            this.cdkCancelDrag('keyup')
        }
    }

    cdkCancelDrag(where: string) {
        this.cdkDragCancel = true;
        this.cdkEventItensId.forEach(id => {
            $('#' + id).removeClass('scalein animation-duration-200 animation-iteration-1')
            $('#' + id).removeClass('sshadow-2 border-3 border-red-500')
        })
    }

    cdkDragStarted(e: CdkDragStart) {
        this.cdkDragCancel = false;
    }

    cdkDropListExited(e: CdkDragExit) {
        this.cdkDragCancel = false;
    }

    events(events: EventApi[]) {
        this.currentEvents.set(events);
        this.changeDetector.detectChanges(); // workaround for pressionChangedAfterItHasBeenCheckedError
    }

    showAluno(e: MouseEvent, aluno: CalendarioAlunoList) {
        aluno.loadingFoto = true;
        this.selectedAluno = aluno;
        this.modalSelectedAlunoVisible = true;
        lastValueFrom(this.alunoService.getFoto(aluno.aluno_Id))
            .then(res => {
                aluno.loadingFoto = false;
                aluno.aluno_Foto = res;
            })
            .catch(res => {
                aluno.loadingFoto = false;
            })
    }

    hideAluno() {
        if (!this.modalSelectedAlunoVisible) {
            this.selectedAluno = undefined;
            this.modalSelectedAlunoVisible = false
        }
    }

    goToAluno(aluno: CalendarioAlunoList) {
        this.router.navigate(['aluno', this.crypto.encrypt(aluno.aluno_Id)], { relativeTo: this.activatedRoute });
    }

    goToReposicao(aluno: CalendarioAlunoList) {
        if (this.selectedAula) {
            var reposicao: Reposicao = {
                aluno: aluno.aluno,
                aluno_Id: aluno.aluno_Id,
                source_Aula_Id: this.selectedAula.aula_Id,
                source_Data: this.selectedAula.data,
                source_Turma_Id: aluno.turma_Id,
                source_Turma: aluno.turma,
                source_Turma_Tipo_Id: this.selectedAula.turma_Tipo_Id,
                source_Turma_Tipo: this.selectedAula.turma_Tipo,
                source_Professor_Id: this.selectedAula.professor_Id,
                source_Professor: this.selectedAula.professor
            };
            // var encrypted = this.crypto.encrypt(reposicao);
            this.service.reposicao.next(reposicao);
            // localStorage.setItem('reposicao', encrypted ?? '')

            var queryParams = {
                a: aluno.aluno,
                b: aluno.aluno_Id,
                c: this.selectedAula.aula_Id,
                d: moment(this.selectedAula.data).format('YYYY-MM-DD[T]HH:mm:ss'),
                e: aluno.turma_Id,
                f: aluno.turma,
                g: this.selectedAula.turma_Tipo_Id,
                h: this.selectedAula.turma_Tipo,
                i: this.selectedAula.professor_Id,
                j: this.selectedAula.professor
            }
            this.router.navigate(['reposicao', this.crypto.encrypt(aluno.aluno_Id)], { relativeTo: this.activatedRoute, queryParams: queryParams } )
        }
    }

    goToAula() {
        if (this.selectedAula) {
            this.service.aula.next(this.selectedAula);
            // localStorage.setItem('aula', this.crypto.encrypt(this.selectedAula) ?? '')
            this.router.navigate(['aula', this.crypto.encrypt(this.selectedAula.aula_Id ?? 0)], { relativeTo: this.activatedRoute })
        }
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
        var reposicaoRequest = new ReposicaoRequest;
        reposicaoRequest.aluno_Id = aluno_Id;


        // Se a aula source não existir, cria a aula
        if (!source.aula_Id) {
            var aulaRequest: AulaCreateRequest = {
                turma_Id: source.turma_Id,
                data: moment(source.data).format('YYYY-MM-DD[T]HH:mm:ss') as unknown as Date,
                professor_Id: source.professor_Id,
                observacao: ''
            }

            await lastValueFrom(this.service.create(aulaRequest))
                .then(res => reposicaoRequest.source_Aula_Id = res.object.id)
                .catch(res => this.showError('Ocorreu um erro', `Não foi possível agendar reposição. \n (Aula source não foi inserida) \n ${res.error.message}`, e));

        }
        else {
            reposicaoRequest.source_Aula_Id = source.aula_Id;
        }

        // Se a aula target não existir, cria a aula
        if (!target.aula_Id) {
            var aulaRequest: AulaCreateRequest = {
                turma_Id: target.turma_Id,
                data: moment(target.data).format('YYYY-MM-DD[T]HH:mm:ss') as unknown as Date,
                professor_Id: target.professor_Id,
                observacao: ''
            }

            await lastValueFrom(this.service.create(aulaRequest))
                .then(res => reposicaoRequest.dest_Aula_Id = res.object.id)
                .catch(res => this.showError('Ocorreu um erro', `Não foi possível agendar reposição. \n (Aula target não foi inserida) \n ${res.error.message}`, e));

        } else {
            reposicaoRequest.dest_Aula_Id = target.aula_Id;
        }

        await lastValueFrom(this.alunoService.reposicao(reposicaoRequest))
            .then(res => {
                this.loading = false;
                this.popoverSelectedAula.hide();
                this.selectedAula = undefined;

                this.getCalendario(this.calendarioRequest, 'agendarReposicao');
                this.toastrService.success(`Reposição agendada para o dia ${moment(target.data).format('DD/MM/YYYY [às] HH[h]mm')}`)
            })
            .catch(res => {
                this.loading = false;
                this.showError('Ocorreu um erro', 'Não foi possível agendar reposição.', e)
            })
    }

}
