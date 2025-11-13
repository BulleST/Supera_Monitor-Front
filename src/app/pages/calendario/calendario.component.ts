import { AfterViewInit, Component, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { Evento, EventoTipo } from '../../models/evento.model';
import { CalendarOptions, DatesSetArg } from '@fullcalendar/core';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { ConfirmationService } from 'primeng/api';
import { CalendarioDayView, CalendarioRequest, CalendarioView } from '../../models/calendario.model';
import { MobileService, ScreenWidth } from '../../utils/mobile';
import { lastValueFrom, Subscription } from 'rxjs';
import { SelectedEventoComponent } from './full-calendar/selected-evento/selected-evento.component';
import { getError, Header, showError } from '../../utils';
import { AccountService } from '../../services/account.service';
import { ToastrService } from 'ngx-toastr';
import { Evento_Participacao_Aluno } from '../../models/evento-participacao-aluno.model';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { EventoService } from '../../services/evento.service';
import { PseudoEvento } from '../../models/reposicao.model';
import { MensagemWhatsapp } from '../../utils/mensagem-whatsapp';
import { AlunoRestricaoService } from '../../services/aluno-restricao.service';
import { Feriado } from '../../models/feriado.model';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import moment from 'moment';
import 'moment/locale/pt-br';
import $ from 'jquery';
import { CalendarioUtils } from '../../utils/calendario-utils';
import { PerfilCognitivo } from '../../models/perfil-cognitivo.model';
import { PerfilCognitivoService } from '../../services/perfil-cognitivo.services';
import { SalaAndar } from '../../models/sala-aula.model';
import { DialogService } from 'primeng/dynamicdialog';
import { showAgendarReposicaoConfirm } from '../../utils/show-reposicao-confirm';

@Component({
    selector: 'app-calendario',
    standalone: false,
    templateUrl: './calendario.component.html',
    styleUrl: './calendario.component.css',
    providers: [ConfirmationService, DialogService],
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
        private service: EventoService,
        private alunoRestricaoService: AlunoRestricaoService,
        private accountService: AccountService,
        private perfilCognitivoService: PerfilCognitivoService,
        private confirmationService: ConfirmationService,
        private mobileService: MobileService,
        private header: Header,
        private toastrService: ToastrService,
        private mensagemWhatsapp: MensagemWhatsapp,
        private calendarioUtils: CalendarioUtils,
        private dialogService: DialogService,
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

        let calendar = this.fullCalendar.getApi();
        // var eventos = this.eventos.filter(x => !x.feriado);
        var eventos = this.eventos;

        let events = eventos.map(item => {
            const id = 'event-' + this.calendarioUtils.eventRandomId();
            const eventStyles = this.calendarioUtils.getEventStyles(item)

            if ([EventoTipo.Aula, EventoTipo.TurmaExtra].includes(item.evento_Tipo_Id)) {
                this.cdkEventItensId.push(id);
            }

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

        this.feriados.forEach(item => {
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
        let feriadosSemana = this.feriados.filter(x => moment(x.date).isBetween(this.calendarioRequest.intervaloDe, this.calendarioRequest.intervaloAte, 'date', '[]'));
        this.calendarioOptions.allDaySlot = feriadosSemana.length > 0;;

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
            $('#' + id).parents('.fc-event').removeClass('shadow-2 border-3 border-red-500')
        })
    }

    async cdkDrop(event: CdkDragDrop<Evento_Participacao_Aluno[]>, target: Evento) {
        if (this.cdkDragCancel) return;
        if (!this.selectedEvento) return;

        if (event.previousContainer != event.container) {

            let source = this.selectedEvento;
            let aluno = event.item.data as Evento_Participacao_Aluno;
            console.log('aluno', aluno)
            console.log('source', source)
            console.log('target', target)

            let erroMessage = '';

            if (target.vagasDisponiveisEvento === 0) {
                erroMessage = 'Essa aula atingiu o limite permitido de alunos.';
            }

            let perfil = target.perfilCognitivo.map(x => x.id);
            console.log('perfil target', perfil)
            console.log('perfil aluno', aluno.perfilCognitivo_Id)
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

            if (aluno.restricaoMobilidade && target.andar > SalaAndar.Terreo) {
                erroMessage = `O aluno tem mobilidade reduzida e não pode repor aula na sala ${target.sala} - ${target.andar}º andar`;
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

                if (restricoes.filter(x => !x.active).length > 0) {

                    message = 'Este aluno possui algumas restrições. <ul>'
                    if (restricoes.filter(x => !x.active).length > 0) {
                        message += restricoes.map(x => `<li>${x.descricao}</li>`);
                    }
                    message += '</ul>Deseja continuar?'

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
                            this.showAgendarReposicaoConfirm(event.event, aluno, source, target);
                            this.cdkCancelDrag('keyup')
                        },
                        reject: () => {
                            this.cdkCancelDrag('keyup')
                        }
                    });

                } else {
                    this.showAgendarReposicaoConfirm(event.event, aluno, source, target);
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

    showAgendarReposicaoConfirm(e: any, aluno: Evento_Participacao_Aluno, source: Evento, target: Evento) {
        var ref = showAgendarReposicaoConfirm(aluno, source, target, this.dialogService);
        var onClose = ref.onClose.subscribe(confirmacaoCancelada => {
            if (confirmacaoCancelada) {
                this.cdkCancelDrag('keyup');
            }
            else {
                this.service.calendarioReload.emit(1);
            }
        });
        this.subscription.push(onClose);
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

    requestLoadCalendario() {
        this.loading = true;
        return lastValueFrom(this.service.getList(this.calendarioRequest))
            .then(res => {
                this.feriados = res.feriados;
                this.eventos = res.eventos;
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

