import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Monitoramento_Aluno, Monitoramento_Aluno_Item, Monitoramento_Aula, Monitoramento_Aula_Participacao_Rel, Monitoramento_Item_Status, Monitoramento_Participacao } from '../../../models/monitoramento.model';
import { DialogService, DynamicDialogComponent, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SalaAndar } from '../../../models/sala-aula.model';
import { PseudoEvento } from '../../../models/reposicao.model';
import { lastValueFrom, Subscription } from 'rxjs';
import { EventoService } from '../../../services/evento.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { Crypto, getError, showError } from '../../../utils';
import { AlunoService } from '../../../services/alunos.service';
import { showAluno } from '../../../utils/show-aluno';
import { Evento, EventoTipo } from '../../../models/evento.model';
import { Aluno } from '../../../models/alunos.model';
import { showContato } from '../../../utils/show-contato';
import { Evento_Participacao_Aluno, UpdateParticipacaoAlunoRequest } from '../../../models/evento-participacao-aluno.model';
import { ApostilaService } from '../../../services/apostila.service';
import { Apostila, ApostilaTipo } from '../../../models/apostila.model';
import { NgForm } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { MonitoramentoService } from '../../../services/monitoramento.service';

@Component({
	selector: 'app-aula-participacao',
	standalone: false,
	templateUrl: './aula-participacao.component.html',
	styleUrl: './aula-participacao.component.css',
	providers: [ConfirmationService],
})
export class AulaParticipacaoComponent implements OnInit, OnDestroy {

	subscription: Subscription[] = [];

	item!: Monitoramento_Aluno_Item;
	aluno!: Monitoramento_Aluno;
	aula!: Monitoramento_Aula;
	participacao!: Monitoramento_Participacao;
	reposicaoPara?: Monitoramento_Aula_Participacao_Rel;

	eventoCalendario!: Evento
	alunoList!: Aluno

	loading = false;
	instance: DynamicDialogComponent | undefined;
	refChild: DynamicDialogRef | undefined;

	hoje = new Date;
	SalaAndar = SalaAndar;
	Monitoramento_Item_Status = Monitoramento_Item_Status;
	EventoTipo = EventoTipo;


	apostilasAHAluno: Apostila[] = [];
	apostilasAbacoAluno: Apostila[] = [];
	apostilas: Apostila[] = [];
	loadingApostilas = false;

	participacaoAluno!: Evento_Participacao_Aluno;

	selectedApostilaAbaco?: Apostila;
	selectedApostilaAH?: Apostila;

	readonly = false;



	constructor(
		private dialogService: DialogService,
		private ref: DynamicDialogRef,
		private confirmationService: ConfirmationService,
		private toastr: ToastrService,
		private alunoService: AlunoService,
		private eventoService: EventoService,
		private monitoramentoService: MonitoramentoService,
		private apostilaService: ApostilaService,
		private router: Router,
		private crypto: Crypto,

	) {
		this.instance = this.dialogService.getInstance(this.ref);

		let onReload = this.monitoramentoService.onReload.subscribe(res => {
			let dashboard = this.monitoramentoService.dashboard.subscribe(dashboard => {
				const aluno = dashboard.alunos.find(x => x.id == this.aluno.id) as Monitoramento_Aluno;
				const item = aluno?.items.find(x => x.id == this.item.id) as Monitoramento_Aluno_Item;
				const aula = item?.aula.aula as Monitoramento_Aula;
				const participacao = item?.aula.participacao as Monitoramento_Participacao;
				const reposicaoPara = item?.reposicaoPara as Monitoramento_Aula_Participacao_Rel;
				this.aluno = aluno;
				this.item = item;
				this.aula = aula;
				this.participacao = participacao;
				this.reposicaoPara = reposicaoPara;
			});
			this.subscription.push(dashboard);

		});
		this.subscription.push(onReload);

	}

	ngOnInit(): void {
		if (this.instance && this.instance.data) {
			this.aluno = this.instance.data['aluno'];
			this.item = this.instance.data['item'];
			this.aula = this.item.aula.aula;
			this.participacao = this.item.aula.participacao;
			this.reposicaoPara = this.item.reposicaoPara;

			let apostilas = this.apostilaService.listApostila.subscribe(res => {
				this.apostilas = res;
				this.setApostilaAluno();
			});
			this.subscription.push(apostilas);

			if (this.apostilas.length == 0) {
				this.loadingApostilas = true;
				lastValueFrom(this.apostilaService.getApostilas())
					.then(res => this.loadingApostilas = false)
					.catch(res => this.loadingApostilas = false);
			}
		}
	}

