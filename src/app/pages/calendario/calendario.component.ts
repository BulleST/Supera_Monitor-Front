import { AfterViewInit, ChangeDetectorRef, Component, HostListener, OnDestroy, signal, ViewChild } from '@angular/core';
import { Evento, EventoTipo } from '../../models/evento.model';
import { CalendarOptions, DatesSetArg } from '@fullcalendar/core';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { ConfirmationService } from 'primeng/api';
import { CalendarioDayView, CalendarioRequest, CalendarioView } from '../../models/calendario.model';
import { MobileService, ScreenWidth } from '../../utils/mobile';
import { lastValueFrom, Observable, Subscription } from 'rxjs';
import { SelectedEventoComponent } from './full-calendar/selected-evento/selected-evento.component';
import { getError, Header, showError } from '../../utils';
import { AlunoService } from '../../services/alunos.service';
import { AccountService } from '../../services/account.service';
import { ToastrService } from 'ngx-toastr';
import { Evento_Participacao_Aluno } from '../../models/evento-participacao-aluno.model';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { EventoService } from '../../services/evento.service';
import { PseudoEvento, ReposicaoAlunoRequest } from '../../models/reposicao.model';
import { RequestResponse } from '../../helpers/request-response.interface';
import { MensagemWhatsapp } from '../../utils/mensagem-whatsapp';
import { AlunoRestricaoService } from '../../services/aluno-restricao.service';
import { Feriado } from '../../models/feriado.model';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import moment from 'moment';
import 'moment/locale/pt-br';
import $ from 'jquery';
import { CalendarioUtils } from '../../utils/calendario-utils';
import { PerfilCognitivo } from '../../models/perfil-cognitivo.model';
import { PerfilCognitivoService } from '../../services/perfil-cognitivo.services';

@Component({
    selector: 'app-calendario',
    standalone: false,
    templateUrl: './calendario.component.html',
    styleUrl: './calendario.component.css',
    providers: [ConfirmationService],
})
export class CalendarioComponent implements OnDestroy, AfterViewInit {
    subscription: Subscription[] = [];
    screen: ScreenWidth = ScreenWidth.lg;
    ScreenWidth = ScreenWidth;
    eventos: Evento[] = [];
    selectedEvento?: Evento;
    cdkEventItensId: string[] = [];
    loading = false;
    observacaoReposicao: string = '';
    loadedAnos: number[] = [];

    @ViewChild('fullCalendar') fullCalendar!: FullCalendarComponent;
    @ViewChild('popoverComponent') popoverComponent!: SelectedEventoComponent;

    feriados: Feriado[] = [];
    loadingFeriados = false;

    perfilCognitivo: PerfilCognitivo[] = [];
    loadingPerfilCognitivo = false;

    cdkDragCancel = false;
    calendarioDayView = CalendarioDayView.Semana;
    calendarioRequest: CalendarioRequest = new CalendarioRequest;
    calendarioOptions: CalendarOptions = {
        // initialDate: new Date(2025,11,28),
        initialView: 'timeGridWeek',
        themeSystem: 'standard',
        locale: 'pt-BR',
        plugins: [
            dayGridPlugin,
            interactionPlugin,
            timeGridPlugin,
        ],
        hiddenDays: [0],
        dayHeaders: true,
        weekends: true,
        weekNumbers: false,
        expandRows: true,
        editable: false,
        selectable: false,
        showNonCurrentDates: true,
        allDaySlot: false,
        headerToolbar: {
            left: '',
            center: '',
            right: ''
        },
        scrollTime: '08:00:00',
        // scrollTime: moment().subtract(2, 'hour').startOf('hour').format('HH:mm:ss').toString(),
        scrollTimeReset: true,
        nowIndicator: true,
        eventStartEditable: false,
        eventDurationEditable: false,
        handleWindowResize: false,
        slotDuration: '00:30:00',
        height: '100%',
        datesSet: this.datesSet.bind(this),
        windowResize: this.scrollToTime.bind(this),
    }

