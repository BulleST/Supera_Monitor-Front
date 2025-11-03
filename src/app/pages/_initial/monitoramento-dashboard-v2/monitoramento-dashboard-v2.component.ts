import { Component, ElementRef, EventEmitter, OnDestroy, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ConfirmationService, FilterMatchMode, SortEvent } from 'primeng/api';
import { lastValueFrom, Subscription } from 'rxjs';
import { Aluno } from '../../../models/alunos.model';
import { MensagemWhatsapp } from '../../../utils/mensagem-whatsapp';
import { Popover } from 'primeng/popover';
import { PseudoEvento } from '../../../models/reposicao.model';
import { CalendarioUtils, Crypto } from '../../../utils';
import moment from 'moment';
import 'moment/locale/pt-br';
import { Table } from 'primeng/table';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DashboardService } from '../../../services/dashboard.service';
import { Dashboard_Aluno, Dashboard_Aluno_Aula_Reposicao, Dashboard_Item_Status, Dashboard_Mes, Dashboard_Request, Dashboard_Roteiro } from '../../../models/dashboard-v2.model';
import { AulaParticipacaoComponent } from './aula-participacao/aula-participacao.component';

@Component({
	selector: 'app-monitoramento-dashboard-v2',
	standalone: false,
	templateUrl: './monitoramento-dashboard-v2.component.html',
	styleUrl: './monitoramento-dashboard-v2.component.css',
	providers: [ConfirmationService, DialogService],
})
export class MonitoramentoDashboardV2Component implements OnDestroy {
	alunos: Dashboard_Aluno[] = [];
	loading = false;
	mesesAno: Dashboard_Mes[] = [];
	meses: string[] = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];


	@ViewChildren('popoverSelectedAlunoAula') popoverSelectedAlunoAula!: QueryList<Popover>;
	@ViewChildren('popoverRoteiro') popoverRoteiro!: QueryList<Popover>;

	@ViewChild('toolbar') toolbar!: ElementRef;
	@ViewChild('dt') dt!: Table;

	request: Dashboard_Request = new Dashboard_Request;

	PseudoEvento = PseudoEvento;
	Dashboard_Item_Status = Dashboard_Item_Status;
	FilterMatchMode = FilterMatchMode;

	loadingRequests = new EventEmitter<number>();
	hoje = new Date;
	height = 'flex';
	subscription: Subscription[] = [];

	ref: DynamicDialogRef | undefined;

	filterStatus = [
		{ label: 'Todos', value: null, styleClass: 'pi pi-bars' },
		{ label: Dashboard_Item_Status.Cancelada, value: Dashboard_Item_Status.Cancelada, styleClass: 'surface-800' },
		{ label: Dashboard_Item_Status.Feriado, value: Dashboard_Item_Status.Feriado, styleClass: 'bg-red-600' },
		{ label: Dashboard_Item_Status.ReposicaoAgendada, value: Dashboard_Item_Status.ReposicaoAgendada, styleClass: 'bg-purple-500' },
		{ label: Dashboard_Item_Status.FaltaReposicao, value: Dashboard_Item_Status.FaltaReposicao, styleClass: 'bg-blue-600' },
		{ label: Dashboard_Item_Status.FaltaAula, value: Dashboard_Item_Status.FaltaAula, styleClass: 'bg-red-500' },
		{ label: Dashboard_Item_Status.FaltaAgendada, value: Dashboard_Item_Status.FaltaAgendada, styleClass: 'bg-red-500' },
		{ label: Dashboard_Item_Status.PresenteReposicao, value: Dashboard_Item_Status.PresenteReposicao, styleClass: 'bg-green-300' },
		{ label: Dashboard_Item_Status.PresenteNaAula, value: Dashboard_Item_Status.PresenteNaAula, styleClass: 'bg-green-500' },
		{ label: Dashboard_Item_Status.Aula, value: Dashboard_Item_Status.Aula, styleClass: 'surface-200' },
	]


	constructor(
		private mensagemWhatsapp: MensagemWhatsapp,
		private service: DashboardService,
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
		console.log('onLoading')
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
					} as Dashboard_Roteiro;
				})
			} as Dashboard_Mes;
		})
		this.alunos = [];
	}

	update() {
		console.log('update');
		this.onLoading();
		setTimeout(() => {
			let container = document.querySelectorAll('.p-datatable-table-container')[0] as HTMLElement;
			let tr = document.querySelectorAll(`th[data-mes="${(new Date().getMonth())}"]`)[0] as HTMLElement
			container.scrollLeft = tr.offsetLeft - tr.offsetWidth;
		}, 2000);

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

	enviarMensagem(aluno: Dashboard_Aluno) {
		let object = this.mensagemWhatsapp.enviarMensagem(aluno.nome, aluno.celular);
		window.open(object.link, '_blank');
		this.mensagemWhatsapp.copiarMensagem(object.mensagem);
	}

	showAula(item: Dashboard_Aluno_Aula_Reposicao, aluno: Dashboard_Aluno) {
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

	applyFilter(request: Dashboard_Request) {
		this.request = request;
		this.update();
	}

	filtrarStatus(value: Dashboard_Item_Status | null, roteiro: Dashboard_Roteiro, table: Table) {
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


}
