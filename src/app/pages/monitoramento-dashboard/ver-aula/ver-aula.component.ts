import { Component, OnDestroy, ViewChildren } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { lastValueFrom, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import moment from 'moment';
import { NgForm } from '@angular/forms';
import { Evento, EventoTipo } from '../../../models/evento.model';
import { Professor } from '../../../models/professor.model';
import { SalaAula } from '../../../models/sala-aula.model';
import { Roteiro } from '../../../models/roteiro.model';
import { Turma } from '../../../models/turma.model';
import { Evento_Participacao_Aluno } from '../../../models/evento-participacao-aluno.model';
import { AulaComponent } from '../../../shared/evento/aula/aula.component';
import { Aluno } from '../../../models/alunos.model';
import { SalaAulaService } from '../../../services/sala-aula.service';
import { ProfessorService } from '../../../services/professor.service';
import { AlunoService } from '../../../services/alunos.service';
import { EventoService } from '../../../services/evento.service';
import { TurmaService } from '../../../services/turma.service';
import { RoteiroService } from '../../../services/roteiro.service';
import { CalendarioUtils, getError, showError, validaAlunos, validaProfessores, validaSalaAulas } from '../../../utils';
import { PseudoEvento } from '../../../models/reposicao.model';
import { CalendarioRequest } from '../../../models/calendario.model';
import { RequestResponse } from '../../../helpers/request-response.interface';
import { EventoChamadaRequest } from '../../../models/evento-chamada.model';

@Component({
	selector: 'app-ver-aula',
	standalone: false,
	templateUrl: './ver-aula.component.html',
	styleUrl: './ver-aula.component.css',
	providers: [ConfirmationService],
})
export class VerAulaComponent implements OnDestroy {

	evento!: Evento;
	visible: boolean = false;
	loading = false;
	error: string = '';
	subscription: Subscription[] = [];
	tipoString = 'Aula';
	duracaoEvento = '';
	width = '1000px';
	tipo = EventoTipo;
	encryptedId = '';

	professores: Professor[] = [];
	loadingProfessores = false;

	salaAulas: SalaAula[] = [];
	loadingSalaAulas = false;

	roteiros: Roteiro[] = [];
	loadingRoteiros = false;

	turmas: Turma[] = [];
	loadingTurmas = false;

	eventos: Evento[] = [];
	loadingEventos = false;

	EventoTipo = EventoTipo;
	selectedAluno?: Evento_Participacao_Aluno;
	mensagensEnviadasAlunos: Evento_Participacao_Aluno[] = [];
	alunos: Aluno[] = [];
	loadingAlunos = false;

	@ViewChildren('componentForm') componentForm!: AulaComponent;


	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private confirmationService: ConfirmationService,
		private toastr: ToastrService,
		private salaAulaService: SalaAulaService,
		private professorService: ProfessorService,
		private alunoService: AlunoService,
		private service: EventoService,
		private turmaService: TurmaService,
		private roteiroService: RoteiroService,
		private calendarioUtils: CalendarioUtils,
	) {
		let params = this.activatedRoute.snapshot.params
		if (!params['evento_id']) {
			this.visible = false
			this.visibleChange()
			return
		}

		this.encryptedId = params['evento_id'];

		let roteiros = this.roteiroService.list.subscribe(res => this.roteiros = res)
		this.subscription.push(roteiros)

		if (this.roteiros.length == 0) {
			this.loadingRoteiros = true;
			lastValueFrom(this.roteiroService.getList(moment().year()))
				.then(res => this.loadingRoteiros = false)
				.catch(res => this.loadingRoteiros = false);
		}

		let professores = this.professorService.list.subscribe(res => this.professores = res)
		this.subscription.push(professores)

		if (this.professores.length == 0) {
			this.loadingProfessores = true;
			lastValueFrom(this.professorService.getList())
				.then(res => this.loadingProfessores = false)
				.catch(res => this.loadingProfessores = false);
		}

		let salaAula = this.salaAulaService.list.subscribe(res => this.salaAulas = res)
		this.subscription.push(salaAula)

		if (this.salaAulas.length == 0) {
			this.loadingSalaAulas = true;
			lastValueFrom(this.salaAulaService.getList())
				.then(res => this.loadingSalaAulas = false)
				.catch(res => this.loadingSalaAulas = false);
		}

		let alunos = this.alunoService.list.subscribe(res => this.alunos = res)
		this.subscription.push(alunos)

		if (this.alunos.length == 0) {
			this.loadingAlunos = true;
			lastValueFrom(this.alunoService.getList())
				.then(res => this.loadingAlunos = false)
				.catch(res => this.loadingAlunos = false);
		}

		let turmas = this.turmaService.list.subscribe(res => this.turmas = res)
		this.subscription.push(turmas)

		if (this.turmas.length == 0) {
			this.loadingTurmas = true;
			lastValueFrom(this.turmaService.getList())
				.then(res => this.loadingTurmas = false)
				.catch(res => this.loadingTurmas = false);
		}

		let eventos = this.service.eventos.subscribe(res => this.eventos = res.filter(x => x.active == true));
		this.subscription.push(eventos)

		let evento = this.service.getEvento().subscribe(async res => {
			if (res) {
				this.evento = res;
				this.visible = true;
				this.verificaDisponibilidade();
				this.tipoString = this.getTipo(this.evento);
				let alunosEvento = this.evento.alunos.map(x => x.aluno_Id);
				this.alunos = this.alunos.filter(x => alunosEvento.includes(x.id));

				if (this.evento.roteiro_Id == PseudoEvento.EventoId) {
					let roteiro = this.roteiros.find(x => moment(this.evento.data).isBetween(x.dataInicio, x.dataFim, 'days', '[]'))
					this.evento.roteiro_Id = roteiro?.id ?? PseudoEvento.EventoId
				}

				let minutos = this.evento.duracaoMinutos % 60
				let horas = this.evento.duracaoMinutos / 60
				let horaRedonda = horas - Math.floor(horas) == 0

				this.duracaoEvento = horaRedonda
					? horas.toString().padStart(2, '0') + 'h'
					: horas.toString().padStart(2, '0') + 'h' + minutos.toString().padStart(2, '0') + 'm';
			}
		})
		this.subscription.push(evento)
	}


	ngOnDestroy(): void {
		this.subscription.forEach((e) => e.unsubscribe())
	}

	visibleChange() {
		console.log('visibleChange', this.visible);
		if (!this.visible) {
			// let route = '../../../';
			this.router.navigate(['../../'], { relativeTo: this.activatedRoute })
			this.service.setEvento(undefined)
		}
	}

	showError(header: string, message: string, e: any, innerMessage?: string) {
		showError(this.confirmationService, header, message, e, innerMessage)
	}

	get roteiroEvento(): Roteiro | undefined {
		if (!this.evento?.roteiro_Id)
			return this.roteiros.find(x => moment(this.evento.data).isBetween(x.dataInicio, x.dataFim, 'dates', '[]'));
		return this.roteiros.find(r => r.id === this.evento.roteiro_Id);
	}

	async verificaDisponibilidade() {

		let valid = true

		this.loadingEventos = true
		let request: CalendarioRequest = new CalendarioRequest()

		let data = moment(this.evento.data).format('YYYY-MM-DD')

		request.intervaloDe = moment(data).toDate()
		request.intervaloAte = moment(data).add(1, 'day').toDate()

		this.loadingEventos = true
		await lastValueFrom(this.service.getList(request))
			.then(res => (this.loadingEventos = false))
			.catch(res => (this.loadingEventos = false))

		this.validaProfessores()
		this.validaSalaAulas()
		this.validaAlunos()

		return valid
	}

	validaSalaAulas() {
		this.salaAulas = validaSalaAulas(
			this.evento.data,
			this.evento.duracaoMinutos,
			this.salaAulas,
			this.eventos,
			undefined,
			this.evento.id)
	}

	validaProfessores() {
		this.professores = validaProfessores(
			this.evento.data,
			this.evento.duracaoMinutos,
			this.professores,
			this.eventos,
			undefined,
			this.evento.id)
	}

	validaAlunos() {
		this.alunos = validaAlunos(
			this.evento.data,
			this.evento.duracaoMinutos,
			this.alunos,
			this.eventos,
			undefined,
			this.evento.id)
	}

	professorChanged(professor: Professor) {
		this.validaProfessores()
	}

	salaAulaChanged(salaAula: SalaAula) {
		this.validaSalaAulas()
	}

	alunoChanged(aluno: Aluno) {
		this.validaAlunos()
	}

	getTipo(e: Evento) {
		return this.calendarioUtils.getEventoTipo(e)
	}

	sendConfirmation(e: any, form: NgForm) {
		if (form.invalid) {
			return this.showError('OPA!', `Não foi possível salvar! <br> Preencha os dados corretamente para continuar`, e);
		}

		this.confirmationService.confirm({
			target: e.target,
			message: `Tem certeza que deseja salvar?`,
			header: `Salvar Aula`,
			acceptIcon: 'pi pi-check',
			acceptLabel: 'Salvar',
			acceptButtonStyleClass: 'p-button-rounded',
			rejectVisible: true,
			rejectIcon: 'pi pi-times',
			rejectLabel: 'Cancelar',
			rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
			accept: async () => {
				this.send(e)
			},
			reject: () => { },
		})
	}

	send(e: any) {
		this.loading = true;
		this.requestCreateEdit()
			.then(res => {
				this.service.calendarioReload.emit(res.object.id)
				this.evento.id = res.object.id
				this.service.setEvento(this.evento)
				this.toastr.success('Dados atualizados com sucesso.')
				this.router.navigate(['calendario'])
				this.loading = false
			})
			.catch(res => {
				this.loading = false
				this.showError('OPA!', `Não foi possível salvar dados.`, e, getError(res))
			})
	}

	markChecklistAsDone() {
		if (this.componentForm && this.componentForm.onSave) {
			this.componentForm.onSave.emit(this.evento);
		}
	}

	requestCreateEdit() {
		return this.calendarioUtils.request(this.evento);
	}

	finalizarConfirmation(e: any) {
		this.confirmationService.confirm({
			target: e.target,
			message: `Tem certeza que deseja finalizar Aula? <br>Ao finalizar, não será possível alterar nenhuma informação.`,
			header: `Finalizar Aula`,
			acceptIcon: 'pi pi-check',
			acceptLabel: `Finalizar`,
			acceptButtonStyleClass: 'p-button-rounded p-button-icon-right',
			rejectIcon: 'pi pi-times',
			rejectLabel: 'Ainda não',
			rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
			accept: async () => {
				this.finalizar(e)
			},
		})
	}

	async finalizar(e: any) {
		this.loading = true

		let response: RequestResponse = await this.requestCreateEdit()
			.catch(res => {
				this.loading = false;
				this.showError('Erro', 'Não foi possível salvar alterações', e);
				return res
			})

		if (response.success) {
			this.evento.id = response.object.id;
			let eventoResponse = response.object as Evento;

			const request = this.buildFinalizar(eventoResponse);
			lastValueFrom(this.service.finalizar(request))
				.then(res => {
					this.loading = false;
					if (res.success) {
						this.markChecklistAsDone()
						this.visible = false
						this.visibleChange()
						this.service.calendarioReload.emit(this.evento.id)

						this.toastr.success(`Aula finalizada com sucesso.`, 'Sucesso');
					}
					else {
						this.toastr.error(`Não foi possível finalizar Aula.`, 'Erro');
						this.showError('Erro', `Não foi possível finalizar Aula.`, e, res.message)
					}
				})
				.catch(res => {
					this.error = res.message
					this.showError('Erro', `Não foi possível finalizar Aula.`, e, getError(res))
					this.loading = false
					console.error(res);
				})


		}
	}

	buildFinalizar(eventoResponse: Evento): EventoChamadaRequest {

		let request: EventoChamadaRequest = {
			evento_Id: this.evento.id,
			observacao: this.evento.observacao,
			alunos: this.evento.alunos.map(item => {
				let participacao = eventoResponse.alunos.find(x => x.aluno_Id == item.aluno_Id) as Evento_Participacao_Aluno;
				return {
					participacao_Id: participacao.id,
					observacao: item.observacao,
					presente: item.presente,
					apostila_Abaco_Id: item.apostilaAbacoObject?.id,
					apostila_AH_Id: item.apostilaAHObject?.id,
					numeroPaginaAbaco: item.numeroPaginaAbaco,
					numeroPaginaAH: item.numeroPaginaAH,
					reposicaoDe_Evento_Id: item.reposicaoDe_Evento_Id,
				}
			}),
			professores: eventoResponse.professores.map(item => {
				return {
					participacao_Id: item.id,
					observacao: item.observacao,
					presente: item.presente ?? false
				}
			}),
		}

		if (this.evento.evento_Tipo_Id == EventoTipo.Reuniao) {
			request.professores = this.evento.professores.map(item => {
				return {
					participacao_Id: item.id,
					observacao: item.observacao,
					presente: item.presente,
				}
			})
		}

		return request;
	}
}
