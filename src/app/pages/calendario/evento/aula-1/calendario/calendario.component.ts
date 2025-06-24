import {
  Input,
  signal,
  Component,
  OnChanges,
  OnDestroy,
  ViewChild,
  SimpleChanges,
  ChangeDetectorRef,
} from '@angular/core'

import moment from 'moment'
import { lastValueFrom, Subscription } from 'rxjs'
import { CalendarioUtils, showError } from '../../../../../utils'

import dayGridPlugin from '@fullcalendar/daygrid'
import { EventImpl } from '@fullcalendar/core/internal'
import { FullCalendarComponent } from '@fullcalendar/angular'
import { CalendarOptions, DatesSetArg, EventApi } from '@fullcalendar/core'

import { Popover } from 'primeng/popover'
import { ConfirmationService } from 'primeng/api'
import { Aluno } from '../../../../../models/alunos.model'
import { Feriado } from '../../../../../models/feriado.model'
import { Professor } from '../../../../../models/professor.model'
import {
  PrimeiraAulaRequest,
  PseudoEvento,
} from '../../../../../models/reposicao.model'
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
  @Input() object: Aluno | undefined = new Aluno()

  subscription: Subscription[] = []
  loading = false

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
    events: [],
    scrollTime: '10:00:00',
    eventStartEditable: false,
    eventDurationEditable: false,
    handleWindowResize: true,
    eventsSet: this.events.bind(this),
    datesSet: async (arg: DatesSetArg) => {
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

      if (!this.object) {
        this.fullCalendar.getApi().removeAllEvents()
        return
      }

      if (this.object.id) {
        await this.getCalendario()
        this.setCalendario()
      }
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
  ) {
    var professores = this.professorService.list.subscribe((res) => {
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

    var feriados = this.service.feriados.subscribe(
      (res) => (this.feriados = res),
    )
    this.subscription.push(feriados)
  }

  async ngOnChanges(changes: SimpleChanges) {
    if (changes['object']) {
      this.object = changes['object'].currentValue

      if (!this.fullCalendar) {
        // Fazer o compilador do JS calar a boca no primeiro render... poha
        return
      }

      if (!this.object) {
        this.fullCalendar.getApi().removeAllEvents()
        return
      }

      if (this.object.id) {
        this.calendarioRequest.intervaloDe = moment().startOf('month').toDate()
        this.calendarioRequest.intervaloAte = moment().endOf('month').toDate()
        this.calendarioRequest.perfil_Cognitivo_Id =
          this.object!.perfilCognitivo_Id
        this.update('')
      }
    }
  }

  selectEvent(evento: Evento): void {
    console.log('Evento selecionado:', evento)
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
        this.send(this.selectEvent)
      },
    })
  }

  async send(e: any) {
    this.loading = true

    var request = new PrimeiraAulaRequest()

    if (!this.object) {
      return this.toastrService.error('Aluno não selecionado')
    }

    if (!this.selectedEvento) {
      return this.toastrService.error('Evento não selecionado')
    }

    request.aluno_Id = this.object.id
    request.evento_Id = this.selectedEvento.id

    var response: RequestResponse = {
      success: true,
      message: '',
      object: undefined,
    }

    // Se a aula target não existir, cria a aula
    if (request.evento_Id == PseudoEvento.EventoId) {
      response = await this.calendarioUtils.requestAulaTurma(
        this.selectedEvento!,
      )
      request.evento_Id = response.object.id

      if (!response.success) {
        return showError(
          this.confirmationService,
          'Primeira aula não agendada',
          `Ocorreu um erro ao agendar primeira aula. <br> ${response.message}`,
          e,
        )
      }
    }

    response = await this.requestPrimeiraAula(request)

    if (response.success) {
      this.service.calendarioReload.emit(request.evento_Id)
      this.toastrService.success(response.message)
    } else {
      this.toastrService.error(response.message)
    }

    this.loading = false
  }

  requestPrimeiraAula(request: PrimeiraAulaRequest) {
    return lastValueFrom(this.alunoService.primeiraAula(request))
  }

  ngOnDestroy(): void {
    this.subscription.forEach((item) => item.unsubscribe())
  }

  async update(where: string) {
    await this.loadFeriados()
    await this.getCalendario()
    this.setCalendario()
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
    this.loading = true

    await lastValueFrom(this.service.calendario(this.calendarioRequest))
      .then((list) => {
        this.eventos = list
      })
      .catch()
      .finally(() => (this.loading = false))
  }

  setCalendario() {
    this.loading = true

    var calendar = this.fullCalendar.getApi()
    calendar.removeAllEvents()

    var feriadosDates = this.feriados.map((x) =>
      moment(x.date).format('YYYY-MM-DD'),
    )
    var eventos = this.eventos.filter(
      (x) =>
        x.evento_Tipo_Id != EventoTipo.Reuniao &&
        x.evento_Tipo_Id != EventoTipo.Oficina &&
        x.active == true &&
        feriadosDates.includes(moment(x.data).format('YYYY-MM-DD')) == false,
    )

    var events = eventos.map((item) => {
      var backgroundColor = item.corLegenda
        ? item.corLegenda
        : item.professores && item.professores.length > 0
        ? item.professores[0].corLegenda
        : '#2e2e2e'
      var textColor = this.calendarioUtils.getTextColor(backgroundColor)
      var id = 'event-' + this.calendarioUtils.eventRandomId()

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
      return event
    })

    this.feriados.forEach((item) => {
      var event = {
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
    this.loading = false
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
}