	ngOnDestroy(): void {
		this.subscription.forEach(item => item.unsubscribe());
	}

	close() {
		this.router.navigate(['monitoramento'])
		this.ref.close();
	}

	@HostListener('window:beforeunload', ['$event'])
	unloadHandler(event: Event) {
		this.close();
	}

	loadEvento() {
		return this.getAula()
			.then(res => this.eventoCalendario = res)
			.catch(res => {
				this.toastr.error(res.message, 'Erro')
				return res;
			})
	}

	loadAluno() {
		return lastValueFrom(this.alunoService.get(this.aluno.id))
			.then(res => this.alunoList = res)
			.catch(res => {
				this.toastr.error(res.message, 'Erro')
				return res;
			})
	}

	setApostilaAluno() {
		let participacao =
			this.reposicaoPara ?
				{ ...this.reposicaoPara.participacao } :
				{ ...this.participacao };

		this.participacaoAluno = {
			id: participacao.id,
			aluno_Id: this.aluno.id,
			aluno: this.aluno.nome,
			evento_Id: PseudoEvento.EventoId,
			presente: participacao.presente,
			observacao: participacao.observacao,
			deactivated: participacao.deactivated,
			reposicaoDe_Evento_Id: participacao.reposicaoDe_Evento_Id,
			primeiraAula: participacao.primeiraAula,
			primeiraAula_Id: this.aluno.primeiraAula_Id,

			apostila_Abaco_Id: participacao.apostila_Abaco_Id,
			numeroPaginaAbaco: participacao.numeroPaginaAbaco,
			apostila_AH_Id: participacao.apostila_AH_Id,
			numeroPaginaAH: participacao.numeroPaginaAH,

			alunoContactado: participacao.alunoContactado,
			statusContato_Id: participacao.statusContato_Id,
			contatoObservacao: participacao.contatoObservacao,

			// required but not used in this page
			apostilasAbacoList: [],
			apostilasAHList: [],
			created: new Date,
			active: true,
			restricaoMobilidade: false,
			restricoes: []
		};

		this.selectedApostilaAbaco = this.apostilas.find(x => x.id == participacao.apostila_Abaco_Id);
		this.selectedApostilaAH = this.apostilas.find(x => x.id == participacao.apostila_AH_Id);


		if (this.aluno.apostila_Kit_Id) {
			this.apostilasAbacoAluno = this.apostilas.filter(x => x.apostila_Kit_Id == this.aluno.apostila_Kit_Id && x.apostila_Tipo_Id == ApostilaTipo.Abaco);
			this.apostilasAHAluno = this.apostilas.filter(x => x.apostila_Kit_Id == this.aluno.apostila_Kit_Id && x.apostila_Tipo_Id == ApostilaTipo.AH);
		}
		else {
			this.apostilasAbacoAluno = this.apostilas.filter(x => x.apostila_Tipo_Id == ApostilaTipo.Abaco);
			this.apostilasAHAluno = this.apostilas.filter(x => x.apostila_Tipo_Id == ApostilaTipo.AH);
		}


		this.readonly = !this.participacaoAluno.presente
			|| !this.participacaoAluno.active
	}

	async goToAula() {
		if (!this.eventoCalendario)
			await this.loadEvento();
		let evento = this.eventoCalendario;

		if (evento.alunos && evento.alunos.length) {
			evento.alunos = evento.alunos.map(x => {
				if (!evento!.finalizado) {
					if (x.presente !== true && x.presente !== false) {
						x.presente = true;
					}
				}
				return x
			});
		}

		if (evento.professores && evento.professores.length) {
			evento.professores = evento.professores.map(x => {
				x.presente = evento!.finalizado ? x.presente : true;
				return x
			})
		}
		this.eventoService.setEvento(evento);
		this.router.navigate(['monitoramento', 'aula', 'finalizar', 'aula', this.crypto.encrypt(evento.id)]);
	}

	async goToAgendarFalta() {
		let reqs = [];
		if (!this.eventoCalendario) reqs.push(this.loadEvento())
		if (!this.alunoList) reqs.push(this.loadAluno())

		await Promise.all(reqs)

		this.eventoService.setEvento(this.eventoCalendario);
		this.alunoService.setAluno(this.alunoList);

		this.router.navigate(['monitoramento', 'aula', 'agendar', 'falta'], {
			queryParams: {
				evento_id: this.crypto.encrypt(this.eventoCalendario.id),
				aluno_id: this.crypto.encrypt(this.alunoList.id),
			}
		});
	}

