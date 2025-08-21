import { ChangeDetectorRef, Component, EventEmitter, Input, Output, signal, SimpleChanges, ViewChild } from '@angular/core';
import { Aluno } from '../../../../models/alunos.model';
import { lastValueFrom, Subscription } from 'rxjs';
import { Evento, EventoTipo } from '../../../../models/evento.model';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { Popover } from 'primeng/popover';
import { EventImpl } from '@fullcalendar/core/internal';
import { Feriado } from '../../../../models/feriado.model';
import { CalendarOptions, DatesSetArg, EventApi } from '@fullcalendar/core';
import { CalendarioRequest } from '../../../../models/calendario.model';
import dayGridPlugin from '@fullcalendar/daygrid'
import { ConfirmationService } from 'primeng/api';
import { EventoService } from '../../../../services/evento.service';
import { AlunoService } from '../../../../services/alunos.service';
import { CalendarioUtils, MensagemWhatsapp, showError } from '../../../../utils';
import { ToastrService } from 'ngx-toastr';
import moment from 'moment';
import { PseudoEvento } from '../../../../models/reposicao.model';

@Component({
    selector: 'app-calendario',
    standalone: false,
    templateUrl: './calendario.component.html',
    styleUrl: './calendario.component.css'
})
export class CalendarioComponent {
    @Input() aluno!: Aluno;
    @Input() selected?: Evento;

    @Output() onSelect = new EventEmitter<Evento>();

    request: CalendarioRequest = new CalendarioRequest()
    subscription: Subscription[] = []
    loading = false
    selectedAula?: EventImpl

    @ViewChild('fullCalendar') fullCalendar!: FullCalendarComponent
    @ViewChild('popoverSelectedAula') popoverSelectedAula!: Popover


    feriados: Feriado[] = []
    loadingFeriados = false
    ano = new Date().getFullYear()
    currentTitle = ''
    EventoTipo = EventoTipo

    calendarVisible = signal(false)
    currentEvents = signal<EventApi[]>([])
    eventos: Evento[] = []
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
        datesSet: this.datesSet.bind(this),
    }

    constructor(
        private confirmationService: ConfirmationService,
        private changeDetector: ChangeDetectorRef,
        private service: EventoService,
        private alunoService: AlunoService,
        private calendarioUtils: CalendarioUtils,
        private toastrService: ToastrService,
    ) {

        let feriados = this.service.feriados.subscribe(res => (this.feriados = res))
        this.subscription.push(feriados)
    }

    ngOnDestroy(): void {
        this.subscription.forEach((item) => item.unsubscribe())
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['selected'])
            this.selected = changes['selected'].currentValue;

        if (changes['aluno']) {
            this.aluno = changes['aluno'].currentValue;
        }
    }

    showError(header: string, message: string, e: any, innerMessage?: string) {
        showError(this.confirmationService, header, message, e, innerMessage);
    }


    async update() {
        this.loading = true;
        await this.loadFeriados()
        await this.getCalendario()
        this.loading = false;
    }

    prev() {
        this.fullCalendar.getApi().prev()
    }

    next() {
        this.fullCalendar.getApi().next()
    }

    today() {
        this.fullCalendar.getApi().today()

        this.request.intervaloDe = moment().startOf('month').toDate()
        this.request.intervaloAte = moment().endOf('month').toDate()

        this.getCalendario()
    }

    events(events: EventApi[]) {
        this.currentEvents.set(events)
        this.changeDetector.detectChanges()
    }

    getCalendario() {
        this.request.aluno_Id = this.aluno.id;

        if (this.fullCalendar) {
            let api = this.fullCalendar.getApi();
            this.request.intervaloDe = moment(api.view.activeStart).toDate();
            this.request.intervaloAte = moment(api.view.activeEnd).toDate();
        }


        lastValueFrom(this.service.getList(this.request))
            .then(list => {
                this.eventos = list.filter(evento => {
                    const ehFinalizado = evento.finalizado;
                    const ehAtivo = evento.active;
                    const ehAula = [EventoTipo.Aula].includes(evento.evento_Tipo_Id);
                    const participacao = evento.alunos.find(x => x.aluno_Id == this.aluno.id);
                    const alunoEstaNaAula = !!participacao;
                    const alunoEstaPresente = participacao?.presente === true;
                    const alunoMarcouReposicao = participacao?.reposicaoDe_Evento_Id || participacao?.reposicaoPara_Evento_Id;

                    return !ehFinalizado
                        // && ehAtivo
                        && ehAula
                        && alunoEstaNaAula
                        && !alunoEstaPresente
                        && !alunoMarcouReposicao
                })

                this.setCalendario();
            })
    }

    setCalendario() {
        if (!this.fullCalendar) {
            return
        }
        let calendar = this.fullCalendar.getApi();
        if (calendar) {
            calendar.removeAllEvents()
        }

        let feriadosDates = this.feriados.map((x) => moment(x.date).format('YYYY-MM-DD'))
        let eventos = this.eventos.filter((x) => [EventoTipo.Aula, EventoTipo.TurmaExtra].includes(x.evento_Tipo_Id)
            && x.active == true
            && feriadosDates.includes(moment(x.data).format('YYYY-MM-DD')) == false)

        let events = eventos.map((item) => {
            let style = this.calendarioUtils.getEventStyles(item);
            let id = 'event-' + this.calendarioUtils.eventRandomId()

            let event: any = {
                id: id,
                backgroundColor: style.backgroundColor,
                borderColor: style.borderColor,
                textColor: style.textColor,
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

    loadFeriados() {
        this.loadingFeriados = true
        return lastValueFrom(this.service.getFeriados(this.ano))
            .then((res) => (this.loadingFeriados = false))
            .catch((res) => (this.loadingFeriados = false))
    }

    async datesSet(arg: DatesSetArg) {

        this.currentTitle = moment(arg.view.currentStart).locale('pt').format('MMMM [de] YYYY')
        this.currentTitle = this.currentTitle[0].toUpperCase() + this.currentTitle.substring(1)

        this.request.intervaloDe = moment(arg.view.activeStart).toDate();
        this.request.intervaloAte = moment(arg.view.activeEnd).toDate();

        if (this.ano != this.request.intervaloDe.getFullYear() || this.feriados.length == 0) {
            this.ano = this.request.intervaloDe.getFullYear()
            await this.loadFeriados()
        }

        this.getCalendario()
    }

    selectEvento(evento: Evento, e: any, arg: any) {
        const data = moment(evento.data).format('DD/MM/YY [às] HH[h]mm');

        this.confirmationService.confirm({
            target: e.target,
            message: `Selecionar aula do dia <b>${data}</b> na turma <b>${evento.descricao}</b>?`,
            header: 'Continuar',
            acceptIcon: 'pi pi-arrow-right p-button-icon-right',
            rejectIcon: 'pi pi-times',
            acceptLabel: 'Continuar',
            rejectLabel: 'Cancelar',
            acceptButtonStyleClass: 'p-button-rounded',
            rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
            accept: () => {
                this.selectedAula = arg.event;
                this.selected = evento;
                this.onSelect.emit(evento);
            },
        });

    }
}
