import { Input, signal, Component, OnChanges, OnDestroy, ViewChild, SimpleChanges, ChangeDetectorRef, Output, EventEmitter } from '@angular/core'

import moment from 'moment'
import { lastValueFrom, Subscription } from 'rxjs'
import { CalendarioUtils, MensagemWhatsapp, showError } from '../../../../../utils'

import dayGridPlugin from '@fullcalendar/daygrid'
import { EventImpl } from '@fullcalendar/core/internal'
import { FullCalendarComponent } from '@fullcalendar/angular'
import { CalendarOptions, DatesSetArg, EventApi } from '@fullcalendar/core'

import { Popover } from 'primeng/popover'
import { ConfirmationService } from 'primeng/api'
import { Aluno } from '../../../../../models/alunos.model'
import { Feriado } from '../../../../../models/feriado.model'
import { Professor } from '../../../../../models/professor.model'
import { PrimeiraAulaRequest, PseudoEvento } from '../../../../../models/reposicao.model'
import { EventoService } from '../../../../../services/evento.service'
import { EventoTipo, Evento } from '../../../../../models/evento.model'
import { CalendarioRequest } from '../../../../../models/calendario.model'
import { ProfessorService } from '../../../../../services/professor.service'
import { RequestResponse } from '../../../../../helpers/request-response.interface'
import { ToastrService } from 'ngx-toastr'
import { AlunoService } from '../../../../../services/alunos.service'

@Component({
    selector: 'app-calendario-aluno-options',
    templateUrl: './calendario.component.html',
    styleUrl: './calendario.component.css',
    standalone: false,
    providers: [ConfirmationService],
})
export class CalendarioAlunoOptionsComponent implements OnChanges, OnDestroy {
    @Input() aluno!: Aluno;
    @Output() onClose = new EventEmitter<boolean>();

    subscription: Subscription[] = []
    loading = false
    loadingCalendar = false

    legenda: { corLegenda: string; label: string }[] = []
    @ViewChild('fullCalendar') fullCalendar!: FullCalendarComponent
    @ViewChild('popoverSelectedAula') popoverSelectedAula!: Popover

    selectedEvento?: Evento = undefined

    selectedAula?: EventImpl
    professores: Professor[] = []
    loadingProfessores = false

    feriados: Feriado[] = []
    loadingFeriados = false
    ano = new Date().getFullYear()
    currentTitle = ''
    EventoTipo = EventoTipo