    constructor(
        private changeDetector: ChangeDetectorRef,
        private confirmationService: ConfirmationService,
        private header: Header,
        private service: EventoService,
        private alunoService: AlunoService,
        private alunoRestricaoService: AlunoRestricaoService,
        private accountService: AccountService,
        private mobileService: MobileService,
        private toastrService: ToastrService,
        private mensagemWhatsapp: MensagemWhatsapp,
        private calendarioUtils: CalendarioUtils,
        private perfilCognitivoService: PerfilCognitivoService,
    ) {

        let screen = this.mobileService.get().subscribe(res => {
            this.screen = res;
            if (this.fullCalendar) {
                this.fullCalendar.getApi().updateSize();
            }
        });
        this.subscription.push(screen);

        let open = this.header.menuAsideOpen.subscribe(res => {
            if (this.fullCalendar) {
                this.fullCalendar.getApi().updateSize();
            }
        });
        this.subscription.push(open);


        let perfilCognitivo = this.perfilCognitivoService.list.subscribe(res => this.perfilCognitivo = res);
        this.subscription.push(perfilCognitivo);

        let feriados = this.service.feriados.subscribe(res => this.feriados = res);
        this.subscription.push(feriados);

        if (this.perfilCognitivo.length == 0) {
            this.loadingPerfilCognitivo = true;
            lastValueFrom(this.perfilCognitivoService.getList('calendario'))
                .then(res => this.loadingPerfilCognitivo = false)
                .catch(res => this.loadingPerfilCognitivo = false);
        }

        let calendarioReload = this.service.calendarioReload.subscribe(res => this.update());
        this.subscription.push(calendarioReload);

        let calendarView = this.service.calendarView.subscribe(view => {
            if (view == CalendarioView.MeuCalendario) {
                let account = this.accountService.accountValue;
                this.calendarioRequest.professor_Id = account?.professor_Id;
                this.eventos = [];
            } else {
                this.calendarioRequest.professor_Id = undefined;
            }


            this.service.calendarioReload.emit(1);
        })
        this.subscription.push(calendarView);
    }

    ngOnDestroy(): void {
        this.subscription.forEach(e => e.unsubscribe());
    }

    ngAfterViewInit(): void {
        this.scrollToTime();
    }


    // INICIO Controles do calendario
    async update() {
        this.unselectAula();

        let anoDe = this.calendarioRequest.intervaloDe!.getFullYear();
        let anoAte = this.calendarioRequest.intervaloAte!.getFullYear();

        if (!(this.loadedAnos.includes(anoDe) && this.loadedAnos.includes(anoAte))) {
            if (!this.loadedAnos.includes(anoDe)) {

                this.loadedAnos.push(anoDe);
                await this.requestLoadFeriados(anoDe);
                await this.requestCancelarEventos(anoDe);
            }
            if (!this.loadedAnos.includes(anoAte)) {
                this.loadedAnos.push(anoAte);
                await this.requestLoadFeriados(anoAte);
                await this.requestCancelarEventos(anoAte);
            }
        }
        await this.requestLoadCalendario()
        this.setCalendario();
        this.scrollToTime();

    }

    scrollToTime() {
        if (this.fullCalendar && this.fullCalendar.getApi()) {
            // let scrollTime = moment().subtract(1, 'hour').startOf('hour')
            // this.fullCalendar.getApi().scrollToTime({
            //     hour: scrollTime.hour()
            // })
        }
    }

