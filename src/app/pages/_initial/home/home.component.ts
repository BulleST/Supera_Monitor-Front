import { Component, OnDestroy, AfterViewInit, signal, ChangeDetectorRef, ViewChild,  HostListener } from '@angular/core';
import { CalendarOptions, DatesSetArg, EventApi, EventHoveringArg } from '@fullcalendar/core';
import { AulaService } from '../../../services/aulas.service';
import { lastValueFrom, Subscription } from 'rxjs';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { getError, Header, MobileService } from '../../../utils';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import multiMonthPlugin from '@fullcalendar/multimonth';
import listPlugin from '@fullcalendar/list';
import { CalendarioAluno, CalendarioAula, CalendarioRequest, CalendarioView, loadingEvents } from '../../../models/calendario.model';
import { AccountService } from '../../../services/account.service';
import { AccountResponse } from '../../../models/account.model';
import { ScreenWidth } from '../../../utils/mobile';
import $ from 'jquery';
import {  PseudoAula, ReposicaoAlunoRequest } from '../../../models/reposicao.model';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import moment from 'moment';
import 'moment/locale/pt-br'

import { FullCalendarComponent } from '@fullcalendar/angular';
import { AlunoService } from '../../../services/alunos.service';
import { AulaCreateRequest } from '../../../models/aulas.model';
import { ToastrService } from 'ngx-toastr';
import { Jornada } from '../../../models/jornada.model';
import { SelectedAulaComponent } from './selected-aula/selected-aula.component';
import { PerfilCognitivo } from '../../../models/perfil-cognitivo.model';
import { ListaEsperaRequest } from '../../../models/lista-espera.model';
import { ListaEsperaService } from '../../../services/lista-espera.service';
import { JornadaService } from '../../../services/jornada.service';