    calendarVisible = signal(false)
    currentEvents = signal<EventApi[]>([])
    eventos: Evento[] = []
    calendarioRequest: CalendarioRequest = new CalendarioRequest()
    calendarioOptions: CalendarOptions = {
        initialView: 'dayGridMonth',
        themeSystem: 'standard',
        locale: 'pt-BR',
        plugins: [dayGridPlugin],
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
            right: '',
        },
        visibleRange: {
            start: new Date,
        },
        events: [],
        scrollTime: '10:00:00',
        eventStartEditable: false,
        eventDurationEditable: false,
        handleWindowResize: true,
        eventsSet: this.events.bind(this),
        datesSet: (arg: DatesSetArg) => {
            this.dataSet(arg);
        },
    }

    constructor(
        private confirmationService: ConfirmationService,
        private changeDetector: ChangeDetectorRef,
        private service: EventoService,
        private alunoService: AlunoService,
        private calendarioUtils: CalendarioUtils,
        private professorService: ProfessorService,
        private toastrService: ToastrService,
        private mensagemWhatsapp: MensagemWhatsapp,
    ) {
        let professores = this.professorService.list.subscribe((res) => {
            this.professores = res
            this.setLegenda()
        })
        this.subscription.push(professores)

        if (this.professores.length == 0) {
            this.loadingProfessores = true
            lastValueFrom(this.professorService.getList())
                .then((res) => (this.loadingProfessores = false))
                .catch((res) => (this.loadingProfessores = false))
        }

        let feriados = this.service.feriados.subscribe(
            (res) => (this.feriados = res),
        )
        this.subscription.push(feriados)
    }

    ngOnDestroy(): void {
        this.subscription.forEach((item) => item.unsubscribe())
    }

    async ngOnChanges(changes: SimpleChanges) {
        this.fullCalendar.getApi().today()
        if (changes['object']) {
            this.aluno = changes['object'].currentValue

            if (!this.fullCalendar) {
                // Fazer o compilador do JS calar a boca no primeiro render... poha
                return
            }

            if (!this.aluno) {
                this.fullCalendar.getApi().removeAllEvents()
                return
            }

            if (this.aluno.id) {
                this.calendarioRequest.intervaloDe = moment().startOf('month').toDate()
                this.calendarioRequest.intervaloAte = moment().endOf('month').toDate()
                this.calendarioRequest.perfil_Cognitivo_Id = this.aluno!.perfilCognitivo_Id
                this.update('')
            }
        }
    }

    showError(header: string, message: string, e: any) {
        showError(this.confirmationService, header, message, e);
    }


    async update(where: string) {
        this.loadingCalendar = true;
        await this.loadFeriados()
        await this.getCalendario()
        this.setCalendario()
        this.loadingCalendar = false;
    }

    prev() {
        this.fullCalendar.getApi().prev()
    }

    next() {
        this.fullCalendar.getApi().next()
    }

    async today() {
        this.fullCalendar.getApi().today()

        this.calendarioRequest.intervaloDe = moment().startOf('week').toDate()
        this.calendarioRequest.intervaloAte = moment().endOf('week').toDate()

        await this.getCalendario()
        this.setCalendario()
    }

    events(events: EventApi[]) {
        this.currentEvents.set(events)
        this.changeDetector.detectChanges()
    }

    async getCalendario() {
        await lastValueFrom(this.service.calendario(this.calendarioRequest))
            .then((list) => {
                this.eventos = list.filter(evento => {
                    let temVaga = evento.alunos.length < evento.capacidadeMaximaAlunos;
                    let ehPerfilCompativel = (this.aluno.perfilCognitivo_Id && evento.perfilCognitivo.map(x => x.id).includes(this.aluno.perfilCognitivo_Id))
                        || (!this.aluno.perfilCognitivo_Id);

                    return temVaga && ehPerfilCompativel;
                })
            })
    }

    setCalendario() {
        let calendar = this.fullCalendar.getApi()
        calendar.removeAllEvents()

        let feriadosDates = this.feriados.map((x) => moment(x.date).format('YYYY-MM-DD'))
        let eventos = this.eventos.filter((x) => [EventoTipo.Aula, EventoTipo.AulaExtra].includes(x.evento_Tipo_Id) 
                                                && x.active == true 
                                                && feriadosDates.includes(moment(x.data).format('YYYY-MM-DD')) == false)

        let events = eventos.map((item) => {
            let backgroundColor = item.corLegenda
                ? item.corLegenda
                : item.professores && item.professores.length > 0
                    ? item.professores[0].corLegenda
                    : '#2e2e2e'
            let textColor = this.calendarioUtils.getTextColor(backgroundColor)
            let id = 'event-' + this.calendarioUtils.eventRandomId()

            let event: any = {
                id: id,
                backgroundColor: backgroundColor,
                borderColor: backgroundColor,
                textColor: textColor,
                title: item.turma ?? item.descricao,
                start: moment(item.data).toDate(),
                end: moment(item.data).add(item.duracaoMinutos, 'minutes').toDate(),
                extendedProps: item,
            }
            return event
        })

        this.feriados.forEach((item) => {
            let event = {
                id: this.calendarioUtils.eventRandomId(),
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
        this.calendarioOptions.events = events
        this.fullCalendar.getApi().updateSize()
    }

    setLegenda() {
        this.legenda = this.professores.map((professor) => {
            return {
                label: professor.nome ?? '',
                corLegenda: professor.corLegenda ?? '',
            }
        })
    }

    async loadFeriados() {
        this.loadingFeriados = true
        await lastValueFrom(this.service.getFeriados(this.ano))
            .then((res) => (this.loadingFeriados = false))
            .catch((res) => (this.loadingFeriados = false))
    }

    async dataSet(arg: DatesSetArg) {

        this.currentTitle = moment(arg.view.currentStart)
            .locale('pt')
            .format('MMMM [de] YYYY')
        this.currentTitle =
            this.currentTitle[0].toUpperCase() + this.currentTitle.substring(1)

        this.calendarioRequest.intervaloDe = arg.view.currentStart
        this.calendarioRequest.intervaloAte = arg.view.currentEnd

        if (
            this.ano != this.calendarioRequest.intervaloDe.getFullYear() ||
            this.feriados.length == 0
        ) {
            this.ano == this.calendarioRequest.intervaloDe.getFullYear()
            await this.loadFeriados()
        }

        if (!this.aluno) {
            this.fullCalendar.getApi().removeAllEvents()
            return
        }

        if (this.aluno.id) {
            await this.getCalendario()
            this.setCalendario()
        }
    }

    sendConfirmation(evento: Evento, e: any): void {
        this.selectedEvento = evento
        this.confirmationService.confirm({
            key: 'confirmarPrimeiraAula',
            header: 'Confirmar agendamento',
            icon: 'pi pi-whatsapp text-green-500',
            acceptLabel: `Concluir`,
            acceptIcon: 'pi pi-check',
            acceptButtonStyleClass: 'p-button-rounded',
            rejectVisible: false,
            accept: () => {
                this.send(e)
            },
        })
    }

    async send(e: any) {
        this.loading = true

        let request = new PrimeiraAulaRequest()

        if (!this.aluno) {
            return this.showError('Erro', `Selecione um aluno.`, e)
        }

        if (!this.selectedEvento) {
            return this.showError('Erro', `Selecione uma aula`, e)
        }

        request.aluno_Id = this.aluno.id
        request.evento_Id = this.selectedEvento.id

        let response: RequestResponse = { success: true, message: '', object: undefined };

        // Se a aula target não existir, cria a aula
        if (request.evento_Id == PseudoEvento.EventoId) {
            response = await this.calendarioUtils.requestAulaTurma(this.selectedEvento)
            request.evento_Id = response.object.id

            if (!response.success) {
                return this.showError('Erro', `Primeira aula não foi agendada. Ocorreu um erro ao agendar primeira aula. <br> ${response.message}`, e)
            }
        }

        response = await this.requestPrimeiraAula(request)

        if (response.success) {
            this.service.calendarioReload.emit(request.evento_Id)
            this.toastrService.success(response.message)
        } else {
            this.toastrService.error(response.message)
        }

        this.loading = false;
        this.sendMensagemAlunos(e);
    }

    requestPrimeiraAula(request: PrimeiraAulaRequest) {
        return lastValueFrom(this.alunoService.primeiraAula(request))
    }

    sendMensagemAlunos(e: any) {
        let aluno = this.aluno;
        if (aluno.celular) {
            this.confirmationService.confirm({
                target: e.target,
                message: `Agendamento concluído com sucesso. \n Envie uma mensagem de confirmação para o aluno que irá participar da aula.`,
                header: 'Enviar whatsapp',
                icon: 'pi pi-whatsapp text-green-500 text-4xl',
                acceptLabel: `Enviar mensagem`,
                acceptButtonStyleClass: 'p-button-rounded p-button-success',
                acceptIcon: 'pi pi-whatsapp',
                rejectLabel: 'Não enviar',
                rejectIcon: 'pi pi-times',
                rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
                accept: () => {
                    let object = this.mensagemWhatsapp.enviarMensagemAgendamento(aluno.nome, aluno.celular, this.selectedEvento!);
                    window.open(object.link, '_blank');
                    this.mensagemWhatsapp.copiarMensagem(object.mensagem);
                    this.onClose.emit(true);
                },
                reject: () => {
                    this.onClose.emit(true);
                }
            });
        }
    }

}
