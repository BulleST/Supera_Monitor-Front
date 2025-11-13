import { Input, signal, Component, OnChanges, OnDestroy, ViewChild, SimpleChanges, ChangeDetectorRef, Output, EventEmitter } from '@angular/core'
import moment from 'moment'
import { lastValueFrom, Subscription } from 'rxjs'
import { CalendarioUtils, showError } from '../../../../../utils'
import dayGridPlugin from '@fullcalendar/daygrid'
import { FullCalendarComponent } from '@fullcalendar/angular'
import { CalendarOptions, DatesSetArg, EventApi } from '@fullcalendar/core'
import { ConfirmationService } from 'primeng/api'
import { Aluno } from '../../../../../models/alunos.model'
import { Feriado } from '../../../../../models/feriado.model'
import { Professor } from '../../../../../models/professor.model'
import { PseudoEvento } from '../../../../../models/reposicao.model'
import { EventoService } from '../../../../../services/evento.service'
import { EventoTipo, Evento } from '../../../../../models/evento.model'
import { CalendarioRequest } from '../../../../../models/calendario.model'
import { ProfessorService } from '../../../../../services/professor.service'
import { ToastrService } from 'ngx-toastr'
import { SalaAndar } from '../../../../../models/sala-aula.model'

@Component({
  selector: 'app-aula1-calendario-select',
  standalone: false,
  templateUrl: './aula1-calendario-select.component.html',
  styleUrl: './../agendar-primeira-aula.component.css', 
    providers: [ConfirmationService],
  
})
export class Aula1CalendarioSelectComponent implements OnChanges, OnDestroy {
	subscription: Subscription[] = [];
	loading = false;

	@Input() aluno?: Aluno;
	@Output() onEventoChanged = new EventEmitter<Evento>();
	@Output() onVisibleChange = new EventEmitter<boolean>();

	evento?: Evento;

	professores: Professor[] = [];
	loadingProfessores = false;

	feriados: Feriado[] = [];
	loadingFeriados = false;

	legenda: { corLegenda: string; label: string }[] = [];



	@ViewChild('fullCalendar') fullCalendar!: FullCalendarComponent;
	ano = new Date().getFullYear();
	currentTitle = '';
	EventoTipo = EventoTipo;
	data: Date = moment().toDate();
	calendarVisible = signal(false);
	currentEvents = signal<EventApi[]>([]);
	eventos: Evento[] = [];
	calendarioRequest: CalendarioRequest = new CalendarioRequest();
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
			this.datesSet(arg);
		},
	};

	constructor(
		private confirmationService: ConfirmationService,
		private changeDetector: ChangeDetectorRef,
		private service: EventoService,
		private calendarioUtils: CalendarioUtils,
		private professorService: ProfessorService,
		private toastrService: ToastrService,
	) {
		let professores = this.professorService.list.subscribe((res) => {
			this.professores = res
			this.setLegenda()
		})
		this.subscription.push(professores)

		if (this.professores.length == 0) {
			this.loadingProfessores = true
			lastValueFrom(this.professorService.getList())
				.then(res => this.loadingProfessores = false)
				.catch(res => this.loadingProfessores = false)
		}

		let feriados = this.service.feriados.subscribe(res => this.feriados = res);
		this.subscription.push(feriados)
	}

	ngOnDestroy(): void {
		this.subscription.forEach((item) => item.unsubscribe())
	}

	async ngOnChanges(changes: SimpleChanges) {

		if (changes['aluno']) {
			this.aluno = changes['aluno'].currentValue;

			if (!this.fullCalendar) {
				// Fazer o compilador do JS calar a boca no primeiro render... poha
				return
			}

			if (!this.aluno) {
				this.fullCalendar.getApi().removeAllEvents()
				return
			}

			this.fullCalendar.getApi().today()

			if (this.aluno) {
				this.calendarioRequest.intervaloDe = moment().startOf('month').toDate();
				this.calendarioRequest.intervaloAte = moment().endOf('month').toDate();
				this.calendarioRequest.perfil_Cognitivo_Id = this.aluno!.perfilCognitivo_Id;

				this.update()
			}
		}
	}

	showError(header: string, message: string, e: any, innerMessage?: string) {
		showError(this.confirmationService, header, message, e, innerMessage);
	}


	async update() {
		this.loading = true;
		await this.loadFeriados()
		await this.getCalendario()
		this.setCalendario()
		this.loading = false;
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

	getCalendario() {
		var aluno = this.aluno as Aluno;
		return lastValueFrom(this.service.getList(this.calendarioRequest))
			.then(list => {
				this.eventos = list.eventos.filter(evento => {
					const eventoAtivo = evento.active;
					const ehAula = [EventoTipo.Aula, EventoTipo.TurmaExtra].includes(evento.evento_Tipo_Id);
					const ehPerfilCompativel = !aluno.perfilCognitivo_Id || evento.perfilCognitivo.map(x => x.id).includes(aluno.perfilCognitivo_Id)
					const eventoTemVaga = evento.vagasDisponiveisEvento > 0;
					const participacao = evento.alunos.find(x => x.aluno_Id == aluno.id);
					const salaValida = !aluno.restricaoMobilidade || evento.andar == SalaAndar.Terreo;

					let final = eventoAtivo
						&& ehAula
						&& ehPerfilCompativel
						&& ((eventoTemVaga && !participacao) || participacao)
						&& salaValida;

					return final;
				})
			})
	}

	setCalendario() {
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

	setLegenda() {
		this.legenda = this.professores.map((professor) => ({ label: professor.nome, corLegenda: professor.corLegenda }))
	}

	async loadFeriados() {
		this.loadingFeriados = true
		await lastValueFrom(this.service.getFeriados(this.ano))
			.then(res => this.loadingFeriados = false)
			.catch(res => this.loadingFeriados = false)
	}

	async datesSet(arg: DatesSetArg) {
		this.currentTitle = moment(arg.view.currentStart)
			.locale('pt')
			.format('MMMM [de] YYYY')
		this.currentTitle =
			this.currentTitle[0].toUpperCase() + this.currentTitle.substring(1)

		this.calendarioRequest.intervaloDe = arg.view.currentStart
		this.calendarioRequest.intervaloAte = arg.view.currentEnd

		let ano = moment(this.data).year();
		let temFeriado = this.feriados.filter(x => moment(x.date).year() == ano);

		if (!temFeriado.length || !this.feriados.length) {
			this.ano = ano;
			await this.loadFeriados()
		}

		await this.getCalendario()
		this.setCalendario()
	}


	selectEvento(e: any, evento?: Evento) {
		if (!this.aluno) {
			this.toastrService.error('Selecione um aluno')
		}
		else if (!evento) {
			this.evento = undefined
			this.onEventoChanged.emit(evento);
		}
		else {
			let data = moment(evento.data).format('DD/MM/YY [às] HH[h]mm');
			this.confirmationService.confirm({
				target: e.target,
				message: `Tem certeza que selectionar aula do dia <b>${data}</b>?`,
				header: 'Selecionar aula',
				acceptIcon: 'pi pi-check',
				rejectIcon: 'pi pi-times',
				acceptLabel: 'Selecioanr',
				rejectLabel: 'Cancelar',
				acceptButtonStyleClass: 'p-button-rounded',
				rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
				accept: () => {
					this.evento = evento;
					this.onEventoChanged.emit(this.evento)
				},
				reject: () => { },
			})
		}
	}
}