moment.locale('pt-br')

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
    selectedAula?: CalendarioAula;
    selectedAluno?: CalendarioAluno;
    legenda: { backgroundColor: string, label: string }[] = [];

    loading = true;
    headerOpen = true;
    cdkDragCancel = false;

    account?: AccountResponse;

    @ViewChild('fullCalendar') fullCalendar!: FullCalendarComponent;
    @ViewChild('selectedAulaComponent') selectedAulaComponent!: SelectedAulaComponent;

    viewMenu: MenuItem[] = [];
    // view: 'meuCalendario' | 'calendarioGeral' = 'calendarioGeral';
    view: CalendarioView = CalendarioView.MeuCalendario;

    jornadas: Jornada[] = [];
    loadingJornada = false;

    currentJornada?: Jornada;
    currentTitle = '';
    cdkEventItensId: string[] = [];
    calendarioRequest: CalendarioRequest = new CalendarioRequest;
    calendarioVisible = signal(false);
    currentEvents = signal<EventApi[]>([]);
    calendarioList: CalendarioAula[] = [];
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
        dayHeaders: true,
        weekends: false,
        weekNumbers: false,
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
        events: loadingEvents,
        scrollTime: '08:00:00',
        eventStartEditable: false,
        eventDurationEditable: false,
        handleWindowResize: false,
        buttonText: {
            today: 'hoje'
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
        private header: Header,
        private service: AulaService,
        private alunoService: AlunoService,
        private accountService: AccountService,
        private listaEsperaService: ListaEsperaService,
        private jornadaService: JornadaService,
        private mobileService: MobileService,
        private toastrService: ToastrService,
    ) {

        this.setView();

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

        var jornadas = this.jornadaService.list.subscribe(res => this.jornadas = res);
        this.subscription.push(jornadas);

        var calendarioReload = this.service.calendarioReload.subscribe(res => {
            this.getCalendario(this.calendarioRequest, 'calendarioReload');
        });
        this.subscription.push(calendarioReload);


        var calendarView = this.service.calendarView.subscribe(async view => {
            if (view == CalendarioView.MeuCalendario) {
                this.calendarioRequest.professor_Id = this.account?.professor_Id;
                this.calendarioList = [];
            } else {
                this.calendarioRequest.professor_Id = undefined
            }
        })
        this.subscription.push(calendarView);
    }

    ngAfterViewInit(): void { }

    ngOnDestroy(): void {
        this.subscription.forEach(e => e.unsubscribe());
    }


    update() {
        this.unselectAula();
        this.getCalendario(this.calendarioRequest, 'atualizar');
    }

    prev() {
        this.fullCalendar.getApi().prev();
    }

    next() {
        this.fullCalendar.getApi().next();
    }

    today() {
        this.fullCalendar.getApi().today();
    }

    setView() {
        this.viewMenu = [
            {
                label: 'Meu Calendário',
                value: CalendarioView.MeuCalendario,
                icon: 'pi pi-user',
            }, {
                label: 'Calendário Geral',
                value: CalendarioView.Geral,
                icon: 'pi pi-calendar',
            }
        ]
    }

    calendarViewChanged() {
        this.service.calendarView.next(this.view);
        if (this.view == CalendarioView.MeuCalendario) {
            this.calendarioRequest.professor_Id = this.account?.professor_Id;
            this.calendarioList = [];
        } else {
            this.calendarioRequest.professor_Id = undefined
        }
        this.getCalendario(this.calendarioRequest, 'subscriber')
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

    getCalendario(request: CalendarioRequest, where: string) {
        this.loading = true;

        setTimeout(() => {
             lastValueFrom(this.service.getCalendario(request))
            .then(calendarioList => {
                calendarioList.forEach(aula => {
                    var f = moment(aula.data).format('DD/MM/YYYY HH:mm');
                    var index = this.calendarioList.findIndex(x => x.turma_Id == aula.turma_Id && moment(x.data).format('DD/MM/YYYY HH:mm') == f);
                    aula.alunos = aula.alunos.filter(x => x.active)
                    if (index == -1)
                        this.calendarioList.push(aula);
                    else
                        this.calendarioList.splice(index, 1, aula);

                })

                this.service.calendario.next(this.calendarioList);

                this.setCalendario();
                this.setLegenda(this.calendarioList);
            })
            .catch(res => {
                this.loading = false;
                this.toastrService.error(`Não foi possível carregar calendário. \n ${getError(res)}`);
            })
        }, 1000);


       
    }

    setCalendario() {
        this.loading = true;
        this.cdkEventItensId = [];

        this.fullCalendar.getApi().removeAllEvents();
        this.calendarioOptions.events = this.calendarioList
                    .filter(x => x.active == true)
                    .map(item => {
                        var event = {
                            id: this.eventRamdomId(),
                            backgroundColor: 'transparent',
                            borderColor: 'transparent',
                            title: item.turma ?? item.descricao,
                            start: moment(item.data, 'YYYY-MM-DD HH:mm').toDate(),
                            end: this.addHours(moment(item.data, 'YYYY-MM-DD HH:mm').toDate(), 2),
                            extendedProps: item,
                        }
                        return event;
                    });

        this.cdkEventItensId = this.calendarioOptions.events.map(x => 'event-' + x.id)
        this.fullCalendar.getApi().updateSize();
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

    setLegenda(c: CalendarioAula[]) {
        this.legenda = [];
        c.forEach(item => {
            if (!this.legenda.find(x => x.backgroundColor == item.corLegenda && x.label == item.professor)) {
                this.legenda.push(
                    {
                        label: item.professor,
                        backgroundColor: item.corLegenda,
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
        this.unselectAula();
        
        this.loading = true;

        this.currentTitle = moment(arg.start).locale('pt').format('MMMM [de] YYYY');
        this.currentTitle = this.currentTitle[0].toUpperCase() + this.currentTitle.substring(1)
        this.getTemaSemana(arg);
        let _loadingEvents = loadingEvents
            .sort((x, y) => x.start - y.start)
            .map(x => {
                x.start = moment(arg.start).add(new Date(x.start).getDay() - 1, 'days').format('YYYY-MM-DD') + x.start.substring(10)
                x.end = moment(arg.start).add(new Date(x.end).getDay() - 1, 'days').format('YYYY-MM-DD') + x.end.substring(10)
                return x
            })

        this.calendarioOptions.events = JSON.parse(JSON.stringify(_loadingEvents));
        this.calendarioRequest.intervaloDe = new Date(arg.view.currentStart.getTime());
        this.calendarioRequest.intervaloAte = undefined;

        this.getCalendario(this.calendarioRequest, 'datesSet');

    }

    dateClick(e: DateClickArg) {
        this.selectedAula = undefined;
    }

    async selectAula(e: any, item: CalendarioAula) {
        item = JSON.parse(JSON.stringify(item));
        if (item.reposicaoDe_Aula_Id && !item.reposicaoDe_Aula) {
            await lastValueFrom(this.service.get(item.reposicaoDe_Aula_Id))
            .then(res => {
                item.reposicaoDe_Aula = res;
            })
        }

        if (item.aula_Id != PseudoAula.AulaId) {
            await lastValueFrom(this.listaEsperaService.getList(item.aula_Id))
        }


        this.selectedAula = item;
        this.selectedAulaComponent.selectedAula = item;
        this.selectedAulaComponent.showPopover(e);

        console.log('selectedAula 1', this.selectedAula)
    }

    unselectAula() {
        this.selectedAula = undefined;
        this.selectedAulaComponent.selectedAula = undefined;
        this.selectedAulaComponent.hidePopover();
    }

    eventMouseEnter(e: EventHoveringArg) {
        $('.fc-event-hover-placeholder').remove()
        if (!this.loading) {
            $('body').append(`<div id="event-placeholder-${e.event.id}" 
                                    class="fc-event-hover-placeholder text-white fixed z-2 fadein animation-duration-200 w-15rem"
                                    style="bottom: 20px; left: 40px; " >
                                ${$(e.el).find('.fc-event-main').html()}
                            </div>`)
        }

    }

    eventMouseLeave(e: EventHoveringArg) {
        $('.fc-event-hover-placeholder').remove()
    }

    cdkCancelDrag(where: string) {
        console.log('cdkCancelDrag', where)
        this.cdkDragCancel = true;
        this.cdkEventItensId.forEach(id => {
            $('#' + id).removeClass('scalein animation-duration-200 animation-iteration-1')
            $('#' + id).removeClass('sshadow-2 border-3 border-red-500')
        })
    }

    cdkDrop(event: CdkDragDrop<CalendarioAluno[]>, target: CalendarioAula) {
        console.log('cdkDrop', this.cdkDragCancel, this.selectedAula)
        if (this.cdkDragCancel) {
            return;
        }

        if (!this.selectedAula) {
            return;
        }
        if (target.finalizada) {
            document.dispatchEvent(new Event('mouseup'));
            this.cdkCancelDrag('keyup');
            return this.showError('Não autorizado', 'Essa aula já foi finalizada.', event.event);
        }

        if (event.previousContainer != event.container) {

            var source = this.selectedAula;

            if (target.alunos.length >= target.capacidadeMaximaAlunos) {
                document.dispatchEvent(new Event('mouseup'));
                this.cdkCancelDrag('keyup');
                return this.alunoListaEsperaConffirm(event.event, event.item.data, source, target);
                // return this.showError('Não autorizado', 'Essa aula atingiu o limite permitido de alunos.', event.event);
            }

            if (target.perfilCognitivo.map(x => x.id).includes(event.item.data.perfilCognitivo_Id) == false) {
                document.dispatchEvent(new Event('mouseup'));
                this.cdkCancelDrag('keyup')
                return this.showError('Não autorizado', 'Somente reposições entre alunos de turmas com mesmo perfil cognitivo são permididas.', event.event);

            }



            if (target.alunos.find(x => x.aluno_Id == event.item.data.aluno_Id)) {
                document.dispatchEvent(new Event('mouseup'));
                this.cdkCancelDrag('keyup')
                return this.showError('Não autorizado', 'Esse aluno já está marcado nessa aula', event.event);
            }


            if (target.data != source.data) {
                
                this.agendaReposicaoConffirm(event.event, event.item.data, source, target);
            }
            this.cdkCancelDrag('keyup')
        }
    }

    @HostListener('window:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            document.dispatchEvent(new Event('mouseup'));
            this.cdkCancelDrag('keyup')
        }
    }

    events(events: EventApi[]) {
        this.currentEvents.set(events);
        this.changeDetector.detectChanges(); // workaround for pressionChangedAfterItHasBeenCheckedError
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

    alunoListaEsperaConffirm(e: any, aluno: CalendarioAluno, source: CalendarioAula, target: CalendarioAula) {
        this.confirmationService.confirm({
            target: e.target,
            message: `Essa aula atingiu o limite permitido de alunos.\n Deseja inserir o aluno(a) <b>${aluno.aluno}</b> na lista de espera da aula no dia ${moment(target.data).format('DD/MM/YYYY [às] HH[h]mm')}?`,
            header: 'Aula cheia',
            icon: 'pi pi-exclamation-triangle',
            acceptIcon: 'pi pi-check',
            acceptLabel: 'Lista de espera',
            acceptButtonStyleClass: 'p-button-rounded p-button-sm px-3 mr-0',
            rejectVisible: true,
            rejectIcon: 'pi pi-times',
            rejectLabel: 'Cancelar',
            rejectButtonStyleClass: 'p-button-rounded p-button-sm p-button-outlined',
            accept: async () => {
                this.alunoListaEspera(e, aluno, this.selectedAula as CalendarioAula, target);
            },
            reject: () => {
            }
        });
    }

    async alunoListaEspera(e: any, aluno: CalendarioAluno, source: CalendarioAula, target: CalendarioAula) {
        this.loading = true;
        var request: ListaEsperaRequest = new ListaEsperaRequest;
        request.aluno_Id = aluno.aluno_Id;

        // Se a aula source não existir, cria a aula
        if (source.aula_Id == PseudoAula.AulaId) {
            var aulaRequest: AulaCreateRequest = {
                sala_Id: source.sala_Id,
                turma_Id: source.turma_Id ?? 0,
                professor_Id: source.professor_Id,
                data: moment(source.data).format('YYYY-MM-DD[T]HH:mm:ss') as unknown as Date,
                observacao: '',
                perfilCognitivo: source.perfilCognitivo
            }
            await lastValueFrom(this.service.create(aulaRequest))
                .catch(res => this.showError('Ocorreu um erro', `Não foi possível inserir aluno na lista de espera. \n (Aula source não foi inserida). \n ${getError(res)}`, e));
        }

        // Se a aula target não existir, cria a aula
        if (target.aula_Id == PseudoAula.AulaId) {
            var aulaRequest: AulaCreateRequest = {
                sala_Id: target.sala_Id,
                turma_Id: target.turma_Id ?? 0,
                professor_Id: target.professor_Id,
                data: moment(target.data).format('YYYY-MM-DD[T]HH:mm:ss') as unknown as Date,
                observacao: '',
                perfilCognitivo: target.perfilCognitivo
            }

            await lastValueFrom(this.service.create(aulaRequest))
                .then(res => request.aula_Id = res.object.aula_Id)
                .catch(res => this.showError('Ocorreu um erro', `Não foi possível inserir aluno na lista de espera. \n (Aula target não foi inserida). \n ${getError(res)}`, e));

        } else {
            request.aula_Id = target.aula_Id;
        }

        
        await lastValueFrom(this.listaEsperaService.inserirAlunoListaEspera(request))
            .then(res => {
                this.loading = false;
                this.selectedAulaComponent.hidePopover();
                this.selectedAula = undefined;

                // this.getCalendario(this.calendarioRequest, 'agendarReposicao');
                // this.toastrService.success(`Reposição agendada para o dia ${moment(target.data).format('DD/MM/YYYY [às] HH[h]mm')}`)
            })
            .catch(res => {
                this.loading = false;
                this.showError('Ocorreu um erro', `Não foi possível inserir aluno na lista de espera. \n ${getError(res)}`, e)
            })
    }

    agendaReposicaoConffirm(e: any, aluno: CalendarioAluno, source: CalendarioAula, target: CalendarioAula) {
      
        this.confirmationService.confirm({
            target: e.target,
            message: `Agendar reposição do aluno(a) <b>${aluno.aluno}</b> para o dia ${moment(target.data).format('DD/MM/YYYY [às] HH[h]mm')}?`,
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
                this.agendaReposicao(e, aluno.aluno_Id, source, target);
            },
            reject: () => {
                this.cdkCancelDrag('keyup')
            }
        });
        this.cdkCancelDrag('keyup')
    }

    async agendaReposicao(e: any, aluno_Id: number, source: CalendarioAula, target: CalendarioAula) {

        this.loading = true;
        var request = new ReposicaoAlunoRequest;
        request.aluno_Id = aluno_Id;

        // Se a aula source não existir, cria a aula
        if (source.aula_Id == PseudoAula.AulaId) {
            var aulaRequest: AulaCreateRequest = {
                sala_Id: source.sala_Id,
                turma_Id: source.turma_Id ?? 0,
                professor_Id: source.professor_Id,
                data: moment(source.data).format('YYYY-MM-DD[T]HH:mm:ss') as unknown as Date,
                observacao: '',
                perfilCognitivo: source.perfilCognitivo
            }

            await lastValueFrom(this.service.create(aulaRequest))
                .then(res => request.source_Aula_Id = res.object.aula_Id)
                .catch(res => this.showError('Ocorreu um erro', `Não foi possível agendar reposição. \n (Aula source não foi inserida). \n ${getError(res)}`, e));

        }
        else {
            request.source_Aula_Id = source.aula_Id;
        }

        // Se a aula target não existir, cria a aula
        if (target.aula_Id == PseudoAula.AulaId) {
            var aulaRequest: AulaCreateRequest = {
                sala_Id: target.sala_Id,
                turma_Id: target.turma_Id ?? 0,
                professor_Id: target.professor_Id,
                data: moment(target.data).format('YYYY-MM-DD[T]HH:mm:ss') as unknown as Date,
                observacao: '',
                perfilCognitivo: target.perfilCognitivo
            }

            await lastValueFrom(this.service.create(aulaRequest))
                .then(res => request.dest_Aula_Id = res.object.aula_Id)
                .catch(res => this.showError('Ocorreu um erro', `Não foi possível agendar reposição. \n (Aula target não foi inserida). \n ${getError(res)}`, e));

        } else {
            request.dest_Aula_Id = target.aula_Id;
        }

        this.getCalendario(this.calendarioRequest, 'agendarReposicao');
    
        await lastValueFrom(this.alunoService.reposicao(request))
            .then(res => {
                this.loading = false;
                this.selectedAulaComponent.hidePopover();
                this.selectedAula = undefined;

                this.getCalendario(this.calendarioRequest, 'agendarReposicao');
                this.toastrService.success(`Reposição agendada para o dia ${moment(target.data).format('DD/MM/YYYY [às] HH[h]mm')}`)
            })
            .catch(res => {
                this.loading = false;
                this.showError('Ocorreu um erro', `Não foi possível agendar reposição. \n ${getError(res)}`, e)
            })
    }

    async getTemaSemana(arg: any) {
        if (this.jornadas.length == 0) {
            this.loadingJornada = true;
            await lastValueFrom(this.jornadaService.getList())
            .then(res => this.jornadas = res);
            this.loadingJornada = false;
        }
        // var list: Jornada[] = JSON.parse(JSON.stringify(this.jornadas));
        this.jornadas = this.jornadas.map(x => {
            x.dataInicio = new Date(new Date(x.dataInicio).toDateString());
            x.dataFim = new Date(new Date(x.dataFim).toDateString());
            return x
        })
        this.jornadas.sort((x, y) => x.dataInicio < y.dataInicio ? -1 : x.dataInicio < y.dataInicio ? 1 : 0);
        var data = moment(arg.start, 'YYYY-MM-DD').toDate();

        var existe = this.jornadas.find(x => data >= x.dataInicio && data <= x.dataFim );
        this.currentJornada = existe;

    }

    getPerfilCognitivo(perfilCognitivo: PerfilCognitivo[]) {
        if (!perfilCognitivo || perfilCognitivo.length == 0)
            return '';
        return perfilCognitivo.map(x => x.nome).join(', ');
    }

}