	async goToAgendarReposicao() {
		let reqs = [];
		if (!this.eventoCalendario) reqs.push(this.loadEvento())
		if (!this.alunoList) reqs.push(this.loadAluno())

		await Promise.all(reqs)

		this.eventoService.setEventoReposicaoDe(this.eventoCalendario);
		this.alunoService.setAluno(this.alunoList)

		this.router.navigate(['monitoramento', 'aula', 'agendar', 'reposicao'], {
			queryParams: {
				evento_reposicao_de: this.crypto.encrypt(this.eventoCalendario.id),
				aluno_id: this.crypto.encrypt(this.aluno.id),
			}
		})
	}

	async goToPrimeiraAula() {
		let reqs = [];
		if (!this.eventoCalendario) reqs.push(this.loadEvento())
		if (!this.alunoList) reqs.push(this.loadAluno())

		await Promise.all(reqs)

		this.eventoService.setEvento(this.eventoCalendario);
		this.alunoService.setAluno(this.alunoList);

		this.router.navigate(['monitoramento', 'aula', 'agendar', 'primeira-aula'], {
			queryParams: {
				evento_id: this.crypto.encrypt(this.eventoCalendario.id),
				aluno_id: this.crypto.encrypt(this.alunoList.id),
			}
		});
	}

	getAula() {
		let aula = this.item.aula.aula;
		if (this.item.reposicaoPara) {
			aula = this.item.reposicaoPara.aula;
		}
		if (aula.id == PseudoEvento.EventoId)
			return lastValueFrom(this.eventoService.getPseudoAula(this.aluno.turma_Id, aula.data))
		return lastValueFrom(this.eventoService.get(aula.id))
	}

	showAluno() {
		showAluno(this.dialogService, this.aluno.id)
	}

	async showContatoFalta() {
		if (!this.eventoCalendario)
			await this.loadEvento();

		let participacao = this.eventoCalendario.alunos.find(x => x.aluno_Id == this.aluno.id) as Evento_Participacao_Aluno;

		showContato(this.dialogService, this.eventoCalendario, participacao)
	}


	showError(header: string, message: string, e: any, innerMessage?: string) {
		showError(this.confirmationService, header, message, e, innerMessage)
	}

	atualizarConfirm(e: any, form: NgForm) {
		if (form.invalid) {
			return this.showError('OPA!', `Não foi possível salvar! <br> Preencha os dados corretamente para continuar`, e);
		}
		this.confirmationService.confirm({
			target: e.target,
			message: `Tem certeza que deseja atualizar os dados?`,
			header: `Atualizar dados?`,
			acceptIcon: 'pi pi-check',
			acceptLabel: 'Atualizar',
			acceptButtonStyleClass: 'p-button-rounded',
			rejectVisible: true,
			rejectIcon: 'pi pi-times',
			rejectLabel: 'Cancelar',
			rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
			accept: async () => {
				this.atualizar(e)
			},
			reject: () => { },
		})

	}

	atualizar(e: any) {

		this.loading = true;
		let request: UpdateParticipacaoAlunoRequest = {
			participacao_Id: this.participacaoAluno.id,
			presente: this.participacaoAluno.presente,
			observacao: this.participacaoAluno.observacao,
			apostila_Abaco_Id: this.participacaoAluno.apostila_Abaco_Id,
			apostila_AH_Id: this.participacaoAluno.apostila_AH_Id,
			numeroPaginaAbaco: this.participacaoAluno.numeroPaginaAbaco,
			numeroPaginaAH: this.participacaoAluno.numeroPaginaAH,
			reposicaoDe_Evento_Id: this.participacaoAluno.reposicaoDe_Evento_Id,
			deactivated: this.participacaoAluno.deactivated,
			contatoObservacao: this.participacaoAluno.contatoObservacao,
			alunoContactado: this.participacaoAluno.alunoContactado,
			statusContato_Id: this.participacaoAluno.statusContato_Id,
		}
		lastValueFrom(this.eventoService.atualizarParticipacao(request))
			.then(res => {
				this.loading = false;
				if (res.success) {
					this.toastr.success('Dados atualizados com sucesso', 'Sucesso');
					this.monitoramentoService.onReload.emit()
				}
				else {
					this.showError('Erro', `Não foi possível atualizar dados <br> ${res.message}`, e);
					this.toastr.error('Não foi possível atualizar dados', 'Erro')
				}
			})
			.catch(res => {
				this.loading = false;
				this.showError('Erro', `Não foi possível atualizar dados`, e, getError(res));
				this.toastr.error('Não foi possível atualizar dados', 'Erro')
			})
	}
}