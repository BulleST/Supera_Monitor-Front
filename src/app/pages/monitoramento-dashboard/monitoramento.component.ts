import { Component, ElementRef, EventEmitter, OnDestroy, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { lastValueFrom, Subscription } from 'rxjs';
import moment from 'moment';
import { ConfirmationService, FilterMatchMode, SortEvent } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Popover } from 'primeng/popover';
import { Table } from 'primeng/table';
import { Monitoramento_Aluno, Monitoramento_Aluno_Item, Monitoramento_Item_Status, Monitoramento_Mes, Monitoramento_Request, Monitoramento_Roteiro } from '../../models/monitoramento.model';
import { PseudoEvento } from '../../models/reposicao.model';
import { CalendarioUtils, Crypto, MensagemWhatsapp } from '../../utils';
import { MonitoramentoService } from '../../services/monitoramento.service';
import { Aluno } from '../../models/alunos.model';
import { AulaParticipacaoComponent } from './aula-participacao/aula-participacao.component';
import { showAluno } from '../../utils/show-aluno-dialog-service';

@Component({
	selector: 'app-monitoramento',
	standalone: false,
	templateUrl: './monitoramento.component.html',
	styleUrl: './monitoramento.component.css',
	providers: [ConfirmationService, DialogService],

})
export class MonitoramentoComponent implements OnDestroy {
	alunos: Monitoramento_Aluno[] = [];
	loading = false;
	mesesAno: Monitoramento_Mes[] = [];
	meses: string[] = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];


	@ViewChildren('popoverSelectedAlunoAula') popoverSelectedAlunoAula!: QueryList<Popover>;
	@ViewChildren('popoverRoteiro') popoverRoteiro!: QueryList<Popover>;

	@ViewChild('toolbar') toolbar!: ElementRef;
	@ViewChild('dt') dt!: Table;

	request: Monitoramento_Request = new Monitoramento_Request;

	PseudoEvento = PseudoEvento;
	Dashboard_Item_Status = Monitoramento_Item_Status;
	FilterMatchMode = FilterMatchMode;

	loadingRequests = new EventEmitter<number>();
	hoje = new Date;
	height = 'flex';
	subscription: Subscription[] = [];

	ref: DynamicDialogRef | undefined;

	filterStatus = [
		{ label: 'Todos', value: null, styleClass: 'pi pi-bars' },
		{ label: Monitoramento_Item_Status.Cancelada, value: Monitoramento_Item_Status.Cancelada, styleClass: 'surface-800' },
		{ label: Monitoramento_Item_Status.Feriado, value: Monitoramento_Item_Status.Feriado, styleClass: 'bg-red-600' },
		{ label: Monitoramento_Item_Status.ReposicaoAgendada, value: Monitoramento_Item_Status.ReposicaoAgendada, styleClass: 'bg-purple-500' },
		{ label: Monitoramento_Item_Status.FaltaReposicao, value: Monitoramento_Item_Status.FaltaReposicao, styleClass: 'bg-blue-600' },
		{ label: Monitoramento_Item_Status.FaltaAula, value: Monitoramento_Item_Status.FaltaAula, styleClass: 'bg-red-500' },
		{ label: Monitoramento_Item_Status.FaltaAgendada, value: Monitoramento_Item_Status.FaltaAgendada, styleClass: 'bg-red-500' },
		{ label: Monitoramento_Item_Status.PresenteReposicao, value: Monitoramento_Item_Status.PresenteReposicao, styleClass: 'bg-green-300' },
		{ label: Monitoramento_Item_Status.PresenteNaAula, value: Monitoramento_Item_Status.PresenteNaAula, styleClass: 'bg-green-500' },
		{ label: Monitoramento_Item_Status.Aula, value: Monitoramento_Item_Status.Aula, styleClass: 'surface-200' },
	]


	constructor(
		private mensagemWhatsapp: MensagemWhatsapp,
		private service: MonitoramentoService,
		private crypto: Crypto,
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private dialogService: DialogService,
		private calendarioUtils: CalendarioUtils,
	) {
		let calendarioReload = this.service.onReload.subscribe(res => {
			console.log('onReload', res)
			this.update();
		});
		this.subscription.push(calendarioReload);
	}

	ngOnDestroy(): void {
		this.subscription.forEach(item => item.unsubscribe());
	}

	randomDate(start: Date, end: Date) {
		return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
	}

	getTextColor(color: string) {
		return this.calendarioUtils.getTextColor(color)
	}

	calculaAlunosMesmaTurma(turma_Id: number) {
		let alunos = this.alunos.filter(x => x.turma_Id == turma_Id);
		let soma = alunos.length;

		if (soma == 0) {
			return 'Nenhum aluno'
		}
		else if (soma == 1) {
			return '1 aluno'
		} else {

			return soma + ' alunos';
		}
	}

	onLoading() {
		let container = document.querySelectorAll('.p-datatable-table-container')[0] as HTMLElement;
		container.scrollLeft = 0;

		this.loading = true;
		this.mesesAno = Array.from({ length: 12 }, (v, i) => {
			return {
				mes: i,
				mesString: moment().month(i).format('MMMM'),
				roteiros: Array.from({ length: 4 }, (vv, ii) => {
					let dia = new Date(this.request.ano, i, 1);
					let inicio = moment(dia).add(ii, 'week').startOf('week')
					let fim = moment(dia).add(ii, 'week').endOf('week')
					return {
						id: -1,
						semana: moment(inicio).week(),
						tema: 'Carregando...',
						dataInicio: inicio.toDate(),
						dataFim: fim.toDate(),
					} as Monitoramento_Roteiro;
				})
			} as Monitoramento_Mes;
		})
		this.alunos = [];
	}

	update() {
		console.log('update');
		this.onLoading();

		this.setDashboard();
	}

	setDashboard() {
		this.loading = true;
		lastValueFrom(this.service.getDashboard(this.request))
			.then(res => {
				// Seta meses do ano
				this.mesesAno = res.mesesRoteiro;
				this.alunos = res.alunos.sort((x, y) => {
					let a = x.turma == y.turma ? 0 :
						x.turma == 'Indefinido' ? 1 :
							y.turma == 'Indefinido' ? -1 :
								x.turma < y.turma ? -1 :
									x.turma > y.turma ? 1 : 0;
					return a;
				});

				this.loading = false;
				setTimeout(() => {
					let container = document.querySelectorAll('.p-datatable-table-container')[0] as HTMLElement;
					let tr = document.querySelectorAll(`th[data-mes="${(new Date().getMonth())}"]`)[0] as HTMLElement
					container.scrollLeft = tr.offsetLeft - tr.offsetWidth;
				}, 2000);
			})
	}

	customSort(event: SortEvent) {
		event.data?.sort((x, y) => {
			let a = x.turma == y.turma ? 0 :
				x.turma == 'Indefinido' ? 1 :
					y.turma == 'Indefinido' ? -1 :
						x.turma < y.turma ? -1 :
							x.turma > y.turma ? 1 : 0;
			return a;
		});
	}

	enviarMensagem(aluno: Monitoramento_Aluno) {
		let object = this.mensagemWhatsapp.enviarMensagem(aluno.nome, aluno.celular);
		window.open(object.link, '_blank');
		this.mensagemWhatsapp.copiarMensagem(object.mensagem);
	}

	showAula(item: Monitoramento_Aluno_Item, aluno: Monitoramento_Aluno) {
		this.ref = this.dialogService.open(AulaParticipacaoComponent, {
			header: 'Aula',
			showHeader: false,
			closable: true,
			maximizable: false,
			closeOnEscape: true,
			draggable: true,
			dismissableMask: true,
			duplicate: true,
			modal: true,
			width: '95vw',
			style: {
				maxWidth: '600px',
			},
			data: {
				aluno: aluno,
				item: item,
			}
		});
	}


	goToAluno(aluno: Aluno) {
		return ['alunos', this.crypto.encrypt(aluno.id)]
	}

	closePopoverRoteiro() {
		this.popoverRoteiro.forEach((item: Popover) => {
			item.hide();
		})
	}

	ehAniversario(data: Date, dataNascimento?: Date) {
		if (!dataNascimento) {
			return false;
		} else {
			return moment(data).week() == moment(dataNascimento).week();
		}
	}

	getIdade(data: Date, dataNascimento: Date) {
		return moment(data).diff(dataNascimento, 'years');
	}

	applyFilter(request: Monitoramento_Request) {
		this.request = request;
		this.update();
	}

	filtrarStatus(value: Monitoramento_Item_Status | null, roteiro: Monitoramento_Roteiro, table: Table) {
		// let alunosFiltered = this.alunos.filter(aluno => {
		//     let item = aluno.aulas.find(x => x.roteiro.id == roteiro.id
		//         && moment(x.roteiro.dataInicio).isSame(roteiro.dataInicio, 'date')
		//         && moment(x.roteiro.dataFim).isSame(roteiro.dataFim, 'date')
		//         && x.roteiro.semana == roteiro.semana)

		//     if (!value) {
		//         return true;
		//     }

		//     if (!item) {
		//         return false;
		//     }

		//     if (item.status === value && item.show) {
		//         return true;
		//     }

		//     return false;
		// });

		// table.filteredValue = alunosFiltered;
	}
		
		showAluno(aluno: Monitoramento_Aluno) {
			showAluno(aluno.id, this.dialogService);
		}


}
