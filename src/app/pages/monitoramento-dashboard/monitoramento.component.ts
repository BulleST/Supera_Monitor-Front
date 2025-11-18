import { AfterViewInit, Component, ElementRef, EventEmitter, OnDestroy, QueryList, ViewChild, ViewChildren } from '@angular/core';
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
import { showAluno } from '../../utils/show-aluno';
import { ToastrService } from 'ngx-toastr';
import $ from 'jquery';
import { Router } from '@angular/router';

@Component({
	selector: 'app-monitoramento',
	standalone: false,
	templateUrl: './monitoramento.component.html',
	styleUrl: './monitoramento.component.css',
	providers: [ConfirmationService, DialogService],

})
export class MonitoramentoComponent implements OnDestroy, AfterViewInit {
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
	Monitoramento_Item_Status = Monitoramento_Item_Status;
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
		{ label: Monitoramento_Item_Status.ReposicaoDesmarcada, value: Monitoramento_Item_Status.ReposicaoDesmarcada, styleClass: 'bg-purple-800' },
		{ label: Monitoramento_Item_Status.FaltaReposicao, value: Monitoramento_Item_Status.FaltaReposicao, styleClass: 'bg-blue-500' },
		{ label: Monitoramento_Item_Status.FaltaAula, value: Monitoramento_Item_Status.FaltaAula, styleClass: 'bg-red-500' },
		{ label: Monitoramento_Item_Status.FaltaAgendada, value: Monitoramento_Item_Status.FaltaAgendada, styleClass: 'bg-red-200' },
		{ label: Monitoramento_Item_Status.PresenteReposicao, value: Monitoramento_Item_Status.PresenteReposicao, styleClass: 'bg-green-300' },
		{ label: Monitoramento_Item_Status.PresenteNaAula, value: Monitoramento_Item_Status.PresenteNaAula, styleClass: 'bg-green-500' },
		{ label: Monitoramento_Item_Status.PrimeiraAula, value: Monitoramento_Item_Status.PrimeiraAula, styleClass: 'bg-pink-500' },
		{ label: Monitoramento_Item_Status.Aula, value: Monitoramento_Item_Status.Aula, styleClass: 'surface-200' },
	]


	constructor(
		private router: Router,
		private mensagemWhatsapp: MensagemWhatsapp,
		private service: MonitoramentoService,
		private crypto: Crypto,
		private toastr: ToastrService,
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

	ngAfterViewInit(): void {
		this.scrollView();
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

				// this.scrollView();
				this.loading = false;
			})
			.catch(res => {
				this.loading = false;
				this.toastr.error('Não foi possível carregar monitoramento', 'Erro')
			})
	}

	scrollView() {
		setTimeout(() => {
			let container = $('.p-datatable-table-container')
			console.log(container)
			// let tr = $(`th[data-mes="${(new Date().getMonth())}"]`)
			let tr = document.querySelectorAll(`th[data-mes="${(new Date().getMonth())}"]`)[0] as HTMLElement
			console.log(tr)

			let left = $(tr).offset()?.left ?? 0
			console.log(left)
			$(container).animate({
				scrollLeft: left
			}, 800);
		}, 200);
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
		this.router.navigate(['monitoramento', 'aula'])
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

		let alunosFiltered = this.alunos.filter(aluno => {

			let item;

			if (!value) {
				return true;
			}

			else if (value == Monitoramento_Item_Status.PrimeiraAula) {

				item = aluno.items.filter(x => {
					var primeiraAula = aluno.primeiraAula_Id == x.id;
					var data = x.reposicaoPara ? x.reposicaoPara.aula.data : x.aula.aula.data;
					var intervalo = moment(data).isBetween(roteiro.dataInicio, roteiro.dataFim, 'date', '[]')
					return primeiraAula && intervalo;
				})
			}
			else {
				item = aluno.items.filter(x => {
					var statusIgual = x.status == value;
					var data = x.reposicaoPara ? x.reposicaoPara.aula.data : x.aula.aula.data;
					var intervalo = moment(data).isBetween(roteiro.dataInicio, roteiro.dataFim, 'date', '[]');
					return statusIgual && intervalo
				})
			}

			if (item.length > 0) {
				return true
			}

			return false;
		});

		table.filteredValue = alunosFiltered;
	}

	showAluno(aluno: Monitoramento_Aluno) {
		showAluno(this.dialogService, aluno.id);
	}


}
