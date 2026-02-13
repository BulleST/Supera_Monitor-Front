import { Component } from '@angular/core';
import { JornadaSupera_List_Aluno, JornadaSupera_List_Checklist, JornadaSupera_List_Checklist_Item_Aluno } from '../../../models/jornada-supera-list.model';
import { Aluno } from '../../../models/alunos.model';
import { DialogService, DynamicDialogComponent, DynamicDialogRef } from 'primeng/dynamicdialog';
import { lastValueFrom, Subscription } from 'rxjs';
import { JornadaSuperaService } from '../../../services/jornada-supera.service';
import { ToastrService } from 'ngx-toastr';
import { JornadaSuperaStatus } from '../../../models/jornada-supera-status.model';
import moment from 'moment';
import { AlunoChecklistDetalhesView } from '../aluno-checklist-detalhes/aluno-checklist-detalhes.component';
import { showChecklistDetalhes } from '../../../utils/show-aluno-checklist-detalhes';
import { FinalizarChecklistComponentView } from '../finalizar-checklist/finalizar-checklist.component';
import { showFinalizarChecklist } from '../../../utils/show-finalizar-checklist';
import { MensagemWhatsapp } from '../../../utils';
import { showAlunoJornada } from '../../../utils/show-aluno-checklist-items-list';

@Component({
	selector: 'app-aluno-jornada',
	standalone: false,
	templateUrl: './aluno-jornada.component.html',
	styleUrl: './aluno-jornada.component.css'
})
export class AlunoJornadaComponent {

	instance: DynamicDialogComponent | undefined;
	loading = false;
	maximized = false;

	view = new AlunoChecklistItemListView;
	aluno!: Aluno;
	aluno_Id: number = 0

	jornada!: JornadaSupera_List_Aluno;
	jornadaAtual?: JornadaSupera_List_Checklist;
	jornadaAtualNome = '';
	jornadaAtualIcon = '';
	jornadaAtualItemsFinalizados = '';

	activeIndex: number = undefined as any;

	JornadaSuperaStatus = JornadaSuperaStatus
	subscription: Subscription[] = [];

	constructor(
		private dialogService: DialogService,
		private ref: DynamicDialogRef,
		private toastr: ToastrService,
		private mensagemWhatsapp: MensagemWhatsapp,
		private jornadaSuperaService: JornadaSuperaService,


	) {

		this.instance = this.dialogService.getInstance(this.ref);

			let onReload = this.jornadaSuperaService.onReload.subscribe(res => this.loadJornada());
		this.subscription.push(onReload);
	}

	ngOnInit(): void {
		if (this.instance && this.instance.data) {
			this.view = this.instance.data['view'];
			this.aluno = this.view.aluno;
			this.aluno_Id = this.view.aluno_Id;

			if (this.view.jornada) {
				this.jornada = this.view.jornada
				this.setJornadaAtual();
			}
			else {
				this.loadJornada();
			}

		}
	}

	close(finalizado: boolean) {
		this.subscription.forEach(item => item.unsubscribe());
		this.ref.close(finalizado);
	}

	maximize() {
		this.maximized = !this.maximized;
		this.instance!.maximize();
	}

	async loadJornada() {
		if (!this.aluno_Id) {
			return;
		}
		this.loading = true;
		return lastValueFrom(this.jornadaSuperaService.getJornadaAluno(this.aluno_Id))
			.then(res => {
				this.loading = false;
				this.jornada = res;
				console.log('jornada', this.jornada)
				this.setJornadaAtual();
			})
			.catch(res => {
				this.loading = false;
				this.toastr.error('Não foi possível carregar checklist do aluno');
			})
	}

	setJornadaAtual() {
		if (!this.aluno || !this.jornada) {
			return;
		}
		if (this.activeIndex)

		this.jornadaAtual = this.jornada.checklists.find(x => x.id == this.aluno.checklist_Id);

		const prazoFinal90Dias = moment(this.aluno.created).add(90, 'days');

		if (prazoFinal90Dias.isBefore(new Date, 'date')) {
			this.jornadaAtualNome = '90 dias encerrados';

			if (this.jornada.checklists.find(x => x.status == JornadaSuperaStatus.Atrasado)) {
				this.jornadaAtualNome = '90 dias encerrados com pendências';
			}
			else if (this.jornada.checklists.find(x => x.status == JornadaSuperaStatus.FinalizadoComAtraso)) {
				this.jornadaAtualNome = '90 dias encerrados com atraso';
			}
			this.jornadaAtualIcon = 'pi pi-times-circle text-red-500';
			if (!this.activeIndex) {
				this.activeIndex = this.jornada.checklists[this.jornada.checklists.length - 1].id;
			}
		}
		else {
			if (this.jornadaAtual) {
				const finalizados = this.jornadaAtual.items.filter(x => x.finalizado).length;
				const total = this.jornadaAtual.items.length;
				this.jornadaAtualNome = this.jornadaAtual.nome;
				this.jornadaAtualIcon = 'pi pi-exclamation-triangle text-orange-500';
				this.jornadaAtualItemsFinalizados = `${finalizados} / ${total}`;
				this.activeIndex = this.jornadaAtual.id;

			}
		}
		console.log('jornadaAtual', this.jornadaAtual)
	}

	showChecklistDetalhes(item: JornadaSupera_List_Checklist_Item_Aluno, checklist: JornadaSupera_List_Checklist) {
		console.log('showChecklistDetalhes');
		console.log('item', item);
		console.log('checklist', checklist);
		let view: AlunoChecklistDetalhesView = {
			alunoChecklistItemId: item.id,

			checklist: checklist.nome,
			checklistId: checklist.id,

			checklistItem: item.checklist_Item,
			checklistItemId: item.checklist_Item_Id,

			prazo: item.prazo,
			dataFinalizacao: item.dataFinalizacao,
			account: item.account,
			observacoes: item.observacoes,
			evento_Id: item.evento_Id,

			aluno_Id: this.aluno.id,
			aluno: this.aluno.nome,
			celular: this.aluno.celular,
			turma: this.aluno.turma,
			corLegenda: this.aluno.corLegenda,

		}
		showChecklistDetalhes(this.dialogService, view);
	}

	finalizarChecklist(item: JornadaSupera_List_Checklist_Item_Aluno, checklist: JornadaSupera_List_Checklist) {

		var view: FinalizarChecklistComponentView = {
			alunoId: this.aluno.id,
			alunoChecklistItemId: item.id,
			checklistItemId: item.checklist_Item_Id,
			checklistId: checklist.id,

			checklistItem: item.checklist_Item,
			aluno: this.aluno.nome,
			turma: this.aluno.turma,
			corLegenda: this.aluno.corLegenda,
			celular: this.aluno.celular,
			prazo: item.prazo,
			status: item.status,
		}

		let ref = showFinalizarChecklist(this.dialogService, view);

		let onClose = ref.onClose.subscribe(res => item.finalizado = res);
		this.subscription.push(onClose);
	}

	enviarMensagemCondicao(item: JornadaSupera_List_Checklist_Item_Aluno) {
		this.mensagemWhatsapp.enviarMensagemJornadaSupera(this.aluno.nome, item.checklist_Item_Id);
	}
}


export class AlunoChecklistItemListView {
	aluno_Id: number = 0;
	aluno: Aluno = new Aluno;
	jornada?: JornadaSupera_List_Aluno;
}