    setCalendario() {

        this.loading = true;
        this.cdkEventItensId = [];

        // Apenas eventos que não caem em um feriado
        // let eventos = this.eventos.filter(evento => {
        //     let temFeriado = this.feriados.find(x => moment(x.date).isSame(evento.data, 'date'))
        //     evento.feriado = temFeriado;
        //     return !temFeriado;
        // });

        let calendar = this.fullCalendar.getApi();
        let de = this.calendarioRequest.intervaloDe;
        let ate = this.calendarioRequest.intervaloAte;
        let feriados = this.feriados.filter(x => moment(x.date).isBetween(de, ate, 'days', '[]'));

        let events = this.eventos.map(item => {
            const id = 'event-' + this.calendarioUtils.eventRandomId();
            const eventStyles = this.calendarioUtils.getEventStyles(item)

            if ([EventoTipo.Aula, EventoTipo.TurmaExtra].includes(item.evento_Tipo_Id)) {
                this.cdkEventItensId.push(id);
            }

            item.feriado = this.feriados.find(x => moment(x.date).isSame(item.data, 'date'))

            let event: any = {
                id: id,
                backgroundColor: eventStyles.backgroundColor,
                borderColor: eventStyles.borderColor,
                textColor: eventStyles.textColor,
                title: item.turma ?? item.descricao,
                start: moment(item.data).toDate(),
                end: moment(item.data).add(item.duracaoMinutos, 'minutes').toDate(),
                extendedProps: item,
            }

            return event;
        });

        feriados.forEach(item => {
            let event = {
                id: this.calendarioUtils.eventRandomId(),
                textColor: 'white',
                backgroundColor: 'red',
                borderColor: 'red',
                title: item.name,
                start: moment(item.date).startOf('day').toDate(),
                end: moment(item.date).endOf('day').toDate(),
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

        if (calendar) {
            calendar.removeAllEvents();
            calendar.updateSize();
        }

        this.calendarioOptions.events = events;
        this.loading = false;
        this.scrollToTime();

        // Exibe ou esconde allDaySlot
        let temFeriadoNaSemana = feriados.length > 0;
        this.calendarioOptions.allDaySlot = temFeriadoNaSemana;

    }

    datesSet(arg: DatesSetArg) {
        this.loading = true;
        
        this.calendarioRequest.intervaloDe = arg.start;
        this.calendarioRequest.intervaloAte = moment(arg.end).subtract(1, 'day').toDate(); // Full calendar está terminando no domingo da semana seguinte
        this.unselectAula();

        this.update();

    }

    async selectEvento(e: any, item: Evento) {
        this.popoverComponent.hidePopover();
        let evento: Evento = { ...item };
        evento = this.loadReposicoes(evento);
        this.selectedEvento = evento;
        this.popoverComponent.showPopover(e, evento);
    }

    loadReposicoes(evento: Evento) {
         evento.alunos.map(async aluno => {
                if (aluno.reposicaoDe_Evento_Id) {
                    aluno.reposicaoDe_Evento = await lastValueFrom(this.service.get(aluno.reposicaoDe_Evento_Id))
                }
                if (aluno.reposicaoPara_Evento_Id) {
                    aluno.reposicaoPara_Evento = await lastValueFrom(this.service.get(aluno.reposicaoPara_Evento_Id))
                }
                return aluno;
            })
        return evento;
    }

    unselectAula() {
        this.selectedEvento = undefined;
        this.popoverComponent.evento = undefined as any;
        this.popoverComponent.hidePopover();
    }

    cdkCancelDrag(where: string) {
        this.cdkDragCancel = true;
        this.cdkEventItensId.forEach(id => {
            $('#' + id).parents('.fc-event').removeClass('scalein animation-duration-200 animation-iteration-1')
            $('#' + id).parents('.fc-event').removeClass('sshadow-2 border-3 border-red-500')
        })
    }

    async cdkDrop(event: CdkDragDrop<Evento_Participacao_Aluno[]>, target: Evento) {
        if (this.cdkDragCancel) return;
        if (!this.selectedEvento) return;

        if (event.previousContainer != event.container) {

            let source = this.selectedEvento;
            let aluno = event.item.data as Evento_Participacao_Aluno;

            let erroMessage = '';

            if (target.vagasDisponiveisEvento === 0) {
                erroMessage = 'Essa aula atingiu o limite permitido de alunos.';
            }

            let perfil = target.perfilCognitivo.map(x => x.id);
            if (aluno.perfilCognitivo_Id && perfil.includes(aluno.perfilCognitivo_Id) == false) {
                erroMessage = 'Somente reposições entre alunos de turmas com mesmo perfil cognitivo são permitidas.';
            }

            if (target.alunos.find(x => x.aluno_Id == aluno.aluno_Id)) {
                erroMessage = 'Esse aluno já está atribuído à essa aula';
            }

            if (target.finalizado) {
                erroMessage = 'Essa aula já foi finalizada';
            }

            if (moment(source.data).format('YYYY-MM-DD HH:mm') == moment(target.data).format('YYYY-MM-DD HH:mm')) {
                erroMessage = 'O aluno não pode repor no mesmo dia e horário.';
            }

            if (aluno.reposicaoDe_Evento_Id) {
                erroMessage = 'O aluno não pode repor uma aula duas vezes.';
            }

            if (erroMessage) {
                this.cdkCancelDrag('keyup')
                document.dispatchEvent(new Event('mouseup'));
                return this.showError('Não autorizado', erroMessage, event.event);
            }


            if (target.data != source.data) {

                let restricoes = await lastValueFrom(this.alunoRestricaoService.getList(aluno.aluno_Id));
                aluno.restricoes = restricoes;

                let message = ``;

                if (restricoes.filter(x => !x.active).length > 0 || aluno.restricaoMobilidade) {

                    message = 'Este aluno possui algumas restrições. <br> <ul>'
                    if (aluno.restricaoMobilidade) {
                        message += `<li>Restrição de mobilidade</li>`
                    }
                    if (restricoes.filter(x => !x.active).length > 0) {
                        message += restricoes.map(x => `<li>${x.descricao}</li>`);
                    }
                    message += '</ul><br>Deseja continuar?'

                    this.confirmationService.confirm({
                        target: event.event.target as EventTarget,
                        message: message,
                        header: 'Atenção',
                        acceptIcon: 'pi pi-check',
                        acceptLabel: 'Continuar',
                        acceptButtonStyleClass: 'p-button-rounded',
                        rejectVisible: true,
                        rejectIcon: 'pi pi-times',
                        rejectLabel: 'Cancelar',
                        rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
                        accept: async () => {
                            this.agendaReposicaoConfirm(event.event, aluno, source, target);
                            this.cdkCancelDrag('keyup')
                        },
                        reject: () => {
                            this.cdkCancelDrag('keyup')
                        }
                    });

                } else {
                    this.agendaReposicaoConfirm(event.event, aluno, source, target);
                }

            }
        }
    }

    @HostListener('window:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            document.dispatchEvent(new Event('mouseup'));
            this.cdkCancelDrag('keyup')
        }
    }
    @HostListener('window:resize', ['$event'])
    onResize(event: Event) {
        this.scrollToTime();
    }

    showError(header: string, message: string, e: any) {
        showError(this.confirmationService, header, message, e);
    }

    agendaReposicaoConfirm(e: any, aluno: Evento_Participacao_Aluno, source: Evento, target: Evento) {
        this.confirmationService.confirm({
            key: 'agendarReposicao',
            message: `Agendar reposição do aluno(a) <b>${aluno.aluno}</b> para o dia ${moment(target.data).format('DD/MM/YYYY [às] HH[h]mm')}?`,
            header: 'Agendar reposição',
            acceptIcon: 'pi pi-check',
            acceptLabel: 'Agendar',
            acceptButtonStyleClass: 'p-button-rounded',
            rejectVisible: true,
            rejectIcon: 'pi pi-times',
            rejectLabel: 'Cancelar',
            rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
            accept: async () => {
                this.agendaReposicao(e, aluno, source, target);
                this.cdkCancelDrag('keyup')
            },
            reject: () => {
                this.cdkCancelDrag('keyup')
            }
        });
    }

    async agendaReposicao(e: any, aluno: Evento_Participacao_Aluno, source: Evento, target: Evento) {
        this.loading = true;

        let request = new ReposicaoAlunoRequest;
        request.aluno_Id = aluno.aluno_Id;
        request.source_Aula_Id = source.id;
        request.dest_Aula_Id = target.id;
        request.observacao = this.observacaoReposicao;
        let response: RequestResponse = { success: true, message: '', object: undefined };

        // Se a aula source não existir, cria a aula
        if (request.source_Aula_Id == PseudoEvento.EventoId) {
            response = await this.requestAulaTurma(source)
            request.source_Aula_Id = response.object.id;
            if (!response.success) {
                return this.showError('Reposição não agendada', `Ocorreu um erro ao agendar reposição. <br> ${response.message}`, e);
            }
        }

        // Se a aula target não existir, cria a aula
        if (request.dest_Aula_Id == PseudoEvento.EventoId) {
            response = await this.requestAulaTurma(target)
            request.dest_Aula_Id = response.object.id;
            if (!response.success) {
                return this.showError('Reposição não agendada', `Ocorreu um erro ao agendar reposição. <br> ${response.message}`, e);
            }
        }

        await lastValueFrom(this.alunoService.reposicao(request))
            .then(res => {
                this.loading = false;
                // this.selectedAluno = undefined;
                this.service.calendarioReload.emit(source.id);
                this.unselectAula();
                this.toastrService.success(`Reposição agendada para o dia ${moment(target.data).format('DD/MM/YYYY [às] HH[h]mm')}`)

                this.sendMensagemAluno(e, aluno, source, target);

                this.observacaoReposicao = '';

            })
            .catch(res => {
                this.loading = false;
                this.showError('Ocorreu um erro', `Não foi possível agendar reposição. <br> ${getError(res)}`, e)
            })
    }

    sendMensagemAluno(e: any, aluno: Evento_Participacao_Aluno, source: any, target: any) {
        if (aluno.celular) {

            this.confirmationService.confirm({
                target: e.target,
                message: `Reposição agendada com sucesso. <br> Clique para enviar mensagem de confirmação. <br> Celular: ${aluno.celular}`,
                header: 'Enviar whatsapp',
                icon: 'pi pi-whatsapp text-green-500 text-4xl',
                acceptIcon: 'pi pi-whatsapp',
                acceptLabel: `Enviar mensagem`,
                rejectLabel: 'Não enviar',
                acceptButtonStyleClass: 'p-button-rounded p-button-success',
                rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
                accept: () => {
                    let object = this.mensagemWhatsapp.enviarMensagemReposicao(aluno.aluno, aluno.celular!, source, target);
                    window.open(object.link, '_target');
                    this.mensagemWhatsapp.copiarMensagem(object.mensagem);
                },
            });
        }
    }

    getEventoTipo(e: Evento) {
        return this.calendarioUtils.getEventoTipo(e)
    }

    calendarDayViewChanged(e: CalendarioDayView) {
        this.calendarioDayView = e;
        if (e == CalendarioDayView.Dia) {
            this.fullCalendar.getApi().changeView('dayGridDay')
        } else {
            this.fullCalendar.getApi().changeView('timeGridWeek')
        }
    }


    requestLoadFeriados(ano: number = 2025) {
        return lastValueFrom(this.service.getFeriados(ano))
    }

    requestCancelarEventos(ano: number = 2025) {
        return lastValueFrom(this.service.cancelarEventos(ano))
    }

    requestLoadCalendario() {
        this.loading = true;
        return lastValueFrom(this.service.getList(this.calendarioRequest))
            .then(list => {
                this.eventos = list;
                this.loading = false;
            })
            .catch(res => {
                this.loading = false;
                this.toastrService.error(`Não foi possível carregar calendário. <br> ${getError(res)}`);
            })
    }

    requestAulaTurma(evento: Evento) {
        return this.calendarioUtils.requestAulaTurma(evento);
    }



}

